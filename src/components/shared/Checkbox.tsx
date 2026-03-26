import {
    Field as HeadlessField,
    Checkbox as HeadlessCheckbox,
    Label as HeadlessLabel,
} from "@headlessui/react";
import { CheckIcon } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "~/utils/cn";

interface CheckboxProps extends ComponentProps<typeof HeadlessCheckbox> {
    label: string;
}

export function Checkbox({
    value,
    onChange,
    className,
    label,
    ...props
}: CheckboxProps) {
    return (
        <HeadlessField className="w-full">
            <HeadlessLabel
                className={cn(
                    "flex w-full items-center justify-between text-sm font-medium select-none",
                    className,
                )}
            >
                {label}

                <HeadlessCheckbox
                    checked={Boolean(value)}
                    onChange={onChange}
                    className="group data-checked:bg-primary data-checked:text-primary-foreground bg-background focus-visible:ring-ring flex size-4 items-center justify-center rounded border focus-visible:ring-3 focus-visible:ring-offset-2"
                    {...props}
                >
                    <CheckIcon className="size-3 opacity-0 group-data-checked:opacity-100" />
                </HeadlessCheckbox>
            </HeadlessLabel>
        </HeadlessField>
    );
}
