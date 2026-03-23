import { Legend } from "../shared/Legend";
import { JoinOrHostGame } from "./JoinOrHostGame";

export function Home() {
    return (
        <div className="fixed inset-0 m-auto flex h-fit flex-col justify-center gap-y-16">
            <Hero />
            <JoinOrHostGame />
        </div>
    );
}

function Hero() {
    return (
        <header className="font-instrument flex flex-col items-center gap-4">
            <Legend size="8xl" />

            <p className="text-center font-mono text-xl line-through sm:text-3xl">
                Scattergories
            </p>
        </header>
    );
}
