import { useGameContext } from "~/hooks/useGameContext";
import { PlayerName } from "./PlayerName";
import { PlayersList } from "./PlayersList";
import { RoundControls } from "./RoundControls";

export function Lobby() {
    const { amIHost } = useGameContext();

    return (
        <div className="flex flex-col gap-y-6">
            <PlayerName />

            <PlayersList />

            {amIHost ? <RoundControls /> : <WaitingForHost />}
        </div>
    );
}

function WaitingForHost() {
    return (
        <div className="text-foreground/60 text-center text-sm">
            Esperando a que el anfitrión inicie la ronda...
        </div>
    );
}
