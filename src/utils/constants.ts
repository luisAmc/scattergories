export const ONE_SECOND_IN_MS = 1_000;

export const CODE_LENGTH = 6;

export const CATEGORIES = [
    "Nombre",
    "Apellido",
    "Ciudad o País",
    "Fruta o Vegetal",
    "Objeto",
    "Profesión",
    "Animal",
    "Color",
    "Lugar",
    "Acción",
];

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
