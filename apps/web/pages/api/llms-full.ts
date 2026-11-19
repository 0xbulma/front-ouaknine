import type { NextApiRequest, NextApiResponse } from "next";

import { agentContext } from "../../libs/agent-context";
import { fetchExpertise } from "../../libs/expertise";
import { fullPaths, llmsFull } from "../../libs/llms-full";
import { llmsHeader } from "../../libs/llms-txt";
import { renderPage } from "../../libs/page-render";
import { fetchPublications } from "../../libs/publications";
import { methodNotAllowed, unexpectedQuery } from "../../libs/query-guard";

// /llms-full.txt, routed by proxy.ts the way /llms.txt is, for the same reason:
// a French and an English edition, and only the proxy knows which was asked
// for. Every page is rendered by libs/page-render.ts, the code behind each
// page's own .md URL, so this file cannot say anything the pages do not.

// The proxy only ever sends the locale; anything else would mint a CDN key and
// a full set of Sanity queries per request.
const QUERY_KEYS = ["locale"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (methodNotAllowed(req.method)) {
		res.statusCode = 405;
		res.setHeader("Allow", "GET, HEAD");
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("");
		return;
	}

	const ctx = agentContext(req.query.locale);

	if (unexpectedQuery(req.query, QUERY_KEYS)) {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.end("");
		return;
	}

	// Any page missing from the file, for whatever reason, makes this edition
	// degraded: it still ships, but a CDN must not hold it for an hour.
	let degraded = false;

	const listing = async <T>(name: string, load: () => Promise<T[]>): Promise<T[]> => {
		try {
			const items = await load();
			if (items.length === 0) degraded = true;
			return items;
		} catch (err) {
			degraded = true;
			console.error("llms-full.txt listing failed", name, ctx.locale, err);
			return [];
		}
	};

	const [fields, posts] = await Promise.all([
		listing("expertise", async () => (await fetchExpertise(ctx.locale))?.expertiseList ?? []),
		listing("publications", () => fetchPublications(ctx.locale)),
	]);

	const paths = fullPaths(
		ctx.pages,
		fields.map((field) => field.slug),
		posts.map((post) => post.slug),
	);

	// Rendered without the `## Pages` list every page's markdown ends on: here
	// it would be the same list once per page, and the pages themselves follow.
	const bare = { ...ctx, pages: [] };
	const results = await Promise.allSettled(paths.map((path) => renderPage(path, bare)));

	const documents = results.flatMap((result, index) => {
		if (result.status === "fulfilled" && result.value) return [result.value];
		degraded = true;
		console.error(
			"llms-full.txt page missing",
			paths[index],
			result.status === "rejected" ? result.reason : "no document",
		);
		return [];
	});

	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader(
		"Cache-Control",
		degraded ? "no-store" : "s-maxage=3600, stale-while-revalidate=86400",
	);
	res.end(llmsFull(llmsHeader(ctx), documents));
}
