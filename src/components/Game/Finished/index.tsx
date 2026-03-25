import { motion } from "framer-motion";
import { Undo2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/shared/Button";
import { Legend } from "~/components/shared/Legend";
import { useAnswersVotes } from "~/hooks/useAnswersVotes";
import { useGameContext } from "~/hooks/useGameContext";
import { supabase } from "~/supabase/client";
import { GamePhase } from "~/supabase/types";

export function Finished() {
    const { game, amIHost, players, answers, votesByPlayer } = useGameContext();

    const [goingToLobby, setGoingToLobby] = useState(false);

    async function handleGoToLobby() {
        if (!amIHost || !game || goingToLobby || !votesByPlayer) {
            return;
        }

        setGoingToLobby(true);

        await Promise.all(
            players.map(async (player) => {
                if (votesByPlayer[player.id] === 0) {
                    return;
                }

                return supabase
                    .from("players")
                    .update({
                        score: player.score + (votesByPlayer[player.id] ?? 0),
                    })
                    .eq("id", player.id);
            }),
        );

        const answersIds = answers.map((answer) => answer.id);

        await supabase
            .from("answer_votes")
            .delete()
            .in("answer_id", answersIds);

        await supabase.from("answers").delete().in("id", answersIds);

        await supabase
            .from("games")
            .update({ phase: GamePhase.LOBBY })
            .eq("id", game.id);

        setGoingToLobby(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background absolute inset-0 z-10 flex items-center justify-center p-4"
        >
            <div className="flex h-full w-full flex-col items-center justify-center gap-y-6 rounded p-8">
                <Legend size="6xl" />

                {amIHost && (
                    <>
                        <p className="text-foreground/60 text-center text-sm text-pretty">
                            Para iniciar la siguiente ronda, presiona el botón
                            de abajo.
                        </p>

                        <Button
                            disabled={goingToLobby}
                            loading={goingToLobby}
                            onClick={handleGoToLobby}
                        >
                            <span>Regresar al lobby</span>
                            <Undo2Icon className="size-4" />
                        </Button>
                    </>
                )}

                {!amIHost && (
                    <p className="text-foreground/60 text-center text-sm text-pretty">
                        Espera un momento mientras el anfitrión los regresa al
                        lobby.
                    </p>
                )}
            </div>
        </motion.div>
    );
}
