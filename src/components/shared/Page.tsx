import { type ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
    return <div className="min-h-full px-4 py-8">{children}</div>;
}
