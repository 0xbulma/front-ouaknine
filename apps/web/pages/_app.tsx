import type { AppProps } from "next/app";
import { Bodoni_Moda, Inter } from "next/font/google";

import Layout from "../components/layout/layout";
import CookieContext from "../context/cookie-context";
import LocalesContext from "../context/locales-context";
import NavContext from "../context/nav-context";
import type { PageSeo } from "../libs/types";
import "../styles/globals.scss";

// The two families are downloaded at build time and served from this origin.
// They used to come from Google's CDN through a render-blocking <link> in
// _document.tsx, which cost a page made almost entirely of type its first
// paint, and sent every visitor's IP to a third party from a law practice's
// own site.
//
// `opsz` is not optional here: Bodoni is a Didone, it runs from 12px to 144px
// on this site, and the optical size axis is what keeps its hairlines from
// disappearing at the small end. See the design system section of CLAUDE.md.
//
// Neither declares a `fallback` list. Passing one suppresses the metrics-matched
// face Next derives from the real font (`ascent-override`, `size-adjust`), and
// that face is what stops a 144px headline reflowing when the webfont swaps in.
// The designer's Didot chain survives as the `var()` fallback in
// styles/_variables.scss, which is the case it was actually for: no variable.
const bodoni = Bodoni_Moda({
	subsets: ["latin"],
	axes: ["opsz"],
	display: "swap",
});

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
});

function MyApp({ Component, pageProps }: AppProps<{ seo?: PageSeo }>) {
	// A page that publishes an explicit alternate set knows which languages it has.
	const alternates = pageProps?.seo?.alternates;
	const locales = alternates ? Object.keys(alternates) : null;

	return (
		<>
			{/* The custom properties go on :root rather than on a wrapper class,
			    because globals.scss sets the body font and body is above anything
			    this component can put a className on. */}
			<style jsx global>{`
				:root {
					--font-bodoni: ${bodoni.style.fontFamily};
					--font-inter: ${inter.style.fontFamily};
				}
			`}</style>
			<CookieContext>
				<NavContext>
					<LocalesContext value={locales}>
						<Layout>
							<Component {...pageProps} />
						</Layout>
					</LocalesContext>
				</NavContext>
			</CookieContext>
		</>
	);
}

export default MyApp;
