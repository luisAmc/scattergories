import { Page } from "~/components/shared/Page";
import type { AppProps } from "next/app";
import "~/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Page>
            <Component {...pageProps} />
        </Page>
    );
}
