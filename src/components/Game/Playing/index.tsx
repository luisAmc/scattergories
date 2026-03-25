import { ANSWER_PLACEHOLDERS } from "~/utils/constants";
import { Category, GamePhase } from "~/supabase/types";
import { FieldError, Form, useZodForm } from "~/components/shared/Form";
import { Input } from "~/components/shared/Input";
import { supabase } from "~/supabase/client";
import { Timer, TimerWatermark } from "./Timer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGameContext } from "~/hooks/useGameContext";
import { usePlayerPresence } from "~/hooks/usePlayerPresence";
import { useTimeLeft } from "~/hooks/useTimeLeft";
import z from "zod";
import { Button } from "~/components/shared/Button";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircleIcon } from "lucide-react";

function generateAnswersFormSchema(categories: Category[]) {
    const shape: Record<string, z.ZodType<string | undefined>> = {};

    for (const category of categories) {
        shape[category.id] = z.string().optional();
    }

    return z.object(shape);
}

export function Playing() {
    const { game, me, answers, categories, amIHost } = useGameContext();

    if (!game) {
        return null;
    }

    const timeLeft = useTimeLeft();

    const [savingAnswers, setSavingAnswers] = useState<Record<string, boolean>>(
        {},
    );

    const hasPrefilledAnswers = useRef(false);

    const roundCategories = useMemo(() => {
        const selectedCategories = game.round_category_ids
            .map((categoryId) => {
                return categories.find(
                    (category) => category.id === categoryId,
                );
            })
            .filter(Boolean) as typeof categories;

        return selectedCategories;
    }, [categories, game.round_category_ids]);

    const randomAnswerPlaceholder = useMemo(() => {
        const placeholders = roundCategories.map(() =>
            gerRandomAnswerPlaceholder(),
        );

        return placeholders;
    }, [roundCategories]);

    useEffect(() => {
        if (
            timeLeft === null ||
            timeLeft.minutes !== 0 ||
            timeLeft.seconds !== 0
        ) {
            return;
        }

        const answers = answersForm.getValues();

        Object.entries(answers).forEach(([categoryId, value]) => {
            saveAnswer(categoryId, value ?? "");
        });

        if (amIHost) {
            const moveGameToVoting = async () => {
                await supabase
                    .from("games")
                    .update({
                        phase: GamePhase.VOTING,
                        voting_category_index: 0,
                    })
                    .eq("id", game.id);
            };

            moveGameToVoting();
        }
    }, [amIHost, timeLeft, game.id]);

    const { playersInCategory, setCurrentCategory } = usePlayerPresence();

    const answersForm = useZodForm({
        schema: generateAnswersFormSchema(roundCategories),
    });

    useEffect(() => {
        if (!answers || hasPrefilledAnswers.current) {
            return;
        }

        const playerAnswers = answers.filter(
            (answer) => answer.player_id === me?.id,
        );

        if (playerAnswers.length === 0) {
            return;
        }

        hasPrefilledAnswers.current = true;

        answersForm.reset(
            playerAnswers.reduce((acc, answer) => {
                return {
                    ...acc,
                    [answer.category_id]: answer.value ?? "",
                };
            }, {}),
        );
    }, [answers, answersForm, me?.id]);

    const saveAnswer = useCallback(
        async (categoryId: string, text: string) => {
            setSavingAnswers((prev) => ({ ...prev, [categoryId]: true }));

            const safeText = text.trim();

            if (!safeText) {
                return;
            }

            await supabase.from("answers").upsert(
                {
                    game_id: game.id,
                    player_id: me?.id,
                    category_id: categoryId,
                    round_number: game.round_number,
                    value: safeText,
                },
                {
                    onConflict: "game_id, player_id, category_id, round_number",
                },
            );

            setSavingAnswers((prev) => ({ ...prev, [categoryId]: false }));
        },
        [game.id, me?.id, roundCategories, game.round_number],
    );

    async function saveAllAnswers() {
        const answers = answersForm.getValues();

        await Promise.all(
            Object.entries(answers).map(async ([categoryId, value]) => {
                if (value?.trim()) {
                    setSavingAnswers((prev) => ({
                        ...prev,
                        [categoryId]: true,
                    }));

                    await saveAnswer(categoryId, value.trim());

                    setSavingAnswers((prev) => ({
                        ...prev,
                        [categoryId]: false,
                    }));
                }
            }),
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="playing-round"
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-background/5 border-foreground sticky top-0 z-10 -mx-4 -mt-8 border-b-2 backdrop-blur">
                    <div className="divide-foreground grid grid-cols-3 divide-x-2">
                        <div className="col-span-2 grid place-items-center py-6">
                            <span className="border-foreground flex size-24 items-center justify-center rounded-full border-3 font-mono text-7xl">
                                {game.letter}
                            </span>
                        </div>

                        <div className="grid place-items-center">
                            <div className="flex flex-col justify-center gap-y-2">
                                <Timer timeLeft={timeLeft} />

                                <div className="text-foreground bg-foreground/5 rounded px-2 py-1 text-center text-xs">
                                    Ronda {game.round_number}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Instructions />

                <Form form={answersForm} onSubmit={() => {}}>
                    <div className="flex flex-col gap-y-4">
                        {roundCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: index * 0.1,
                                }}
                                className="flex flex-col gap-y-2"
                            >
                                <div className="flex items-center gap-x-2">
                                    <span className="text-foreground/60 text-sm">
                                        {(index + 1)
                                            .toString()
                                            .padStart(2, "0")}
                                        .
                                    </span>

                                    <span className="text-sm">
                                        {category.name}
                                    </span>

                                    {playersInCategory[category.id]?.map(
                                        (playerPresence) => (
                                            <div
                                                key={playerPresence.playerId}
                                                className="bg-accent text-accent-foreground inline-flex items-center justify-center border-2 px-1 text-xs font-medium"
                                            >
                                                {playerPresence.playerName}
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="relative">
                                    <Input
                                        {...answersForm.register(category.id)}
                                        placeholder={
                                            randomAnswerPlaceholder[index]
                                        }
                                        className="placeholder:text-xs"
                                        onFocus={() =>
                                            setCurrentCategory(category.id)
                                        }
                                        onBlur={(e) => {
                                            setCurrentCategory(null);
                                            saveAnswer(
                                                category.id,
                                                e.target.value,
                                            );
                                        }}
                                    />

                                    {savingAnswers[category.id] && (
                                        <div className="absolute top-1/2 right-2 -translate-y-1/2">
                                            <LoaderCircleIcon className="text-foreground/60 size-4 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <FieldError name={category.id} />
                            </motion.div>
                        ))}

                        <motion.div
                            key="save-answers-button"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: 0.5,
                            }}
                            className="flex flex-col"
                        >
                            <Button
                                disabled={Object.values(savingAnswers).some(
                                    Boolean,
                                )}
                                loading={Object.values(savingAnswers).some(
                                    Boolean,
                                )}
                                onClick={saveAllAnswers}
                            >
                                <span>Guardar respuestas</span>
                            </Button>
                        </motion.div>
                    </div>
                </Form>

                <TimerWatermark timeLeft={timeLeft} />
            </motion.div>
        </AnimatePresence>
    );
}

function gerRandomAnswerPlaceholder() {
    return ANSWER_PLACEHOLDERS[
        Math.floor(Math.random() * ANSWER_PLACEHOLDERS.length)
    ];
}

function Instructions() {
    const { game } = useGameContext();

    if (!game) {
        return null;
    }

    return (
        <p className="text-foreground/60 text-sm text-pretty">
            Responde a cada categoría con una palabra o frase que comience con
            la letra "{game.letter}".
        </p>
    );
}
