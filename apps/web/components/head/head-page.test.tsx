import { render } from "@testing-library/react";
import { HOST } from "../../libs/site-url";
import { setRouter } from "../../test/setup";
import HeadPage from "./head-page";

// Every annotation Google and the agent surface read off a page is emitted
// here, and nothing below this component decides which ones ship. The pure
// tests cover how a URL is spelled; these cover which ones are published at all.

// React 19 hoists <title>, <meta> and <link> into document.head wherever in the
// tree they are declared, so the render result these used to query comes back
// empty. The mock for `next/head` renders its children inline (test/setup.tsx);
// React then puts them where the real page puts them, and that is what to assert.
const found = (selector: string) => [...document.head.querySelectorAll(selector)];

const links = (selector: string) => found(selector).map((el) => el.getAttribute("href"));

const meta = (selector: string) => found(selector).map((el) => el.getAttribute("content"));

test("a page publishes one hreflang per language, x-default, and its canonical", () => {
	render(<HeadPage title="Contact" description="Coordonnées" />);

	expect(links("link[rel=alternate][hrefLang=fr]")).toStrictEqual([`${HOST}/contact`]);
	expect(links("link[rel=alternate][hrefLang=en]")).toStrictEqual([`${HOST}/en/contact`]);
	// France is 88% of the traffic, so the unmatched language gets French.
	expect(links("link[rel=alternate][hrefLang=x-default]")).toStrictEqual([`${HOST}/contact`]);
	expect(links("link[rel=canonical]")).toStrictEqual([`${HOST}/contact`]);
});

test("the canonical follows the language being read", () => {
	setRouter({ locale: "en", asPath: "/contact" });
	render(<HeadPage title="Contact" description="" />);

	expect(links("link[rel=canonical]")).toStrictEqual([`${HOST}/en/contact`]);
	expect(meta("meta[property='og:locale']")).toStrictEqual(["en_US"]);
});

test("every page points agents at its markdown sibling", () => {
	render(<HeadPage title="Contact" description="" />);

	expect(links("link[rel=alternate][type='text/markdown']")).toStrictEqual([`${HOST}/contact.md`]);
});

test("the home page spells its markdown sibling /index.md", () => {
	setRouter({ pathname: "/", asPath: "/" });
	render(<HeadPage title="Accueil" description="" />);

	expect(links("link[rel=alternate][type='text/markdown']")).toStrictEqual([`${HOST}/index.md`]);
});

test("hreflang and og:locale:alternate both survive next/head's key namespace", () => {
	// `next/head` de-dupes every child against one shared key namespace, so a
	// bare locale as the key silently dropped one of these two annotations.
	render(<HeadPage title="Contact" description="" />);

	expect(found("link[rel=alternate][hrefLang]")).toHaveLength(3);
	expect(meta("meta[property='og:locale:alternate']")).toStrictEqual(["en_US"]);
});

test("a noindex page publishes the robots meta and nothing else", () => {
	// An hreflang pointing at a URL that itself 404s is reported as an error,
	// and a self-canonical beside noindex is a contradictory pair of signals.
	render(<HeadPage title="Introuvable" description="" noindex />);

	expect(meta("meta[name=robots]")).toStrictEqual(["noindex, follow"]);
	expect(found("link[rel=alternate][hrefLang]")).toHaveLength(0);
	expect(found("link[rel=canonical]")).toHaveLength(0);
	expect(found("link[rel=alternate][type='text/markdown']")).toHaveLength(0);
	expect(found("meta[property='og:url']")).toHaveLength(0);

	// The title and description still ship: the 404 is a real page.
	expect(document.head.querySelector("title")).toHaveTextContent("Introuvable");
});

test("a page standing in for another publishes that one's URLs", () => {
	// The expertise hub renders the first field and canonicalises onto it rather
	// than competing with it.
	setRouter({ pathname: "/expertise", asPath: "/expertise" });
	render(
		<HeadPage
			title="Expertise"
			description=""
			alternatePaths={{ fr: "/expertise/droit-penal-general", en: "/en/expertise/criminal-law" }}
		/>,
	);

	expect(links("link[rel=canonical]")).toStrictEqual([`${HOST}/expertise/droit-penal-general`]);
	expect(links("link[rel=alternate][hrefLang=en]")).toStrictEqual([
		`${HOST}/en/expertise/criminal-law`,
	]);
	// The markdown link is built from the path actually requested, not from the
	// field it canonicalises onto: the middleware serves this URL, not that one.
	expect(links("link[rel=alternate][type='text/markdown']")).toStrictEqual([
		`${HOST}/expertise.md`,
	]);
});

test("a field with no counterpart is left out rather than annotated with a 404", () => {
	setRouter({
		pathname: "/expertise/[slug]",
		asPath: "/expertise/renamed-in-the-studio",
		query: { slug: "renamed-in-the-studio" },
	});
	render(<HeadPage title="Champ" description="" />);

	// French resolves through `asPath`; English has no pair, so no annotation.
	expect(links("link[rel=alternate][hrefLang=fr]")).toStrictEqual([
		`${HOST}/expertise/renamed-in-the-studio`,
	]);
	expect(found("link[rel=alternate][hrefLang=en]")).toHaveLength(0);
});
