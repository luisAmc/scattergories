import { cn } from "~/utils/cn";
import { doesPlayerHaveName } from "./doesPlayerHaveName";
import { FlagIcon } from "lucide-react";
import { useGameContext } from "~/hooks/useGameContext";

export function PlayersList() {
    const { game, players, me } = useGameContext();

    return (
        <div className="flex flex-col gap-y-2">
            <div className="text-foreground text-sm font-semibold">
                Jugadores en este juego ({players.length})
            </div>

            <ul className="flex flex-col gap-2">
                {players.map((player) => {
                    const isMe = player.id === me?.id;

                    return (
                        <li
                            key={player.id}
                            className={cn(
                                "border-foreground/20 flex items-center justify-between gap-2 border px-4 py-2",
                                isMe && "border-foreground/50 bg-foreground/5",
                            )}
                        >
                            <span>
                                {doesPlayerHaveName(player)
                                    ? player.name
                                    : "Jugador sin nombre"}
                            </span>

                            <div className="flex items-center gap-2">
                                {game!.host_id === player.id && (
                                    <span className="text-xs">(anfitrión)</span>
                                )}

                                {isMe && (
                                    <FlagIcon className="fill-primary text-primary size-3" />
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
