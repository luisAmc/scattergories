import { GameContextProvider, useGameContext } from "~/hooks/useGameContext";
import { GamePhase } from "~/supabase/types";
import { Lobby } from "./Lobby";
import { PlayingRound } from "./PlayingRound";
import { Voting } from "./Voting";
import { Results } from "./Results";
import { Finished } from "./Finished";

const CompByGamePhase = {
    [GamePhase.LOBBY]: <Lobby />,
    [GamePhase.PLAYING]: <PlayingRound />,
    [GamePhase.VOTING]: <Voting />,
    [GamePhase.RESULTS]: <Results />,
    [GamePhase.FINISHED]: <Finished />,
};

export function Game() {
    return (
        <div className="mx-auto w-full max-w-md space-y-6">
            <GameContextProvider>
                <GamePhaseContent />
            </GameContextProvider>
        </div>
    );
}

function GamePhaseContent() {
    const { phase } = useGameContext();

    return <>{CompByGamePhase[phase]}</>;
}
