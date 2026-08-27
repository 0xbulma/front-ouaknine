import { render } from "@testing-library/react";
import { HOST } from "../../libs/site-url";
import type { PortableNode, Publication } from "../../libs/types";
import { graphOf, nodeOfType } from "../../test/json-ld";
import { setRouter } from "../../test/setup";
import PublicationSchema from "./publication-schema";

// Whether a document is the practice's own writing or someone else's article
// decides who the graph names as its author. Getting it the wrong way round
// publishes Alice Ouaknine as the author of Le Monde's copy.

const paragraph = (text: string): PortableNode => ({
	_type: "block",
	_key: "b",
	style: "normal",
	markDefs: [],
	children: [{ _type: "span", _key: "s", text, marks: [] }],
});

const OWN: Publication = {
	_id: "post-1",
	slug: "guide-de-survie-episode-1",
	title: "Connaître ses droits",
	author: "Alice Ouaknine",
	publishedAt: "2024-02-14",
	field: "Droit pénal général",
	body: [paragraph("La garde à vue est une mesure privative de liberté.")],
};

const PRESS: Publication = {
	...OWN,
	_id: "post-2",
	slug: "defense-d-une-magistrate",
	title: "Défense d'une magistrate",
	author: "Le Monde",
	source: "https://www.lemonde.fr/article",
};

const schemaFor = (post: Publication, series: string | null = null) =>
	graphOf(
		render(<PublicationSchema post={post} title={post.title ?? ""} series={series} />).container,
	);

test("the practice's own writing is an Article it authored and published", () => {
	const article = nodeOfType(schemaFor(OWN), "Article");

	expect(article).toMatchObject({
		"@id": `${HOST}/publications/guide-de-survie-episode-1#article`,
		headline: "Connaître ses droits",
		inLanguage: "fr",
		datePublished: "2024-02-14",
		author: { "@id": `${HOST}/#alice` },
		publisher: { "@id": `${HOST}/#cabinet` },
	});
	expect(article).not.toHaveProperty("mentions");
});

test("a press cutting is a NewsArticle the practice is only mentioned in", () => {
	const article = nodeOfType(schemaFor(PRESS), "NewsArticle");

	// The outlet wrote it. Naming the practice as publisher asserted it
	// published Le Monde's article; omitting the author entirely left a
	// NewsArticle no rich result will accept.
	expect(article).toMatchObject({
		mentions: { "@id": `${HOST}/#cabinet` },
		author: { "@type": "Organization", name: "Le Monde" },
		sameAs: "https://www.lemonde.fr/article",
	});
	expect(article).not.toHaveProperty("publisher");
	expect(article?.author).not.toMatchObject({ "@id": `${HOST}/#alice` });
});

test("a hostile source URL never reaches sameAs", () => {
	// Gated by the same allowlist as the anchor on the page: one decision
	// about `source`, in libs/href.ts.
	const article = nodeOfType(schemaFor({ ...PRESS, source: "javascript:alert(1)" }), "NewsArticle");

	expect(article).not.toHaveProperty("sameAs");
	// Still press: `filter` is not the only signal, but a refused URL must not
	// flip it back to being the practice's own writing.
	expect(article?.["@type"]).toBe("NewsArticle");
});

test("an episode is marked as part of its guide", () => {
	const article = nodeOfType(schemaFor(OWN, "Guide de survie en garde à vue"), "Article");

	expect(article).toMatchObject({
		isPartOf: { "@type": "CreativeWorkSeries", name: "Guide de survie en garde à vue" },
	});
});

test("the related field is resolved to the language being read", () => {
	// `relatedExpertise` points at one language's document; under the other
	// locale the derived slug names a page that is not served.
	setRouter({ locale: "en", asPath: "/en/publications/x" });
	const article = nodeOfType(schemaFor(OWN), "Article");

	expect(article).toMatchObject({
		inLanguage: "en",
		about: { "@id": `${HOST}/en/expertise/criminal-law#service` },
	});
});

test("a field with no counterpart leaves no dangling @id", () => {
	const article = nodeOfType(schemaFor({ ...OWN, field: "Un domaine inventé" }), "Article");

	expect(article).not.toHaveProperty("about");
});

test("the breadcrumb walks home, section, document", () => {
	const crumbs = nodeOfType(schemaFor(OWN), "BreadcrumbList")?.itemListElement;

	expect(crumbs).toMatchObject([
		{ position: 1, item: `${HOST}/` },
		{ position: 2, item: `${HOST}/publications` },
		{ position: 3, item: `${HOST}/publications/guide-de-survie-episode-1` },
	]);
});
