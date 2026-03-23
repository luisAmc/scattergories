export interface Player {
    id: string;
    name: string;
    score: number;
    game_id: string;
    created_at: string;
}

export const GamePhase = {
    LOBBY: "lobby",
    PLAYING: "playing",
    VOTING: "voting",
    RESULTS: "results",
    FINISHED: "finished",
} as const;

export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export interface Game {
    id: string;
    code: string;
    host_id: string;
    phase: GamePhase;
    round_number: number;
    round_category_ids: string[];
    voting_category_index: number;
    letter: string;
    ends_at: string;
    created_at: string;
}

export interface Answer {
    id: string;
    game_id: string;
    player_id: string;
    category_id: string;
    round_number: number;
    value: string;
    created_at: string;
}

export interface AnswerVote {
    id: string;
    answer_id: string;
    voter_player_id: string;
    value: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    position: number;
    created_at: string;
}
