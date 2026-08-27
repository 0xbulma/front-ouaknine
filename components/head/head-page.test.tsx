import { render } from "@testing-library/react";
import { HOST } from "../../libs/site-url";
import { setRouter } from "../../test/setup";
import HeadPage from "./head-page";

// Every annotation Google and the agent surface read off a page is emitted
// here, and nothing below this component decides which ones ship. The pure
// tests cover how a URL is spelled; these cover which ones are published at all.

const links = (container: HTMLElement, selector: string) =>
	[...container.querySelectorAll(selector)].map((el) => el.getAttribute("href"));

const meta = (container: HTMLElement, selector: string) =>
	[...container.querySelectorAll(selector)].map((el) => el.getAttribute("content"));

test("a page publishes one hreflang per language, x-default, and its canonical", () => {
	const { container } = render(<HeadPage title="Contact" description="Coordonnées" />);

	expect(links(container, "link[rel=alternate][hrefLang=fr]")).toStrictEqual([`${HOST}/contact`]);
	expect(links(container, "link[rel=alternate][hrefLang=en]")).toStrictEqual([
		`${HOST}/en/contact`,
	]);
	// France is 88% of the traffic, so the unmatched language gets French.
	expect(links(container, "link[rel=alternate][hrefLang=x-default]")).toStrictEqual([
		`${HOST}/contact`,
	]);
	expect(links(container, "link[rel=canonical]")).toStrictEqual([`${HOST}/contact`]);
});

test("the canonical follows the language being read", () => {
	setRouter({ locale: "en", asPath: "/contact" });
	const { container } = render(<HeadPage title="Contact" description="" />);

	expect(links(container, "link[rel=canonical]")).toStrictEqual([`${HOST}/en/contact`]);
	expect(meta(container, "meta[property='og:locale']")).toStrictEqual(["en_US"]);
});

test("every page points agents at its markdown sibling", () => {
	const { container } = render(<HeadPage title="Contact" description="" />);

	expect(links(container, "link[rel=alternate][type='text/markdown']")).toStrictEqual([
		`${HOST}/contact.md`,
	]);
});

test("the home page spells its markdown sibling /index.md", () => {
	setRouter({ pathname: "/", asPath: "/" });
	const { container } = render(<HeadPage title="Accueil" description="" />);

	expect(links(container, "link[rel=alternate][type='text/markdown']")).toStrictEqual([
		`${HOST}/index.md`,
	]);
});

test("hreflang and og:locale:alternate both survive next/head's key namespace", () => {
	// `next/head` de-dupes every child against one shared key namespace, so a
	// bare locale as the key silently dropped one of these two annotations.
	const { container } = render(<HeadPage title="Contact" description="" />);

	expect(container.querySelectorAll("link[rel=alternate][hrefLang]")).toHaveLength(3);
	expect(meta(container, "meta[property='og:locale:alternate']")).toStrictEqual(["en_US"]);
});

test("a noindex page publishes the robots meta and nothing else", () => {
	// An hreflang pointing at a URL that itself 404s is reported as an error,
	// and a self-canonical beside noindex is a contradictory pair of signals.
	const { container } = render(<HeadPage title="Introuvable" description="" noindex />);

	expect(meta(container, "meta[name=robots]")).toStrictEqual(["noindex, follow"]);
	expect(container.querySelectorAll("link[rel=alternate][hrefLang]")).toHaveLength(0);
	expect(container.querySelectorAll("link[rel=canonical]")).toHaveLength(0);
	expect(container.querySelectorAll("link[rel=alternate][type='text/markdown']")).toHaveLength(0);
	expect(container.querySelectorAll("meta[property='og:url']")).toHaveLength(0);

	// The title and description still ship: the 404 is a real page.
	expect(container.querySelector("title")).toHaveTextContent("Introuvable");
});

test("a page standing in for another publishes that one's URLs", () => {
	// The expertise hub renders the first field and canonicalises onto it rather
	// than competing with it.
	setRouter({ pathname: "/expertise", asPath: "/expertise" });
	const { container } = render(
		<HeadPage
			title="Expertise"
			description=""
			alternatePaths={{ fr: "/expertise/droit-penal-general", en: "/en/expertise/criminal-law" }}
		/>,
	);

	expect(links(container, "link[rel=canonical]")).toStrictEqual([
		`${HOST}/expertise/droit-penal-general`,
	]);
	expect(links(container, "link[rel=alternate][hrefLang=en]")).toStrictEqual([
		`${HOST}/en/expertise/criminal-law`,
	]);
	// The markdown link is built from the path actually requested, not from the
	// field it canonicalises onto: the middleware serves this URL, not that one.
	expect(links(container, "link[rel=alternate][type='text/markdown']")).toStrictEqual([
		`${HOST}/expertise.md`,
	]);
});

test("a field with no counterpart is left out rather than annotated with a 404", () => {
	setRouter({
		pathname: "/expertise/[slug]",
		asPath: "/expertise/renamed-in-the-studio",
		query: { slug: "renamed-in-the-studio" },
	});
	const { container } = render(<HeadPage title="Champ" description="" />);

	// French resolves through `asPath`; English has no pair, so no annotation.
	expect(links(container, "link[rel=alternate][hrefLang=fr]")).toStrictEqual([
		`${HOST}/expertise/renamed-in-the-studio`,
	]);
	expect(container.querySelectorAll("link[rel=alternate][hrefLang=en]")).toHaveLength(0);
});
