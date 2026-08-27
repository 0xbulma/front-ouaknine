import type { NextApiRequest, NextApiResponse } from "next";
import type { AgentLabels } from "../../libs/agent-context";
import { agentContext } from "../../libs/agent-context";
import { fetchExpertise } from "../../libs/expertise";
import { leadSentence, llmsTxt } from "../../libs/llms-txt";
import { plainText } from "../../libs/plain-text";
import { methodNotAllowed, unexpectedQuery } from "../../libs/query-guard";
import { pageUrl } from "../../libs/site-url";
import type { LinkItem, Locale } from "../../libs/types";

// /llms.txt, routed by proxy.ts rather than by a next.config.js rewrite:
// the file has a French and an English edition and only middleware knows which
// one was asked for. Built from the CMS rather than checked in, so a field
// renamed in the studio does not leave a dead link here.

// The middleware only ever sends the locale; the route is also reachable
// directly, and the CDN keys on the whole URL, so an unexpected parameter would
// defeat `s-maxage` and mint one Sanity query per request.
const QUERY_KEYS = ["locale"];

// Each field of expertise doubles as when-to-use guidance: the note says what
// kind of matter belongs there.
const fieldLinks = async (locale: Locale, labels: AgentLabels): Promise<LinkItem[]> => {
	const expertise = await fetchExpertise(locale);

	return (expertise?.expertiseList ?? []).map((field) => ({
		label: field.title?.trim(),
		url: pageUrl(locale, `/expertise/${field.slug}`),
		note: leadSentence(plainText(field.description, 600)) || labels.whenToUseNote,
	}));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (methodNotAllowed(req.method)) {
		res.statusCode = 405;
		res.setHeader("Allow", "GET, HEAD");
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.end("");
		return;
	}

	const { locale, labels, contact, pages } = agentContext(req.query.locale);

	if (unexpectedQuery(req.query, QUERY_KEYS)) {
		res.statusCode = 404;
		res.setHeader("Content-Type", "text/plain; charset=utf-8");
		res.setHeader("X-Content-Type-Options", "nosniff");
		res.end("");
		return;
	}

	let fields: LinkItem[] = [];

	try {
		fields = await fieldLinks(locale, labels);
	} catch (err) {
		console.error("llms.txt field list failed", locale, err);
	}

	// An empty list is the same outcome as a thrown one: `fetchExpertise`
	// projects `[0]`, so an unpublished document resolves to null and the file
	// loses its practice areas without anything rejecting. Either way a CDN must
	// not hold that edition for a day.
	const degraded = fields.length === 0;

	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain; charset=utf-8");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader(
		"Cache-Control",
		degraded ? "no-store" : "s-maxage=3600, stale-while-revalidate=86400",
	);
	res.end(
		llmsTxt({
			locale,
			labels,
			contact,
			pages,
			fields,
			otherLocale: locale === "fr" ? "en" : "fr",
		}),
	);
}
