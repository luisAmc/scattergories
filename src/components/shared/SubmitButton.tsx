import { useFormContext } from "react-hook-form";
import { Button, ButtonProps } from "./Button";
import { LoaderCircle } from "lucide-react";

export function SubmitButton({ children, ...props }: ButtonProps) {
    const { formState } = useFormContext();

    return (
        <Button
            type="submit"
            disabled={!formState.isValid || formState.isSubmitting}
            {...props}
        >
            {formState.isSubmitting && (
                <LoaderCircle className="size-4 animate-spin" />
            )}

            {children}
        </Button>
    );
}
