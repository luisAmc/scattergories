import { useGameContext } from "~/hooks/useGameContext";
import { PlayerName } from "./PlayerName";
import { PlayersList } from "./PlayersList";
import { RoundControls } from "./RoundControls";
import { CheckIcon, CopyIcon, TagIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/shared/Button";

export function Lobby() {
    const { amIHost } = useGameContext();

    return (
        <div className="flex flex-col gap-y-6">
            <Header />

            <PlayerName />

            <PlayersList />

            <InviteCode />

            {amIHost ? <RoundControls /> : <WaitingForHost />}
        </div>
    );
}

function Header() {
    return (
        <header className="flex items-center justify-between gap-y-2">
            <h1 className="font-instrument decoration-accent text-6xl underline decoration-wavy tracking-tight decoration-4">
                Stop!
            </h1>

            <CodeTag />
        </header>
    );
}

function CodeTag() {
    const { gameCode } = useGameContext();

    return (
        <div className="bg-primary text-primary-foreground flex w-fit items-center gap-x-1 rounded px-2 py-1">
            <TagIcon className="size-3" />
            <span>{gameCode}</span>
        </div>
    );
}

function InviteCode() {
    const { gameCode } = useGameContext();
    const [codeCopied, setCodeCopied] = useState(false);

    function handleCopyCode() {
        const inviteLink = `${window.location.origin}/game/${gameCode}`;

        navigator.clipboard.writeText(inviteLink);
        setCodeCopied(true);

        setTimeout(() => setCodeCopied(false), 2_000);
    }

    return (
        <div className="flex flex-col items-center gap-y-2">
            <p className="text-foreground/60 text-sm">
                Comparte el enlace de invitación para que otros jugadores puedan
                unirse a este juego.
            </p>

            <Button
                onClick={handleCopyCode}
                variant="secondary"
                size="sm"
                className="w-full"
            >
                {codeCopied ? (
                    <>
                        <CheckIcon className="size-3" />
                        <span>Enlace copiado</span>
                    </>
                ) : (
                    <>
                        <CopyIcon className="size-3" />
                        <span>Copiar enlace de invitación</span>
                    </>
                )}
            </Button>
        </div>
    );
}

function WaitingForHost() {
    return (
        <p className="text-foreground/60 text-center text-sm">
            Esperando a que el anfitrión inicie la ronda...
        </p>
    );
}
