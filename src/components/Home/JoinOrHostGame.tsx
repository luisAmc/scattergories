import { useRouter } from "next/router";
import { Button } from "../shared/Button";
import { Input } from "../shared/Input";
import z from "zod";
import { FieldError, Form, useZodForm } from "../shared/Form";
import { SubmitButton } from "../shared/SubmitButton";
import { CODE_LENGTH, SESSION_KEY } from "~/utils/constants";
import { useState } from "react";
import { generateGameCode } from "~/utils/generateGameCode";
import { supabase } from "~/supabase/client";
import { GamePhase } from "~/supabase/types";

const joinGameSchema = z.object({
    gameCode: z
        .string()
        .length(CODE_LENGTH, "Los códigos son de seis caracteres"),
});

export function JoinOrHostGame() {
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);

    const joinGameForm = useZodForm({ schema: joinGameSchema });

    async function handleCreateGame() {
        try {
            const gameCode = generateGameCode();

            const { data: game, error: gameError } = await supabase
                .from("games")
                .insert({ code: gameCode, phase: GamePhase.LOBBY })
                .select("id")
                .single();

            if (!game || gameError) {
                setError("No se pudo crear el nuevo juego. :(");
                return;
            }

            const { data: host, error: hostError } = await supabase
                .from("players")
                .insert({ game_id: game.id, name: "Anfitrión" })
                .select("id")
                .single();

            if (!host || hostError) {
                setError("No se pudo crear el anfitrión. :(");

                await supabase.from("games").delete().eq("id", game.id);
                return;
            }

            await supabase
                .from("games")
                .update({ host_id: host.id })
                .eq("id", game.id);

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({ gameCode, player_id: host.id, isHost: true }),
            );

            await router.push(`/game/${gameCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        }
    }

    async function handleJoinGame(input: z.infer<typeof joinGameSchema>) {
        try {
            const gameCode = input.gameCode;

            const { data: game, error: gameError } = await supabase
                .from("games")
                .select("id")
                .eq("code", gameCode)
                .single();

            if (!game || gameError) {
                setError(
                    "No se encontró un juego con el código dado. ¿Esta bien escrito?",
                );

                return;
            }

            const { data: player, error: playerError } = await supabase
                .from("players")
                .insert({ game_id: game.id, name: "" })
                .select("id")
                .single();

            if (!player || playerError) {
                setError("No se pudo crear el jugador. :(");
                return;
            }

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    gameCode,
                    player_id: player.id,
                    isHost: false,
                }),
            );

            await router.push(`/game/${gameCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        }
    }

    return (
        <div className="fixed inset-0 m-auto flex h-fit justify-center">
            <div className="flex w-full max-w-xs flex-col gap-4 sm:max-w-sm">
                <ErrorMessage error={error} />

                <Form form={joinGameForm} onSubmit={handleJoinGame}>
                    <div className="flex flex-col gap-y-1">
                        <Input
                            {...joinGameForm.register("gameCode")}
                            label="Código de juego (para unirte)"
                            placeholder="ABC123"
                            className="text-center font-bold tracking-[0.2rem] uppercase placeholder:font-normal placeholder:normal-case"
                        />

                        <FieldError name="gameCode" />
                    </div>

                    <SubmitButton>Unirse</SubmitButton>
                </Form>

                <div className="text-foreground/60 my-2 flex items-center justify-center gap-x-2">
                    <span>&mdash;</span>
                    <span>o</span>
                    <span>&mdash;</span>
                </div>

                <Button variant="outline" onClick={handleCreateGame}>
                    Crear un nuevo juego
                </Button>
            </div>
        </div>
    );
}

function ErrorMessage({ error }: { error: string | null }) {
    if (!error) {
        return null;
    }

    return (
        <div className="mb-4 border border-red-500 bg-red-50 p-4 text-sm font-semibold text-red-500">
            <p>{error}</p>
        </div>
    );
}
