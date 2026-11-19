import publicationsContent from "../content/publicationsContent.json";
import { fetchExpertise } from "./expertise";
import { fetchContact, fetchHome, fetchIska, fetchLegal } from "./page-content";
import {
	aboutMarkdown,
	contactMarkdown,
	expertiseFieldMarkdown,
	expertiseIndexMarkdown,
	homeMarkdown,
	iskaMarkdown,
	legalMarkdown,
	publicationMarkdown,
	publicationsIndexMarkdown,
} from "./page-markdown";
import { plainText } from "./plain-text";
import { groupPublications, seriesOf, splitTitle } from "./publication-fields";
import { fetchPublicationBody, fetchPublications } from "./publications";
import type { MarkdownContext } from "./types";

// Path to markdown: which fetcher and which renderer answer each page. Shared by
// pages/api/markdown.ts, which serves one page, and pages/api/llms-full.ts,
// which serves all of them, so the two cannot disagree on what a page says.
// Resolves to null for a path the site does not serve.

// Keyed on the same field as the HTML pages — `expertiseList`, which is what
// they render — not on `title`, which neither renderer needs. Gating the two
// representations on different optional CMS fields is how they drift, and the
// point of sharing a fetcher is that they cannot.
const renderExpertise = async (
	slug: string | null,
	ctx: MarkdownContext,
): Promise<string | null> => {
	const expertise = await fetchExpertise(ctx.locale);
	const fields = expertise?.expertiseList ?? [];
	if (!expertise || fields.length === 0) return null;

	if (!slug) return expertiseIndexMarkdown(expertise, ctx);

	const field = fields.find((item) => item.slug === slug);
	return field ? expertiseFieldMarkdown(field, ctx) : null;
};

// A document the CMS has none of is a 404, not a failure: `fetchHome` and its
// siblings project `[0]`, so a reachable Sanity with nothing published resolves
// to null, and handing that to a renderer would throw and be read as an outage.
const renderDoc = async <T>(
	fetcher: (locale: string) => Promise<T | null>,
	markdown: (data: T, ctx: MarkdownContext) => string,
	ctx: MarkdownContext,
): Promise<string | null> => {
	const data = await fetcher(ctx.locale);
	return data ? markdown(data, ctx) : null;
};

// The index and one publication share a fetch: the body-free list is what the
// index renders and what resolves a slug to the id the body query needs.
const renderPublications = async (
	slug: string | null,
	ctx: MarkdownContext,
): Promise<string | null> => {
	const posts = await fetchPublications(ctx.locale);
	if (posts.length === 0) return null;

	if (!slug) {
		// No `descriptionseo`: content/publicationsContent.json carries no summary
		// for this section, so the document opens on its title and its lists.
		const copy = publicationsContent[ctx.locale];
		return publicationsIndexMarkdown(
			{ title: copy.title },
			{ ...ctx, groups: groupPublications(posts) },
		);
	}

	const post = posts.find((item) => item.slug === slug);
	if (!post) return null;

	const { series, title } = splitTitle(post);
	const body = await fetchPublicationBody(ctx.locale, post._id);

	return publicationMarkdown(
		{ ...post, title, series },
		{ ...ctx, body, series: series ? seriesOf(posts, series).map((e) => e.post) : [] },
	);
};

export const renderPage = async (path: string, ctx: MarkdownContext): Promise<string | null> => {
	if (path === "/") return renderDoc(fetchHome, homeMarkdown, ctx);
	if (path === "/about") {
		const home = await fetchHome(ctx.locale);
		return home ? aboutMarkdown(home, { ...ctx, lead: plainText(home.body) }) : null;
	}
	if (path === "/contact") return renderDoc(fetchContact, contactMarkdown, ctx);
	if (path === "/legal") return renderDoc(fetchLegal, legalMarkdown, ctx);
	if (path === "/iska") return renderDoc(fetchIska, iskaMarkdown, ctx);

	if (path === "/expertise") return renderExpertise(null, ctx);
	if (path === "/publications") return renderPublications(null, ctx);

	const publication = path.match(/^\/publications\/([^/]+)$/);
	if (publication?.[1]) return renderPublications(publication[1], ctx);

	const field = path.match(/^\/expertise\/([^/]+)$/);
	if (field?.[1]) return renderExpertise(field[1], ctx);

	return null;
};
