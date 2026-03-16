export const CODE_LENGTH = 6;

export const CATEGORIES = ["A", "B", "C", "D", "E", "F", "G"];

export const SESSION_KEY = "scattergories";

export interface SessionData {
    gameCode: string;
    player_id: string;
    isHost: boolean;
}
