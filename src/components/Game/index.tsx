import { GameContextProvider, useGameContext } from "~/hooks/useGameContext";
import { GamePhase } from "~/supabase/types";
import { Lobby } from "./Lobby";
import { PlayingRound } from "./PlayingRound";
import { Voting } from "./Voting";
import { AnimatePresence, motion } from "framer-motion";

const CompByGamePhase = {
    [GamePhase.LOBBY]: <Lobby />,
    [GamePhase.PLAYING]: <PlayingRound />,
    [GamePhase.VOTING]: <Voting />,
    [GamePhase.RESULTS]: <div>GamePhase.RESULTS</div>,
    [GamePhase.FINISHED]: <div>GamePhase.FINISHED</div>,
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

    // return (
    //     <AnimatePresence mode="wait">
    //         {phase === GamePhase.LOBBY && <Lobby key={GamePhase.LOBBY} />}

    //         {phase === GamePhase.PLAYING && (
    //             <PlayingRound key={GamePhase.PLAYING} />
    //         )}

    //         {phase === GamePhase.VOTING && <Voting key={GamePhase.VOTING} />}

    //         {phase === GamePhase.RESULTS && (
    //             <div key={GamePhase.RESULTS}>GamePhase.RESULTS</div>
    //         )}

    //         {phase === GamePhase.FINISHED && (
    //             <div key={GamePhase.FINISHED}>GamePhase.FINISHED</div>
    //         )}

    //         <motion.div></motion.div>
    //     </AnimatePresence>
    // );
}
