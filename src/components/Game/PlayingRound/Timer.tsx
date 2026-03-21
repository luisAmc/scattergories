import { TimerIcon } from "lucide-react";
import { useMemo } from "react";
import { cn } from "~/utils/cn";

interface TimerProps {
    timeLeft: { seconds: number; minutes: number } | null;
}

export function Timer({ timeLeft }: TimerProps) {
    const isAboutToEnd = useMemo(() => {
        return (
            timeLeft !== null &&
            timeLeft.minutes === 0 &&
            timeLeft.seconds <= 10
        );
    }, [timeLeft]);

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-x-1",
                isAboutToEnd && "text-red-500",
            )}
        >
            <TimerIcon
                className={cn(
                    "text-foreground/50 size-3",
                    isAboutToEnd && "text-red-500",
                )}
            />

            <span className="font-mono text-sm">
                {timeLeft?.minutes.toString().padStart(2, "0") ?? "--"}:
                {timeLeft?.seconds.toString().padStart(2, "0") ?? "--"}
            </span>
        </div>
    );
}

export function TimerWatermark({ timeLeft }: TimerProps) {
    const isAboutToEnd = useMemo(() => {
        return (
            timeLeft !== null &&
            timeLeft.minutes === 0 &&
            timeLeft.seconds <= 10
        );
    }, [timeLeft]);

    if (!isAboutToEnd) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-0 flex animate-pulse flex-col items-center justify-center gap-y-4">
            <TimerIcon className="size-20 stroke-3 text-red-500/15" />
            <span className="font-mono text-8xl text-red-500/15">
                {timeLeft?.minutes.toString().padStart(2, "0") ?? "--"}:
                {timeLeft?.seconds.toString().padStart(2, "0") ?? "--"}
            </span>
        </div>
    );
}
