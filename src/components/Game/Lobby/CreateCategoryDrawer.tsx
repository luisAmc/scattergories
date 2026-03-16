import { Drawer, DrawerProps } from "~/components/shared/Drawer";
import { ErrorMessage } from "~/components/shared/ErrorMessage";
import { FieldError, Form, useZodForm } from "~/components/shared/Form";
import { Input } from "~/components/shared/Input";
import { SubmitButton } from "~/components/shared/SubmitButton";
import { supabase } from "~/supabase/client";
import { useGameContext } from "~/hooks/useGameContext";
import { useState } from "react";
import z from "zod";
import { PlusIcon } from "lucide-react";

const newCategoryFormSchema = z.object({
    name: z.string().min(1, "¿Cómo se llamará la nueva categoría?"),
});

interface CreateCategoryDrawerProps extends Pick<
    DrawerProps,
    "open" | "onClose"
> {}

export function CreateCategoryDrawer({
    ...drawerProps
}: CreateCategoryDrawerProps) {
    const { game, categories } = useGameContext();

    const [error, setError] = useState<string | null>(null);

    const newCategoryForm = useZodForm({ schema: newCategoryFormSchema });

    async function handleSubmit(input: z.infer<typeof newCategoryFormSchema>) {
        const name = input.name.trim();

        const position = categories.length;

        const { error } = await supabase
            .from("categories")
            .insert({ game_id: game!.id, name, position });

        if (!error) {
            drawerProps.onClose();
        } else {
            setError("No se pudo guardar tu apodo. :(");
        }
    }

    return (
        <Drawer {...drawerProps} title="Nueva categoría">
            <ErrorMessage error={error} />

            <Form form={newCategoryForm} onSubmit={handleSubmit}>
                <div className="space-y-1">
                    <Input
                        {...newCategoryForm.register("name")}
                        label="Nombre de la nueva categoría"
                        placeholder="Mmm..."
                    />

                    <FieldError name="name" />
                </div>

                <SubmitButton>
                    <PlusIcon className="size-4" />
                    <span>Agregar</span>
                </SubmitButton>
            </Form>
        </Drawer>
    );
}
