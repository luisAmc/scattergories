import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";
import { Answer, GamePhase } from "~/supabase/types";

export function useAnswers(
    gameId: string | null,
    gamePhase: GamePhase,
    round: number,
) {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!gameId) {
            setIsLoading(false);
            return;
        }

        const getAnswers = async () => {
            const { data } = await supabase
                .from("answers")
                .select("*")
                .eq("game_id", gameId)
                .eq("round_number", round);

            setAnswers(data ?? []);
            setIsLoading(false);
        };

        getAnswers();

        const channel = supabase.channel(`answers:${gameId}:${round}`);

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "answers",
                    filter: `game_id=eq.${gameId}`,
                },
                () => {
                    getAnswers();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId, gamePhase]);

    return { answers, isLoading };
}
