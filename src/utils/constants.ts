export const CODE_LENGTH = 6;

export const CATEGORIES = ["A", "B", "C", "D", "E", "F", "G"];

export const SESSION_KEY = "scattergories";

export const ANSWER_PLACEHOLDERS = [
    "Mmm...",
    "Podría ser...",
    "No sé...",
    "¿Ah?",
    "¿Como era?",
    "Ahh, si!",
    "Esperame, ¿qué?",
    "Ay, ¿cómo se escribía?",
    "La tengo en la punta de la lengua...",
    "Ni idea...",
    "Supongo que...",
    "Ni se van a dar cuenta...",
];

export interface SessionData {
    gameCode: string;
    player_id: string;
    isHost: boolean;
}
