import { useAnswersVotes } from "~/hooks/useAnswersVotes";
import { Header as LobbyHeader } from "../Lobby";
import { useGameContext } from "~/hooks/useGameContext";
import { useEffect, useMemo, useState } from "react";
import { GamePhase, Player } from "~/supabase/types";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/utils/cn";
import { BalloonIcon, CheckIcon, CrownIcon, MedalIcon } from "lucide-react";
import { supabase } from "~/supabase/client";
import { Button } from "~/components/shared/Button";

export function Results() {
    const { amIHost, game, players, answers } = useGameContext();
    const { answersVotes, votesByAnswer } = useAnswersVotes();

    const [playersList, setPlayersList] = useState<Player[]>([]);
    const [showMedals, setShowMedals] = useState(false);
    const [goingToFinished, setGoingToFinished] = useState(false);

    useEffect(() => {
        if (!players || !Array.isArray(players)) {
            return;
        }

        setPlayersList(players.sort((a, b) => a.score - b.score));
    }, [players]);

    const votesByPlayer = useMemo(() => {
        if (
            !answersVotes ||
            answersVotes.length === 0 ||
            !votesByAnswer ||
            Object.keys(votesByAnswer).length === 0
        ) {
            return null;
        }

        const byPlayer: Record<string, number> = playersList.reduce(
            (obj, player) => {
                obj[player.id] = 0;
                return obj;
            },
            {} as Record<string, number>,
        );

        for (const [answerId, voteResults] of Object.entries(votesByAnswer)) {
            const playerId = answers.find(
                (answer) => answer.id === answerId,
            )?.player_id;

            if (!playerId) {
                continue;
            }

            const acceptedVotes = voteResults.accepted ?? 0;
            const rejectedVotes = voteResults.rejected ?? 0;

            const tally = acceptedVotes - rejectedVotes;

            byPlayer[playerId] += tally;
        }

        return byPlayer;
    }, [answersVotes, votesByAnswer]);

    useEffect(() => {
        if (!playersList || !votesByPlayer) {
            return;
        }

        const timer = setTimeout(() => {
            setPlayersList((prev) =>
                [...prev].sort((a, b) => {
                    const aScore = a.score + votesByPlayer[a.id];
                    const bScore = b.score + votesByPlayer[b.id];

                    return bScore - aScore;
                }),
            );

            setShowMedals(true);
        }, 2_500);

        return () => clearTimeout(timer);
    }, [playersList, votesByPlayer]);

    async function handleGoToFinished() {
        if (!amIHost || !game || goingToFinished) {
            return;
        }

        setGoingToFinished(true);

        await supabase
            .from("games")
            .update({ phase: GamePhase.FINISHED })
            .eq("id", game.id);

        setGoingToFinished(false);
    }

    return (
        <div className="flex flex-col gap-y-6">
            <LobbyHeader />

            <AnimatePresence>
                <div className="flex flex-col gap-y-2">
                    <h2 className="text-xl font-medium">Resultados</h2>

                    {votesByPlayer ? (
                        <div className="flex flex-col gap-y-2">
                            {playersList.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{
                                        duration: 0.3,
                                        delay: index * 0.1,
                                        type: "spring",
                                        stiffness: 100,
                                        damping: 10,
                                    }}
                                    className="bg-foreground/5 grid h-14 grid-cols-[1fr_1fr_1fr] items-center rounded border border-transparent px-4 py-2 text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground/60 text-xs">
                                            {index + 1}.
                                        </span>

                                        <span className="text-foreground text-sm font-semibold">
                                            {player.name}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-center gap-2">
                                        {showMedals && (
                                            <span className="text-foreground/60 text-xs">
                                                {index === 0 ? (
                                                    <CrownIcon className="animate-in slide-in-from-bottom-10 size-4 fill-yellow-300 text-yellow-600" />
                                                ) : index === 1 ? (
                                                    <MedalIcon className="animate-in slide-in-from-bottom-10 size-4 fill-slate-300 text-slate-600" />
                                                ) : index === 2 ? (
                                                    <BalloonIcon className="animate-in slide-in-from-bottom-10 size-4 fill-orange-300 text-orange-600" />
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-foreground/60 flex items-center">
                                            <span>&#40;</span>

                                            <span className="">
                                                {player.score}
                                            </span>

                                            <span
                                                className={cn(
                                                    "text-foreground/60",
                                                    votesByPlayer[player.id] > 0
                                                        ? "text-green-700/60"
                                                        : votesByPlayer[
                                                                player.id
                                                            ] < 0
                                                          ? "text-red-700/60"
                                                          : "text-foreground/60",
                                                )}
                                            >
                                                {votesByPlayer[player.id] >= 0
                                                    ? `+${votesByPlayer[player.id]}`
                                                    : votesByPlayer[player.id]}
                                            </span>

                                            <span>&#41;</span>
                                        </div>

                                        <span className="text-foreground text-sm font-semibold">
                                            {player.score +
                                                (votesByPlayer[player.id] ?? 0)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <ResultsSkeleton />
                    )}
                </div>

                {amIHost && (
                    <motion.div
                        key="results-button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                            duration: 0.3,
                            delay: 0.5,
                        }}
                        className="flex flex-col"
                    >
                        <Button
                            disabled={goingToFinished}
                            loading={goingToFinished}
                            onClick={handleGoToFinished}
                        >
                            <span>Finalizar juego</span>
                            <CheckIcon className="size-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ResultsSkeleton() {
    return (
        <motion.div
            key="voting-skeleton"
            className="flex flex-col gap-y-2"
            exit={{ opacity: 0, y: 10, transition: { duration: 1 } }}
        >
            <div className="bg-foreground/5 h-14 w-full rounded"></div>
            <div className="bg-foreground/5 h-14 w-full rounded"></div>
            <div className="bg-foreground/5 h-14 w-full rounded"></div>
        </motion.div>
    );
}
