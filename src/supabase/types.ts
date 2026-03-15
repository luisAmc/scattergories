export interface Player {
    id: string;
    name: string;
    score: number;
    game_id: string;
    created_at: string;
}

export const GamePhase = {
    LOBBY: 'lobby',
    PLAYING: 'playing',
    VOTING: 'voting',
    RESULTS: 'results',
    FINISHED: 'finished',
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export interface Game {
    id: string;
    code: string;
    hostId: string;
    phase: GamePhase;
    round_number: number;
    letter: string;
    ends_at: string;
    created_at: string;
}

export interface Answer {
    id: string;
    game_id: string;
    player_id: string;
    category: string;
    answer: string;
    created_at: string;
}
