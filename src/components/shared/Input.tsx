import { ComponentPropsWithRef, forwardRef } from "react";
import { cn } from "~/utils/cn";

interface InputProps extends ComponentPropsWithRef<"input"> {
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, className, ...props },
    ref,
) {
    return (
        <label>
            {label && (
                <div className="text-foreground mb-2 text-sm leading-none font-medium">
                    {label}
                </div>
            )}

            <input
                ref={ref}
                className={cn(
                    "bg-background border-border placeholder:text-placeholder h-10 w-full border px-3 py-2 text-[16px]",
                    "focus:border-border focus-visible:ring-ring focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-60",
                    "appearance-none transition ease-in-out",
                    className,
                )}
                {...props}
            />
        </label>
    );
});
