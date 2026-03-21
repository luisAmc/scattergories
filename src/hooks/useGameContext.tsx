import { createContext, type ReactNode, useContext, useMemo } from "react";
import { Answer, Category, Game, GamePhase, Player } from "~/supabase/types";
import { useRouter } from "next/router";
import { useGame } from "./useGame";
import { usePlayers } from "./usePlayers";
import { SESSION_KEY, SessionData } from "~/utils/constants";
import { useCategories } from "./useCategories";
import {
    JoinGameFromInvite,
    Skeleton as JoinGameFromInviteSkeleton,
} from "~/components/Game/JoinGameFromInvite";
import { NoGame } from "~/components/Game/NoGame";
import { AlreadyStartedGame } from "~/components/Game/AlreadyStartedGame";
import { useAnswers } from "./useAnswers";

interface GameContextType {
    gameCode: string;
    game: Game | null;
    phase: GamePhase;
    isLoading: boolean;
    players: Player[];
    categories: Category[];
    answers: Answer[];
    me: Player | null;
    amIHost: boolean;
    session: SessionData | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameContextProviderProps {
    children: ReactNode;
}

export function GameContextProvider({ children }: GameContextProviderProps) {
    const router = useRouter();
    const gameCode = router.query.gameCode as string;

    const {
        game,
        isLoading: isGameLoading,
        error: gameError,
    } = useGame(gameCode);

    const { players, isLoading: arePlayersLoading } = usePlayers(
        game?.id ?? null,
    );

    const { categories, isLoading: areCategoriesLoading } = useCategories(
        game?.id ?? null,
    );

    const { answers, isLoading: areAnswersLoading } = useAnswers(
        game?.id ?? null,
        game?.phase ?? GamePhase.LOBBY,
        game?.round_number ?? 0,
    );

    const session = useMemo(() => {
        if (typeof window === "undefined") {
            return null;
        }

        const gameSessionKey = `${SESSION_KEY}:${gameCode}`;
        const item = sessionStorage.getItem(gameSessionKey);

        if (!item) {
            return null;
        }

        const data = JSON.parse(item) as SessionData;

        if (data.gameCode !== gameCode) {
            return null;
        }

        return data;
    }, [gameCode]);

    const player = session
        ? (players.find((player) => player.id === session.player_id) ?? null)
        : null;

    const isLoading =
        isGameLoading || arePlayersLoading || areCategoriesLoading;

    const noGame = gameError || !game || !gameCode;

    if (isLoading) {
        if (!session) {
            return <JoinGameFromInviteSkeleton />;
        }

        // if (noGame) {
        //     return <NoGameSkeleton />;
        // }

        return <LobbySkeleton />;
    }

    if (!session) {
        if (game?.phase === GamePhase.LOBBY) {
            return <JoinGameFromInvite gameCode={gameCode} />;
        }

        return <AlreadyStartedGame />;
    }

    if (noGame) {
        return <NoGame />;
    }

    return (
        <GameContext.Provider
            value={{
                gameCode,
                game,
                isLoading,
                phase: game.phase,

                players,
                categories,
                answers,
                me: player,
                amIHost: session?.isHost ?? false,

                session,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

function LobbySkeleton() {
    return (
        <div className="flex flex-col gap-y-6">
            <div className="flex items-center justify-between">
                <div className="bg-foreground/10 h-16 w-36 rounded"></div>
                <div className="bg-foreground/10 h-8 w-22.5 rounded"></div>
            </div>

            <div className="flex flex-col gap-y-2">
                <div className="bg-foreground/10 h-4 w-1/2 rounded"></div>

                <div className="bg-foreground/10 h-10 w-full rounded"></div>
                <div className="bg-foreground/10 h-10 w-full rounded"></div>
                <div className="bg-foreground/10 h-10 w-full rounded"></div>
                <div className="bg-foreground/10 h-10 w-full rounded"></div>
            </div>

            <div className="bg-foreground/10 mx-auto h-4 w-2/3 rounded"></div>
        </div>
    );
}

export function useGameContext() {
    const context = useContext(GameContext);

    if (!context) {
        throw new Error(
            `'useGameContext' can only be used within a GameProvider component.`,
        );
    }

    return context;
}
