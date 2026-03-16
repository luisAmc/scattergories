import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";
import { Player } from "~/supabase/types";

export function usePlayers(gameId: string | null) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!gameId) {
            setIsLoading(false);
            return;
        }

        const getPlayers = async () => {
            const { data } = await supabase
                .from("players")
                .select("*")
                .eq("game_id", gameId)
                .order("created_at", { ascending: true });

            setPlayers(data ?? []);
            setIsLoading(false);
        };

        getPlayers();

        const channel = supabase.channel(`players:${gameId}`);

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "players",
                    filter: `game_id=eq.${gameId}`,
                },
                () => {
                    getPlayers();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]);

    return { players, isLoading };
}
