import { useRouter } from "next/router";
import { Button } from "../shared/Button";

export function AlreadyStartedGame() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col items-center justify-center gap-12 p-4">
            <div className="flex flex-col items-center gap-y-2">
                <div className="text-center text-lg text-pretty">
                    Este juego de{" "}
                    <span className="font-bold underline decoration-wavy">
                        Stop!
                    </span>{" "}
                    ya ha comenzado.
                </div>

                <p className="text-foreground/60 text-center text-sm text-pretty">
                    Ya no es posible unise.
                </p>
            </div>

            <div className="flex flex-col items-center gap-y-2">
                <p className="text-foreground/60 text-center text-sm text-pretty">
                    Puedes volver al inicio presionando el botón de abajo
                </p>

                <Button className="w-full" onClick={() => router.push("/")}>
                    Volver al inicio
                </Button>
            </div>
        </div>
    );
}
