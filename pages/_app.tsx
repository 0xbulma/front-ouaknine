import type { AppProps } from "next/app";
import Layout from "../components/layout/layout";
import CookieContext from "../context/cookie-context";
import LocalesContext from "../context/locales-context";
import NavContext from "../context/nav-context";
import type { PageSeo } from "../libs/types";
import "../styles/globals.scss";

function MyApp({ Component, pageProps }: AppProps<{ seo?: PageSeo }>) {
	// A page that publishes an explicit alternate set knows which languages it has.
	const alternates = pageProps?.seo?.alternates;
	const locales = alternates ? Object.keys(alternates) : null;

	return (
		<CookieContext>
			<NavContext>
				<LocalesContext value={locales}>
					<Layout>
						<Component {...pageProps} />
					</Layout>
				</LocalesContext>
			</NavContext>
		</CookieContext>
	);
}

export default MyApp;
