import { Geist, Geist_Mono } from 'next/font/google';
import { type ReactNode } from 'react';
import { cn } from '~/utils/cn';
import { JoinOrHostGame } from './JoinOrHostGame';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export function Home() {
    return (
        <div className={cn(geistSans.className, 'h-dvh p-4')}>
            <Box>
                <Hero />
                <JoinOrHostGame />
            </Box>
        </div>
    );
}

function Box({ children }: { children: ReactNode }) {
    return (
        <div className="border-foreground flex h-full flex-col items-center border-3 p-6">
            {children}
        </div>
    );
}

function Hero() {
    return (
        <header className={cn(geistMono.className, 'py-32')}>
            <h1 className="text-center text-8xl font-bold sm:text-9xl">
                Stop!
            </h1>
            <p className="text-center text-xl line-through sm:text-3xl">
                Scattergories
            </p>
        </header>
    );
}
