import { cva, VariantProps } from "class-variance-authority";

const legendVariants = cva(
    "font-instrument decoration-accent tracking-tight underline decoration-wavy",
    {
        variants: {
            size: {
                xl: "text-xl font-bold",
                "6xl": "text-6xl decoration-4",
                "8xl": "text-8xl sm:text-9xl sm:decoration-11 decoration-8",
            },
        },
        defaultVariants: {
            size: "xl",
        },
    },
);

export interface LegendProps extends VariantProps<typeof legendVariants> {}

export function Legend({ size }: LegendProps) {
    return <span className={legendVariants({ size })}>Stop!</span>;
}
