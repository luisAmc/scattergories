import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { CreateCategoryDrawer } from "./CreateCategoryDrawer";
import { doesPlayerHaveName } from "./doesPlayerHaveName";
import { FieldError, Form } from "~/components/shared/Form";
import { GamePhase } from "~/supabase/types";
import { Input } from "~/components/shared/Input";
import { PlusIcon, TimerIcon } from "lucide-react";
import { SubmitButton } from "~/components/shared/SubmitButton";
import { supabase } from "~/supabase/client";
import { useDrawer } from "~/components/shared/Drawer";
import { useEffect, useState } from "react";
import { useGameContext } from "~/hooks/useGameContext";
import { useZodForm } from "~/components/shared/Form";
import z from "zod";

export const roundControlsForm = z.object({
    duration: z
        .number("¿Cuantos segundos durará la ronda?")
        .min(10, "Tiene que ser al menos 10 segundos.")
        .max(180, "Tiene que ser como máximo 180 segundos.")
        .transform((val) => Math.round(val)),
    categories: z
        .array(z.string())
        .min(1, "Tiene que haber al menos una categoría."),
});

const ONE_SECOND_IN_MS = 1_000;

export function RoundControls() {
    const { game, players, categories, amIHost } = useGameContext();

    const createCategoryDrawer = useDrawer();
    const [isSetupDone, setIsSetupDone] = useState(false);
    const [startingRound, setStartingRound] = useState(false);

    const controlsForm = useZodForm({
        schema: roundControlsForm,
        defaultValues: {
            duration: 90,
            categories: [],
        },
    });

    const selectedCategories = controlsForm.watch("categories");

    useEffect(() => {
        if (
            isSetupDone ||
            !categories ||
            !Array.isArray(categories) ||
            categories.length === 0
        ) {
            return;
        }

        controlsForm.reset({
            duration: 90,
            categories: categories.slice(0, 1).map((category) => category.id),
        });

        setIsSetupDone(true);
    }, [categories, isSetupDone]);

    const allPlayersHaveName = players.every((player) =>
        doesPlayerHaveName(player),
    );

    async function startGame(input: z.infer<typeof roundControlsForm>) {
        if (!amIHost || !allPlayersHaveName || startingRound) {
            return;
        }

        setStartingRound(true);

        const roundLetter = String.fromCharCode(
            65 + Math.floor(Math.random() * 26),
        );

        const roundDurationMs = input.duration * ONE_SECOND_IN_MS;
        const endsAt = new Date(Date.now() + roundDurationMs).toISOString();

        const roundCategories = input.categories;

        const { data, error } = await supabase
            .from("games")
            .update({
                letter: roundLetter,
                phase: GamePhase.PLAYING,
                round_number: game!.round_number + 1,
                round_category_ids: roundCategories,
                ends_at: endsAt,
            })
            .eq("id", game!.id);

        console.log({ data, error });

        setStartingRound(false);
    }

    return (
        <>
            <Form form={controlsForm} onSubmit={startGame}>
                <div className="flex flex-col gap-y-2">
                    <div className="text-foreground text-sm font-semibold">
                        Configuración de la ronda
                    </div>

                    <div className="bg-foreground/5 flex flex-col gap-y-4 p-4">
                        <div className="flex flex-col gap-y-1">
                            <Input
                                {...controlsForm.register("duration", {
                                    valueAsNumber: true,
                                })}
                                type="number"
                                inputMode="decimal"
                                label="Duración (en segundos)"
                                placeholder="10s - 180s"
                                className="text-center"
                            />

                            <FieldError name="duration" />
                        </div>
                    </div>

                    <div className="bg-foreground/5 flex flex-col gap-y-4 p-4">
                        <div className="text-foreground flex items-center gap-x-2 text-sm font-medium">
                            <span>Categorías</span>

                            <span className="text-foreground/60 text-xs">
                                ({selectedCategories.length} /{" "}
                                {categories.length})
                            </span>
                        </div>

                        <ul className="flex flex-col gap-2">
                            {categories.map((category) => {
                                const isSelected = selectedCategories.includes(
                                    category.id,
                                );

                                return (
                                    <li
                                        key={category.id}
                                        className="border-foreground/20 flex items-center justify-between gap-2 border"
                                    >
                                        <Checkbox
                                            className="px-4 py-2"
                                            checked={isSelected}
                                            label={category.name}
                                            onChange={() => {
                                                let newCategories = [
                                                    ...selectedCategories,
                                                ];

                                                if (isSelected) {
                                                    newCategories =
                                                        newCategories.filter(
                                                            (c) =>
                                                                c !==
                                                                category.id,
                                                        );
                                                } else {
                                                    newCategories.push(
                                                        category.id,
                                                    );
                                                }

                                                controlsForm.setValue(
                                                    "categories",
                                                    newCategories,
                                                    { shouldValidate: true },
                                                );
                                            }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>

                        <FieldError name="categories" />

                        <Button
                            variant="outline"
                            onClick={createCategoryDrawer.open}
                        >
                            <PlusIcon className="size-4" />
                            <span>Agregar una nueva categoría</span>
                        </Button>
                    </div>
                </div>

                <SubmitButton>
                    <TimerIcon className="size-4" />
                    <span>Iniciar ronda</span>
                </SubmitButton>
            </Form>

            <CreateCategoryDrawer {...createCategoryDrawer.props} />
        </>
    );
}
