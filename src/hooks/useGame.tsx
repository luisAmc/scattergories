import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";
import { Game } from "~/supabase/types";

export function useGame(gameCode: string) {
    const [game, setGame] = useState<Game | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameCode) {
            return;
        }

        const getGame = async () => {
            const { data, error } = await supabase
                .from("games")
                .select("*")
                .eq("code", gameCode)
                .single();

            setGame(data);
            setIsLoading(false);

            if (error) {
                setError(
                    error?.message ??
                        "Ocurrió un error al tratar de buscar el juego. :(",
                );
            }
        };

        getGame();

        const channel = supabase.channel(`game:${gameCode}`);

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "games",
                    filter: `code=eq.${gameCode}`,
                },
                (payload) => {
                    if (
                        payload.eventType === "UPDATE" ||
                        payload.eventType === "INSERT"
                    ) {
                        setGame(payload.new as Game);
                    } else if (payload.eventType === "DELETE") {
                        setGame(null);
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameCode]);

    return { game, isLoading, error };
}
