import { doesPlayerHaveName } from "./doesPlayerHaveName";
import { Drawer, useDrawer } from "~/components/shared/Drawer";
import { ErrorMessage } from "~/components/shared/ErrorMessage";
import { FieldError, Form, useZodForm } from "~/components/shared/Form";
import { Input } from "~/components/shared/Input";
import { SubmitButton } from "~/components/shared/SubmitButton";
import { supabase } from "~/supabase/client";
import { useEffect, useState } from "react";
import { useGameContext } from "~/hooks/useGameContext";
import z from "zod";

const nameFormSchema = z.object({
    name: z.string().min(1, "Escribe tu apodo para jugar."),
});

export function PlayerName() {
    const { me, players } = useGameContext();

    const [error, setError] = useState<string | null>(null);

    const setNameDrawer = useDrawer();
    const nameForm = useZodForm({ schema: nameFormSchema });

    const doIHaveName = me ? doesPlayerHaveName(me) : false;

    useEffect(() => {
        if (me && !doIHaveName) {
            setNameDrawer.open();
        }
    }, [doIHaveName, players]);

    async function handleNameChange(input: z.infer<typeof nameFormSchema>) {
        const name = input.name.trim();

        const { error } = await supabase
            .from("players")
            .update({ name })
            .eq("id", me!.id);

        if (!error) {
            setNameDrawer.close();
        } else {
            setError("No se pudo guardar tu apodo. :(");
        }
    }

    return (
        <Drawer
            {...setNameDrawer.props}
            title="Antes de comenzar..."
            dismissible={false}
        >
            <ErrorMessage error={error} />

            <Form form={nameForm} onSubmit={handleNameChange}>
                <Input
                    autoFocus
                    {...nameForm.register("name")}
                    label="¿Cómo quieres que te llamen los demás?"
                    placeholder="Mmm..."
                />

                <FieldError name="name" />

                <SubmitButton>Listo</SubmitButton>
            </Form>
        </Drawer>
    );
}
