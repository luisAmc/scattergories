import { LoaderCircle, TagIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { supabase } from "~/supabase/client";
import { SESSION_KEY } from "~/utils/constants";
import { ErrorMessage } from "../shared/ErrorMessage";
import { Button } from "../shared/Button";

export function JoinGameFromInvite({ gameCode }: { gameCode: string }) {
    const router = useRouter();

    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleJoinGame() {
        setJoining(true);

        const { data: game, error: gameError } = await supabase
            .from("games")
            .select("id")
            .eq("code", gameCode)
            .single();

        if (!game || gameError) {
            setError(
                "No se encontró un juego con el código dado. ¿Esta bien escrito?",
            );

            return;
        }

        const { data: player, error: playerError } = await supabase
            .from("players")
            .insert({ game_id: game.id, name: "" })
            .select("id")
            .single();

        if (!player || playerError) {
            setError("No se pudo crear el jugador. :(");
            return;
        }

        sessionStorage.setItem(
            `${SESSION_KEY}:${gameCode}`,
            JSON.stringify({
                gameCode,
                player_id: player.id,
                isHost: false,
            }),
        );

        router.reload();

        setJoining(false);
    }

    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col items-center justify-center gap-12 p-4">
            <div className="flex flex-col items-center gap-y-2">
                <div className="text-lg">
                    Te han invitado a un juego de{" "}
                    <span className="font-instrument decoration-accent font-bold tracking-tight underline decoration-wavy">
                        Stop!
                    </span>
                </div>

                <div className="bg-secondary text-secondary-foreground flex items-center gap-x-1 rounded px-2 py-1 font-mono tracking-widest">
                    <TagIcon className="size-4" />
                    <span>{gameCode ?? "------"}</span>
                </div>
            </div>

            <div className="flex flex-col items-center gap-y-2">
                <ErrorMessage error={error} />

                <p className="text-foreground/60 text-sm">
                    Para unirte, presiona en el botón de abajo.
                </p>

                <Button
                    onClick={handleJoinGame}
                    className="w-full"
                    disabled={joining}
                >
                    {joining ? (
                        <>
                            <LoaderCircle className="size-4 animate-spin" />
                            <span>Uniendose</span>
                        </>
                    ) : (
                        <>
                            <span>Unirse</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export function Skeleton() {
    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col items-center justify-center gap-12 p-4">
            <div className="flex flex-col items-center gap-y-2">
                <div className="bg-foreground/10 h-6 w-72 rounded"></div>
                <div className="bg-foreground/10 h-8 w-26 rounded"></div>
            </div>

            <div className="flex flex-col items-center gap-y-2">
                <div className="bg-foreground/10 h-4 w-72 rounded"></div>
                <div className="bg-foreground/10 h-8 w-72 rounded"></div>
            </div>
        </div>
    );
}
