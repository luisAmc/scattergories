import { GameContextProvider, useGameContext } from "~/hooks/useGameContext";
import { GamePhase } from "~/supabase/types";
import { Lobby } from "./Lobby";
import { TagIcon } from "lucide-react";

const CompByGamePhase = {
    [GamePhase.LOBBY]: <Lobby />,
    [GamePhase.PLAYING]: <div>GamePhase.PLAYING</div>,
    [GamePhase.VOTING]: <div>GamePhase.VOTING</div>,
    [GamePhase.RESULTS]: <div>GamePhase.RESULTS</div>,
    [GamePhase.FINISHED]: <div>GamePhase.FINISHED</div>,
};

export function Game() {
    return (
        <div className="mx-auto w-full max-w-md space-y-6">
            <GameContextProvider>
                <Header />
                <GamePhaseContent />
            </GameContextProvider>
        </div>
    );
}

function Header() {
    return (
        <header className="flex items-center justify-between gap-y-2 font-mono">
            <h1 className="text-6xl font-semibold">Stop!</h1>

            <CodeTag />
        </header>
    );
}

function CodeTag() {
    const { gameCode } = useGameContext();

    return (
        <div className="bg-foreground/10 flex w-fit items-center gap-x-1 rounded px-2 py-1">
            <TagIcon className="size-3" />
            <span>{gameCode}</span>
        </div>
    );
}

function GamePhaseContent() {
    const { phase } = useGameContext();

    return <>{CompByGamePhase[phase]}</>;
}
