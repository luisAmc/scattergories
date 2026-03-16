import { Player } from "~/supabase/types";

export function doesPlayerHaveName(player: Player) {
    return player.name.trim() !== "";
}
