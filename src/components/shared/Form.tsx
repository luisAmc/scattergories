import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentProps } from 'react';
import {
    FieldValues,
    FormProvider,
    SubmitHandler,
    useForm,
    useFormContext,
    UseFormProps,
    UseFormReturn,
} from 'react-hook-form';
import z, { ZodObject, ZodType } from 'zod';
import { cn } from '~/utils/cn';

interface UseZodFormProps<T extends ZodType<any, any>> extends UseFormProps<
    z.infer<T>
> {
    schema: T;
}

export const useZodForm = <T extends ZodObject<any, any>>({
    schema,
    ...formConfig
}: UseZodFormProps<T>) => {
    return useForm({
        ...formConfig,
        mode: 'onChange',
        resolver: zodResolver(schema) as any, // Mmm
    });
};

interface FieldErrorsProps {
    name?: string;
}

export function FieldError({ name }: FieldErrorsProps) {
    const {
        formState: { errors },
    } = useFormContext();

    if (!name) return null;

    const error = errors[name];

    if (!error) return null;

    return (
        <div className="mt-1 text-sm font-semibold text-red-500">
            {error.message as string}
        </div>
    );
}

export interface FormProps<T extends FieldValues = any> extends Omit<
    ComponentProps<'form'>,
    'onSubmit'
> {
    form: UseFormReturn<T>;
    onSubmit: SubmitHandler<T>;
    disabled?: boolean;
}

export const Form = <T extends FieldValues>({
    form,
    onSubmit,
    children,
    disabled = false,
    className,
    ...props
}: FormProps<T>) => {
    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                {...props}
                className="flex-1"
            >
                <fieldset
                    className={cn('flex h-full flex-col gap-y-4', className)}
                    disabled={form.formState.isSubmitting || disabled}
                >
                    {children}
                </fieldset>
            </form>
        </FormProvider>
    );
};
