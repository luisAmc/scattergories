import { Answer, Category, GamePhase, Player } from "~/supabase/types";
import { Button } from "~/components/shared/Button";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    CircleCheckIcon,
    CircleXIcon,
    FlagIcon,
    CircleQuestionMarkIcon,
    SnailIcon,
    XIcon,
    EraserIcon,
    LoaderCircleIcon,
} from "lucide-react";
import { cn } from "~/utils/cn";
import { supabase } from "~/supabase/client";
import { useGameContext } from "~/hooks/useGameContext";
import { useEffect, useMemo, useState } from "react";
import { Header as LobbyHeader } from "../Lobby";
import { AnimatePresence, motion } from "framer-motion";

type AnswerWithFlags = Answer & {
    isValid: boolean;
    isAccepted: boolean;
};

type AnswersByCategory = Map<string, AnswerWithFlags[]>;

export function Voting() {
    const {
        categories,
        players,
        answers,
        game,
        me,
        amIHost,
        answersVotes,
        votesByAnswer,
    } = useGameContext();

    const [goingToNextCategory, setGoingToNextCategory] = useState(false);
    const [goingToPrevCategory, setGoingToPrevCategory] = useState(false);
    const [votesTaken, setVotesTaken] = useState<Record<string, boolean>>({});
    const [loadingVotes, setLoadingVotes] = useState<Record<string, boolean>>(
        {},
    );
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!game || !categories || !Array.isArray(categories)) {
            return;
        }

        const categoryId =
            game.round_category_ids[game.voting_category_index] ?? null;

        setCurrentCategoryId(categoryId);
    }, [game, categories, game?.voting_category_index]);

    useEffect(() => {
        if (answersVotes.length === 0) {
            return;
        }

        const newVotesTaken: Record<string, boolean> = {};

        for (const vote of answersVotes) {
            newVotesTaken[vote.answer_id] = vote.value;
        }

        setVotesTaken(newVotesTaken);
    }, [answersVotes]);

    const categoriesMap = useMemo(() => {
        if (!categories || !Array.isArray(categories)) {
            return new Map() as Map<string, Category>;
        }

        return new Map(categories.map((category) => [category.id, category]));
    }, [categories]);

    const playersMap = useMemo(() => {
        if (!players || !Array.isArray(players)) {
            return new Map() as Map<string, Player>;
        }

        return new Map(players.map((player) => [player.id, player]));
    }, [players]);

    const answersByCategory: AnswersByCategory = useMemo(() => {
        if (!game) {
            return new Map() as AnswersByCategory;
        }

        const byCategory: AnswersByCategory = new Map();

        for (const answer of answers) {
            const safeAnswer = (answer.value?.trim() ?? "").toLowerCase();
            const firstLetter = safeAnswer[0] ?? "";

            const isValidAnswer = firstLetter === game.letter.toLowerCase();

            const prevAnswers = byCategory.get(answer.category_id) ?? [];

            byCategory.set(answer.category_id, [
                ...prevAnswers,
                { ...answer, isValid: isValidAnswer, isAccepted: true },
            ]);
        }

        return byCategory;
    }, [answers, game?.letter]);

    async function voteAnswer(answerId: string, value: boolean) {
        const isSameVote = votesTaken[answerId] === value;

        if (isSameVote) {
            return;
        }

        setLoadingVotes((prev) => ({ ...prev, [answerId]: true }));

        const newVotesTaken = { ...votesTaken, [answerId]: value };
        setVotesTaken(newVotesTaken);

        await supabase.from("answer_votes").upsert(
            {
                answer_id: answerId,
                voter_player_id: me?.id,
                value,
            },
            {
                onConflict: "answer_id, voter_player_id",
            },
        );

        setLoadingVotes((prev) => ({ ...prev, [answerId]: false }));
    }

    async function removeVote(answerId: string) {
        console.log("removeVote", votesTaken);

        const isUnvoted = votesTaken[answerId] === undefined;

        if (isUnvoted) {
            return;
        }

        setLoadingVotes((prev) => ({ ...prev, [answerId]: true }));

        const updatedVotesTaken = { ...votesTaken };
        delete updatedVotesTaken[answerId];
        setVotesTaken(updatedVotesTaken);

        await supabase
            .from("answer_votes")
            .delete()
            .eq("answer_id", answerId)
            .eq("voter_player_id", me?.id);

        setLoadingVotes((prev) => ({ ...prev, [answerId]: false }));
    }

    const isLastCategory =
        game?.voting_category_index ===
        (game?.round_category_ids.length ?? 0) - 1;

    async function goToNextCategory() {
        if (!amIHost || !game || goingToNextCategory) {
            return;
        }

        setGoingToNextCategory(true);

        if (isLastCategory) {
            await supabase
                .from("games")
                .update({ phase: GamePhase.RESULTS, voting_category_index: 0 })
                .eq("id", game.id);
        } else {
            await supabase
                .from("games")
                .update({
                    voting_category_index: game.voting_category_index + 1,
                })
                .eq("id", game.id);
        }

        setGoingToNextCategory(false);
    }

    async function goToPrevCategory() {
        if (!amIHost || !game || goingToPrevCategory) {
            return;
        }

        setGoingToPrevCategory(true);

        await supabase
            .from("games")
            .update({
                voting_category_index: game.voting_category_index - 1,
            })
            .eq("id", game.id);

        setGoingToPrevCategory(false);
    }

    const currentAnswers = useMemo(() => {
        if (!currentCategoryId) {
            return undefined;
        }

        return answersByCategory
            .get(currentCategoryId)
            ?.sort(
                (a, b) =>
                    playersMap
                        .get(a.player_id)
                        ?.name.localeCompare(
                            playersMap.get(b.player_id)?.name ?? "",
                        ) ?? 0,
            );
    }, [answersByCategory, currentCategoryId]);

    // TODO: Refactor - Separate in components
    return (
        <AnimatePresence mode="wait">
            <div className="flex flex-col gap-y-6">
                <LobbyHeader />

                <div className="space-y-1">
                    <h2 className="flex items-center gap-x-2 text-xl font-medium">
                        <span>Votación de la ronda</span>
                        <span>&mdash;</span>
                        <span>{game?.letter}</span>
                    </h2>
                    <div className="flex flex-col gap-y-2">
                        <p className="text-foreground/60 text-sm text-pretty">
                            Acepta o rechaza las respuestas de los demás
                            jugadores.
                        </p>
                    </div>
                </div>

                <motion.div
                    key="voting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-y-4"
                >
                    <div className="space-y-4">
                        <h2 className="flex items-center justify-between gap-1 border-b px-2">
                            <span className="text-pretty">
                                {
                                    categoriesMap.get(currentCategoryId ?? "")
                                        ?.name
                                }
                            </span>

                            <span className="text-foreground/60 flex items-center gap-x-0.5 text-xs">
                                <span>
                                    {(game?.voting_category_index ?? 0) + 1}
                                </span>
                                <span>de</span>
                                <span>
                                    {game?.round_category_ids.length ?? 0}
                                </span>
                            </span>
                        </h2>

                        <div className="flex flex-col gap-4">
                            {!currentAnswers && <VotingSkeleton />}

                            {currentAnswers &&
                                (currentAnswers.length > 0 ? (
                                    currentAnswers?.map((answer, index) => {
                                        const isMyAnswer =
                                            answer.player_id === me?.id;

                                        const myVote =
                                            votesTaken[answer.id] ??
                                            answersVotes.find(
                                                (vote) =>
                                                    vote.answer_id ===
                                                        answer.id &&
                                                    vote.voter_player_id ===
                                                        me?.id,
                                            )?.value ??
                                            null;

                                        const acceptedVotes =
                                            votesByAnswer[answer.id]
                                                ?.accepted ?? 0;

                                        const rejectedVotes =
                                            votesByAnswer[answer.id]
                                                ?.rejected ?? 0;

                                        const missingVotes =
                                            players.length -
                                            (acceptedVotes + rejectedVotes) -
                                            1;

                                        const points =
                                            acceptedVotes - rejectedVotes;

                                        return (
                                            <motion.div
                                                key={answer.id}
                                                className="flex flex-col gap-1"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.3,
                                                    delay: index * 0.1,
                                                }}
                                            >
                                                <div className="text-foreground/60 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {
                                                                playersMap.get(
                                                                    answer.player_id,
                                                                )?.name
                                                            }
                                                        </span>

                                                        <div className="flex items-center">
                                                            {Array.from({
                                                                length: acceptedVotes,
                                                            }).map((_, i) => (
                                                                <CircleCheckIcon
                                                                    key={`accepted-${i}`}
                                                                    className="animate-in fade-in slide-in-from-bottom-10 zoom-in-50 size-4 fill-green-100 text-green-700 duration-300 ease-in-out"
                                                                />
                                                            ))}

                                                            {Array.from({
                                                                length: rejectedVotes,
                                                            }).map((_, i) => (
                                                                <CircleXIcon
                                                                    key={`rejected-${i}`}
                                                                    className="animate-in fade-in slide-in-from-bottom-10 zoom-in-50 size-4 fill-red-100 text-red-700 duration-300 ease-in-out"
                                                                />
                                                            ))}

                                                            {Array.from({
                                                                length: missingVotes,
                                                            }).map((_, i) => (
                                                                <CircleQuestionMarkIcon
                                                                    key={`missing-${i}`}
                                                                    className="animate-in fade-in slide-in-from-bottom-10 zoom-in-50 size-4 duration-300 ease-in-out"
                                                                />
                                                            ))}
                                                        </div>

                                                        <span className="font-mono">
                                                            {points >= 0
                                                                ? `+${points}`
                                                                : points}
                                                        </span>

                                                        {loadingVotes[
                                                            answer.id
                                                        ] && (
                                                            <LoaderCircleIcon className="text-foreground/60 size-4 animate-spin" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div
                                                    className={cn(
                                                        "bg-foreground/5 flex h-14 items-center justify-between rounded border border-transparent px-4 py-2 text-sm",
                                                        !answer.isValid &&
                                                            "border-red-500",
                                                    )}
                                                >
                                                    <div>{answer.value}</div>

                                                    <div className="flex items-center gap-2">
                                                        {!answer.isValid && (
                                                            <div className="text-red-500">
                                                                Inválido
                                                            </div>
                                                        )}

                                                        {answer.isValid &&
                                                            (isMyAnswer ? (
                                                                <FlagIcon className="fill-primary text-primary size-3" />
                                                            ) : (
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "rounded-full",
                                                                            myVote ===
                                                                                true &&
                                                                                "border-green-700 bg-green-100 text-green-700",
                                                                        )}
                                                                        onClick={async () =>
                                                                            voteAnswer(
                                                                                answer.id,
                                                                                true,
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckIcon className="size-4" />
                                                                    </Button>

                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className={cn(
                                                                            "rounded-full",
                                                                            myVote ===
                                                                                false &&
                                                                                "border-red-700 bg-red-100 text-red-700",
                                                                        )}
                                                                        onClick={async () =>
                                                                            voteAnswer(
                                                                                answer.id,
                                                                                false,
                                                                            )
                                                                        }
                                                                    >
                                                                        <XIcon className="size-4" />
                                                                    </Button>

                                                                    <Button
                                                                        size="icon"
                                                                        variant="outline"
                                                                        className="rounded-full"
                                                                        onClick={async () =>
                                                                            removeVote(
                                                                                answer.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        <EraserIcon className="size-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-foreground/5 flex flex-col items-center gap-y-2 rounded p-8">
                                        <SnailIcon className="text-primary size-20" />

                                        <p className="text-foreground/60 text-center text-sm text-pretty">
                                            No se escribieron respuestas para
                                            esta categoría.
                                        </p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </motion.div>

                {amIHost && (
                    <div className="flex items-center gap-2">
                        <Button
                            disabled={
                                goingToPrevCategory ||
                                game?.voting_category_index === 0
                            }
                            size="icon"
                            variant="secondary"
                            className="w-12"
                            onClick={goToPrevCategory}
                            loading={goingToPrevCategory}
                        >
                            <ArrowLeftIcon className="size-4" />
                        </Button>

                        <Button
                            onClick={goToNextCategory}
                            className="w-full"
                            loading={goingToNextCategory}
                            disabled={goingToNextCategory}
                        >
                            {isLastCategory ? (
                                <>
                                    <span>Ir a resultados</span>
                                </>
                            ) : (
                                <>
                                    <span>Siguiente categoría</span>
                                </>
                            )}

                            <ArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                )}

                {!amIHost && (
                    <p className="text-foreground/60 text-center text-sm text-pretty">
                        El anfitrión avanzará a la siguiente categoría.
                    </p>
                )}
            </div>
        </AnimatePresence>
    );
}

function VotingSkeleton() {
    return (
        <motion.div
            key="voting-skeleton"
            className="flex flex-col gap-y-4"
            exit={{ opacity: 0, y: 10, transition: { duration: 1 } }}
        >
            <div className="space-y-1">
                <div className="flex items-center gap-x-1">
                    <div className="bg-foreground/10 h-4 w-24 rounded"></div>

                    <div className="flex items-center gap-x-0.5">
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                    </div>
                </div>
                <div className="bg-foreground/10 h-14 w-full rounded"></div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-x-1">
                    <div className="bg-foreground/10 h-4 w-24 rounded"></div>

                    <div className="flex items-center gap-x-0.5">
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                    </div>
                </div>
                <div className="bg-foreground/10 h-14 w-full rounded"></div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center gap-x-1">
                    <div className="bg-foreground/10 h-4 w-24 rounded"></div>

                    <div className="flex items-center gap-x-0.5">
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                        <div className="bg-foreground/10 size-4 rounded-full"></div>
                    </div>
                </div>
                <div className="bg-foreground/10 h-14 w-full rounded"></div>
            </div>
        </motion.div>
    );
}
