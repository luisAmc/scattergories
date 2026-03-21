import { useEffect, useState } from "react";
import { useGameContext } from "./useGameContext";

const ONE_SECOND = 1_000;

export function useTimeLeft() {
    const { game } = useGameContext();

    const [timeLeft, setTimeLeft] = useState<{
        seconds: number;
        minutes: number;
    } | null>(null);

    useEffect(() => {
        if (!game) {
            return;
        }

        const roundEndsAt = new Date(game.ends_at);

        const tick = () => {
            const secondsLeft = Math.ceil(
                (roundEndsAt.getTime() - Date.now()) / ONE_SECOND,
            );

            const timeLeft = Math.max(0, secondsLeft);

            setTimeLeft({
                seconds: timeLeft % 60,
                minutes: Math.floor(timeLeft / 60),
            });
        };

        tick();

        const tickHandler = setInterval(tick, ONE_SECOND);

        return () => {
            clearInterval(tickHandler);
        };
    }, [game]);

    return timeLeft;
}
