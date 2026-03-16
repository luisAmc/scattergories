import { cva, VariantProps } from "class-variance-authority";
import { ButtonOrLink, ButtonOrLinkProps } from "./ButtonOrLink";
import { forwardRef } from "react";
import { cn } from "~/utils/cn";

const buttonVariants = cva(
    "text-sm has-[>svg]:gap-1 inline-flex items-center justify-center whitespace-nowrap  font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                outline: "border border-primary hover:bg-muted",
            },
            size: {
                default: "h-10 px-4 py-2",
                icon: "size-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends VariantProps<typeof buttonVariants>, ButtonOrLinkProps {
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(
        { variant, size, loading, children, className, ...props },
        ref,
    ) {
        return (
            <ButtonOrLink
                ref={ref}
                className={cn(buttonVariants({ variant, size, className }))}
                {...props}
                disabled={props.disabled || loading}
            >
                {children}
            </ButtonOrLink>
        );
    },
);
