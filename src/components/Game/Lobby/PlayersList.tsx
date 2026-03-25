import { cn } from "~/utils/cn";
import { doesPlayerHaveName } from "./doesPlayerHaveName";
import { BalloonIcon, CrownIcon, FlagIcon, MedalIcon } from "lucide-react";
import { useGameContext } from "~/hooks/useGameContext";
import { useMemo } from "react";

export function PlayersList() {
    const { game, players, me } = useGameContext();

    const sortedPlayers = useMemo(() => {
        if (!game || !players || !Array.isArray(players)) {
            return [];
        }

        return players.sort((a, b) => b.score - a.score);
    }, [JSON.stringify(players), game]);

    return (
        <div className="flex flex-col gap-y-2">
            <div className="text-foreground text-sm font-semibold">
                Jugadores en este juego ({players.length})
            </div>

            <ul className="flex flex-col gap-2">
                {sortedPlayers.map((player, index) => {
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

                                {(game?.round_number ?? 0) > 0 && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <span className="text-foreground/60 text-xs">
                                                {index === 0 ? (
                                                    <CrownIcon className="size-4 fill-yellow-300 text-yellow-600" />
                                                ) : index === 1 ? (
                                                    <MedalIcon className="size-4 fill-slate-300 text-slate-600" />
                                                ) : index === 2 ? (
                                                    <BalloonIcon className="size-4 fill-orange-300 text-orange-600" />
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        </div>

                                        <span className="text-foreground/60 text-xs">
                                            {player.score}
                                        </span>
                                    </>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
