import { useGameContext } from "~/hooks/useGameContext";
import { supabase } from "~/supabase/client";
import { GamePhase } from "~/supabase/types";
import { useState } from "react";
import { generateRandomLetter } from "~/utils/generateRandomLetter";
import { Header as LobbyHeader } from "../Lobby";
import { Button } from "~/components/shared/Button";
import { TimerIcon, RefreshCcwIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FieldError, Form, useZodForm } from "~/components/shared/Form";
import z from "zod";
import { Input } from "~/components/shared/Input";
import { SubmitButton } from "~/components/shared/SubmitButton";
import { ONE_SECOND_IN_MS } from "~/utils/constants";

const changeLetterFormSchema = z.object({
    letter: z.string().min(1, "Ingrese una letra."),
});

export function Preparing() {
    const { game, amIHost } = useGameContext();

    const [isChangingLetter, setIsChangingLetter] = useState(false);
    const [movingToPlaying, setMovingToPlaying] = useState(false);

    const changeLetterForm = useZodForm({
        schema: changeLetterFormSchema,
    });

    async function changeToLetter(
        input: z.infer<typeof changeLetterFormSchema>,
    ) {
        if (!game || isChangingLetter) {
            return;
        }

        setIsChangingLetter(true);

        const letter = input.letter.trim().toUpperCase();

        await supabase
            .from("games")
            .update({ letter: letter })
            .eq("id", game.id);

        setIsChangingLetter(false);
    }

    async function changeToRandomLetter() {
        if (!game || isChangingLetter) {
            return;
        }

        setIsChangingLetter(true);

        const newLetter = generateRandomLetter();

        await supabase
            .from("games")
            .update({
                letter: newLetter,
            })
            .eq("id", game?.id);

        setIsChangingLetter(false);
    }

    async function moveToPlaying() {
        if (!game || movingToPlaying) {
            return;
        }

        setMovingToPlaying(true);

        const roundDurationMs = game.round_duration_seconds * ONE_SECOND_IN_MS;
        const endsAt = new Date(Date.now() + roundDurationMs).toISOString();

        await supabase
            .from("games")
            .update({
                phase: GamePhase.PLAYING,
                ends_at: endsAt,
            })
            .eq("id", game.id);

        setMovingToPlaying(false);
    }

    return (
        <div className="flex flex-col gap-y-6">
            <LobbyHeader />

            <div className="bg-primary/5 mt-4 flex flex-col gap-y-4 rounded p-4">
                <LetterTag letter={game?.letter} />

                {amIHost && (
                    <div className="flex flex-col gap-y-4">
                        <Form form={changeLetterForm} onSubmit={changeToLetter}>
                            <div className="flex flex-col gap-y-1">
                                <Input
                                    {...changeLetterForm.register("letter")}
                                    label="¿Cuál será la letra de esta ronda?"
                                    placeholder="A, B, C, etc."
                                    className="text-center font-bold tracking-[0.2rem] uppercase placeholder:font-normal placeholder:normal-case"
                                    maxLength={6}
                                />

                                <FieldError name="letter" />
                            </div>

                            <SubmitButton variant="secondary">
                                {changeLetterForm.formState.isSubmitting ? (
                                    <span>Cambiando</span>
                                ) : (
                                    <>
                                        <span>Cambiar</span>
                                        <ArrowRightIcon className="size-4" />
                                    </>
                                )}
                            </SubmitButton>
                        </Form>

                        <div className="text-foreground/60 my-2 flex items-center justify-center gap-x-2">
                            <span>&mdash;</span>
                            <span>o</span>
                            <span>&mdash;</span>
                        </div>

                        <Button
                            variant="outline"
                            loading={isChangingLetter}
                            disabled={isChangingLetter}
                            onClick={changeToRandomLetter}
                        >
                            <span>Cambiar a letra aleatoria</span>
                            <RefreshCcwIcon className="size-4" />
                        </Button>
                    </div>
                )}
            </div>

            {amIHost && (
                <Button
                    loading={movingToPlaying}
                    disabled={movingToPlaying}
                    onClick={moveToPlaying}
                >
                    <span>Iniciar ronda</span>
                    <TimerIcon className="size-4" />
                </Button>
            )}

            {!amIHost && <WaitingForHostMessage />}
        </div>
    );
}

function LetterTag({ letter }: { letter: string | undefined }) {
    return (
        <div className="flex flex-col items-center gap-y-2">
            <div className="text-foreground/60 text-center text-sm">
                La letra de esta ronda será:
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`letter-${letter ?? "-"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-6"
                >
                    <span className="border-foreground flex size-32 items-center justify-center rounded-full border-3 font-mono text-7xl">
                        {letter ?? "-"}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function WaitingForHostMessage() {
    return (
        <p className="text-foreground/60 text-center text-sm">
            Esperando a que el anfitrión inicie la ronda...
        </p>
    );
}
