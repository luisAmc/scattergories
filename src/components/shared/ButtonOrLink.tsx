import { ComponentProps, forwardRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export interface ButtonOrLinkProps extends Omit<
    ComponentProps<'button'> & ComponentProps<'a'>,
    'ref'
> {
    /**
     * If the link should preserve the `redirect` parameter, set this to `true.
     */
    preserveRedirect?: boolean;
}

export const ButtonOrLink = forwardRef<
    HTMLAnchorElement | HTMLButtonElement,
    ButtonOrLinkProps
>(function ButtonOrLink({ href, preserveRedirect, ...props }, ref: any) {
    const router = useRouter();

    if (href) {
        const finalHref =
            preserveRedirect && router.query.redirect
                ? `${href!}?redirect=${encodeURIComponent(
                      router.query.redirect as string,
                  )}`
                : href!;

        return <Link href={finalHref} {...props} />;
    }

    return <button {...props} type={props.type || 'button'} ref={ref} />;
});
