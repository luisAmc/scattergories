import { useEffect, useState } from "react";
import { supabase } from "~/supabase/client";
import { Category } from "~/supabase/types";

export function useCategories(gameId: string | null) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!gameId) {
            setIsLoading(false);
            return;
        }

        const getCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("*")
                .eq("game_id", gameId)
                .order("position", { ascending: true });

            setCategories(data ?? []);
            setIsLoading(false);
        };

        getCategories();

        const channel = supabase.channel(`categories:${gameId}`);

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "categories",
                    filter: `game_id=eq.${gameId}`,
                },
                () => {
                    getCategories();
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]);

    return { categories, isLoading };
}
