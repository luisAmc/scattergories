import { useCallback, useEffect, useRef, useState } from "react";
import { useGameContext } from "./useGameContext";
import { supabase } from "~/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

type PlayerPresence = {
    playerId: string;
    playerName: string;
    categoryId: string;
};

export function usePlayerPresence() {
    const { game, me } = useGameContext();
    const [playersInCategory, setPlayersInCategory] = useState<
        Record<string, PlayerPresence[]>
    >({});

    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!game?.id) {
            return;
        }

        const presenceKey =
            me?.id ?? `player-${Math.random().toString(36).substring(2)}`;

        const channel = supabase.channel(
            `presence:game:${game.id}:${game.round_number}`,
            {
                config: {
                    presence: {
                        key: presenceKey,
                    },
                },
            },
        );

        channelRef.current = channel;

        const buildPlayersInCategory = () => {
            const newState = channel.presenceState();

            const byCategory: Record<string, PlayerPresence[]> = {};

            Object.values(newState).forEach((presences) => {
                presences.forEach((presence) => {
                    const { playerId, playerName, categoryId } =
                        presence as unknown as PlayerPresence;

                    byCategory[categoryId] = byCategory[categoryId] ?? [];

                    byCategory[categoryId].push({
                        playerId,
                        playerName,
                        categoryId,
                    });
                });
            });

            setPlayersInCategory(byCategory);
        };

        channel
            .on("presence", { event: "sync" }, buildPlayersInCategory)
            .on("presence", { event: "join" }, buildPlayersInCategory)
            .on("presence", { event: "leave" }, buildPlayersInCategory)
            .subscribe();

        return () => {
            channelRef.current = null;
            supabase.removeChannel(channel);
        };
    }, [game?.id, me?.name]);

    const setCurrentCategory = useCallback(
        async (categoryId: string | null) => {
            const channel = channelRef.current;

            if (!channel || !me?.id) {
                return;
            }

            if (categoryId === null) {
                await channel.untrack();
            } else {
                await channel.track({
                    playerId: me.id,
                    playerName: me.name,
                    categoryId: categoryId,
                });
            }
        },
        [me?.id, me?.name],
    );

    return { playersInCategory, setCurrentCategory };
}
