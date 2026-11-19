import type { NextApiRequest, NextApiResponse } from "next";

import { varyWithAccept } from "../../libs/accept";
import type { AgentContext } from "../../libs/agent-context";
import { agentContext } from "../../libs/agent-context";
import { notFoundMarkdown, unavailableMarkdown } from "../../libs/page-markdown";
import { renderPage } from "../../libs/page-render";
import { methodNotAllowed, unexpectedQuery } from "../../libs/query-guard";
import { routePath } from "../../libs/site-url";

// The text/markdown representation of every page. Reached through the
// proxy, either from an Accept header or from a .md URL. Which fetcher and
// renderer answer a path is libs/page-render.ts, shared with /llms-full.txt.

// The middleware only ever sends these two. The route is also reachable
// directly, and the CDN keys on the whole URL, so an unexpected parameter would
// mint a fresh cache key and a fresh Sanity query on every request.
const QUERY_KEYS = ["locale", "path"];

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
		if (!unexpected) body = await renderPage(routePath(req.query.path), ctx);
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
