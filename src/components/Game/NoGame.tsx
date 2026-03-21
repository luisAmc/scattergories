import { Button } from "../shared/Button";
import { useRouter } from "next/router";

export function NoGame() {
    const router = useRouter();

    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col items-center justify-center gap-12 p-4">
            <div className="flex flex-col items-center gap-y-2">
                <div className="text-center text-lg text-pretty">
                    No existe un juego de{" "}
                    <span className="font-bold underline decoration-wavy">
                        Stop!
                    </span>{" "}
                    con este código.
                </div>
            </div>

            <div className="flex flex-col items-center gap-y-2">
                <p className="text-foreground/60 text-sm text-pretty text-center">
                    Puedes volver al inicio presionando el botón de abajo
                </p>

                <Button className="w-full" onClick={() => router.push("/")}>
                    Volver al inicio
                </Button>
            </div>
        </div>
    );
}

export function Skeleton() {
    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col items-center justify-center gap-12 p-4">
            <div className="bg-foreground/10 h-6 w-[92%] rounded"></div>

            <div className="flex flex-col items-center gap-y-2">
                <div className="bg-foreground/10 h-4 w-72 rounded"></div>
                <div className="bg-foreground/10 h-8 w-72 rounded"></div>
            </div>
        </div>
    );
}
