import { JoinOrHostGame } from "./JoinOrHostGame";

export function Home() {
    return (
        <>
            <Hero />
            <JoinOrHostGame />
        </>
    );
}

function Hero() {
    return (
        <header className="py-32 font-mono">
            <h1 className="text-center text-8xl font-bold sm:text-9xl">
                Stop!
            </h1>
            <p className="text-center text-xl line-through sm:text-3xl">
                Scattergories
            </p>
        </header>
    );
}
