import type { NextApiRequest, NextApiResponse } from "next";

import iskaContent from "../../content/iskaContent.json";
import publicationsContent from "../../content/publicationsContent.json";
import { varyWithAccept } from "../../libs/accept";
import type { AgentContext } from "../../libs/agent-context";
import { agentContext } from "../../libs/agent-context";
import { fetchExpertise, plainText } from "../../libs/expertise";
import { fetchContact, fetchHome, fetchLegal } from "../../libs/page-content";
import {
	aboutMarkdown,
	contactMarkdown,
	expertiseFieldMarkdown,
	expertiseIndexMarkdown,
	homeMarkdown,
	iskaMarkdown,
	legalMarkdown,
	notFoundMarkdown,
	publicationMarkdown,
	publicationsIndexMarkdown,
	unavailableMarkdown,
} from "../../libs/page-markdown";
import { groupPublications, seriesOf, splitTitle } from "../../libs/publication-fields";
import { fetchPublicationBody, fetchPublications } from "../../libs/publications";
import { methodNotAllowed, unexpectedQuery } from "../../libs/query-guard";
import { routePath } from "../../libs/site-url";
import type { MarkdownContext } from "../../libs/types";

// The text/markdown representation of every page. Reached through the
// middleware, either from an Accept header or from a .md URL.

// The middleware only ever sends these two. The route is also reachable
// directly, and the CDN keys on the whole URL, so an unexpected parameter would
// mint a fresh cache key and a fresh Sanity query on every request.
const QUERY_KEYS = ["locale", "path"];

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

const render = async (path: string, ctx: MarkdownContext): Promise<string | null> => {
	if (path === "/") return renderDoc(fetchHome, homeMarkdown, ctx);
	if (path === "/about") {
		const home = await fetchHome(ctx.locale);
		return home ? aboutMarkdown(home, { ...ctx, lead: plainText(home.body) }) : null;
	}
	if (path === "/contact") return renderDoc(fetchContact, contactMarkdown, ctx);
	if (path === "/legal") return renderDoc(fetchLegal, legalMarkdown, ctx);
	if (path === "/iska") return iskaMarkdown(iskaContent[ctx.locale], ctx);

	if (path === "/expertise") return renderExpertise(null, ctx);
	if (path === "/publications") return renderPublications(null, ctx);

	const publication = path.match(/^\/publications\/([^/]+)$/);
	if (publication?.[1]) return renderPublications(publication[1], ctx);

	const field = path.match(/^\/expertise\/([^/]+)$/);
	if (field?.[1]) return renderExpertise(field[1], ctx);

	return null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (methodNotAllowed(req.method)) {
		res.statusCode = 405;
		res.setHeader("Allow", "GET, HEAD");
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("");
		return;
	}

	const ctx: AgentContext = agentContext(req.query.locale);
	const unexpected = unexpectedQuery(req.query, QUERY_KEYS);

	let body: string | null = null;
	let failed = false;

	try {
		if (!unexpected) body = await render(routePath(req.query.path), ctx);
	} catch (err) {
		// Told apart from a page that genuinely does not exist: answering 404 here
		// would tell an agent the URL is wrong when the CMS is merely down.
		failed = true;
		console.error("markdown render failed", req.query.path, err);
	}

	res.statusCode = failed ? 503 : body ? 200 : 404;
	res.setHeader("Content-Type", "text/markdown; charset=utf-8");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("Vary", varyWithAccept(null));

	// A miss is cached too, briefly: the path comes from the URL, so an agent
	// walking guessed URLs would otherwise reach Sanity on every one of them.
	res.setHeader("Cache-Control", failed ? "no-store" : "s-maxage=60, stale-while-revalidate=86400");

	if (failed) {
		// Not the 404 document: a body reading "this URL does not exist" beside a
		// status meaning "try again later" is the contradiction this separates.
		res.setHeader("Retry-After", "120");
		res.end(unavailableMarkdown(ctx));
		return;
	}

	res.end(body ?? notFoundMarkdown(ctx));
}
