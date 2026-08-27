import { isMarkdownPath, isNegotiablePath, preferredType } from "./accept";
import { markdownUrl, withLocale } from "./site-url";

// What the proxy should do with a request, as a value.
//
// The decision lives here rather than in proxy.ts because the suite cannot
// import that file, and the branch *ordering* is what has repeatedly broken: a
// redirect built from the locale-stripped path, a data guard placed above the
// branches it then preempted, a variant served without naming its discriminator
// in `Vary`. None of those are visible in a leaf primitive; all of them are one
// table-driven case here.
//
// proxy.ts turns the tag into a NextResponse and does nothing else.

export const MARKDOWN_ROUTE = "/api/markdown";
export const NOT_ACCEPTABLE_ROUTE = "/api/not-acceptable";

// Generated rather than a file in public/, so that the URLs it lists follow the
// CMS. Routed here, and not through a rewrite in next.config.js like
// /sitemap.xml, because the file has a French and an English edition and only
// middleware knows which one was asked for.
export const WELL_KNOWN: Record<string, string> = {
	"/llms.txt": "/api/llms",
};

// `true` means "add Accept to whatever Vary already says"; a string is the
// header verbatim, for the branch that also varies on x-nextjs-data.
export type Vary = true | string;

export type PassDecision = { kind: "pass"; vary?: Vary; link?: string };
export type RewriteDecision = { kind: "rewrite"; route: string; path?: string; vary?: Vary };
export type RedirectDecision = { kind: "redirect"; to: string; vary: Vary };

export type RouteDecision = PassDecision | RewriteDecision | RedirectDecision;

export type RouteInput = {
	pathname: string;
	search?: string;
	locale?: string;
	accept?: string | null;
	isData?: boolean;
};

const rewrite = (to: string, path?: string): RewriteDecision => ({
	kind: "rewrite",
	route: to,
	path,
});

export const route = ({
	pathname,
	search = "",
	locale = "fr",
	accept,
	isData = false,
}: RouteInput): RouteDecision => {
	// No page on this site takes a query parameter, but the CDN keys on the whole
	// URL, so `?bust=n` on a markdown request would miss the cache and reach the
	// CMS every time. Collapsing the variants onto one URL bounds that; the HTML
	// branch keeps its query, where a campaign parameter is legitimate.
	//
	// The target carries the locale: `pathname` arrives stripped, and a 308 built
	// from it alone permanently redirects the English edition to the French one.
	const redirect = (): RedirectDecision => ({
		kind: "redirect",
		to: withLocale(locale, pathname),
		vary: true,
	});

	const wellKnown = WELL_KNOWN[pathname];
	if (wellKnown) {
		return search ? redirect() : rewrite(wellKnown);
	}

	if (!isNegotiablePath(pathname)) return { kind: "pass" };

	// An explicit .md URL is markdown whatever the Accept header says: it is what
	// `Link: rel="alternate"` points at, and a crawler following it may send no
	// Accept header at all.
	if (isMarkdownPath(pathname)) {
		if (search) return redirect();

		// `markdownSibling` never produces a stem that is empty or ends in a
		// slash, so `/contact/.md` and `/.md` are spellings nothing publishes.
		// Rendering them would give every page a second 200 representation and a
		// second CDN key; they fall through to the HTML 404 instead.
		const stem = pathname.slice(0, -".md".length);
		if (stem === "" || stem.endsWith("/")) return { kind: "pass" };

		// `/index` is the filename a locale root's sibling carries, and this is the
		// only branch allowed to undo it: reached through Accept negotiation
		// instead, `/index` would be a second URL answering 200 for the home page
		// while its HTML representation answers 404.
		const path = stem === "/index" ? "/" : stem;

		return { ...rewrite(MARKDOWN_ROUTE, path), vary: true };
	}

	// Next hoists `_next/data/<buildId>` ahead of the matcher's lookahead, so
	// every <Link> prefetch payload reaches the proxy. None of them is
	// negotiable: left to negotiate, a prefetch sending `Accept: application/json`
	// gets a 406.
	//
	// Below the two branches above, not above them: a prefetch never asks for a
	// `.md` URL or /llms.txt, and preempting those answered both with an empty
	// data document. The flag comes from a request header a client can send, so
	// it is named in `Vary` — a shared cache keyed on (URL, Accept) alone would
	// serve this variant to the next client that asked for markdown.
	if (isData) return { kind: "pass", vary: "Accept, Accept-Encoding, x-nextjs-data" };

	const chosen = preferredType(accept);

	if (chosen === "text/markdown") {
		if (search) return redirect();

		return { ...rewrite(MARKDOWN_ROUTE, pathname), vary: true };
	}

	// The 406 is rendered by an API route. Next 16's proxy runs on Node and
	// could return a body itself; keeping the route means the decision here
	// stays a value, which is what makes it testable.
	if (chosen === null) return { ...rewrite(NOT_ACCEPTABLE_ROUTE), vary: true };

	// Built from HOST, not the request origin, so this header and the
	// `<link rel='alternate'>` in the page's head name the same URL.
	return {
		kind: "pass",
		vary: true,
		link: `<${markdownUrl(locale, pathname)}>; rel="alternate"; type="text/markdown"`,
	};
};
