import {
	MARKDOWN_ROUTE,
	NOT_ACCEPTABLE_ROUTE,
	type PassDecision,
	type RedirectDecision,
	type RewriteDecision,
	type RouteInput,
	route,
} from "./middleware-route";
import { HOST } from "./site-url";

const CHROME =
	"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";

// The decision is a tagged union, so a test that reads `.path` has to say which
// branch it expected. Throwing here rather than reading `undefined` off the
// wrong variant names the branch that actually fired.
const wrongBranch = (input: RouteInput, want: string, got: string) =>
	new Error(`expected ${want}, got ${got} for ${JSON.stringify(input)}`);

const passing = (input: RouteInput): PassDecision => {
	const decision = route(input);
	if (decision.kind !== "pass") throw wrongBranch(input, "pass", decision.kind);
	return decision;
};

const rewriting = (input: RouteInput): RewriteDecision => {
	const decision = route(input);
	if (decision.kind !== "rewrite") throw wrongBranch(input, "rewrite", decision.kind);
	return decision;
};

const redirecting = (input: RouteInput): RedirectDecision => {
	const decision = route(input);
	if (decision.kind !== "redirect") throw wrongBranch(input, "redirect", decision.kind);
	return decision;
};

test("a browser gets the page, plus Vary and the markdown alternate", () => {
	const decision = passing({ pathname: "/contact", accept: CHROME });

	expect(decision.vary).toBe(true);
	expect(decision.link).toBe(`<${HOST}/contact.md>; rel="alternate"; type="text/markdown"`);
});

test("the alternate carries the locale", () => {
	const decision = passing({ pathname: "/contact", locale: "en", accept: CHROME });

	expect(decision.link?.startsWith(`<${HOST}/en/contact.md>`), decision.link).toBe(true);
});

test("an agent asking for markdown is rewritten to the markdown route", () => {
	expect(route({ pathname: "/contact", accept: "text/markdown" })).toStrictEqual({
		kind: "rewrite",
		route: MARKDOWN_ROUTE,
		path: "/contact",
		vary: true,
	});
});

test("an explicit .md URL is markdown whatever the Accept header says", () => {
	for (const accept of [CHROME, undefined, "*/*"]) {
		const decision = rewriting({ pathname: "/contact.md", accept });

		expect(decision.route).toBe(MARKDOWN_ROUTE);
		expect(decision.path).toBe("/contact");
	}
});

test("an Accept header that rules out both types is a 406", () => {
	const decision = rewriting({ pathname: "/contact", accept: "application/pdf" });

	expect(decision.route).toBe(NOT_ACCEPTABLE_ROUTE);
	expect(decision.vary).toBe(true);
});

test("/llms.txt is rewritten to its generator", () => {
	expect(route({ pathname: "/llms.txt", accept: CHROME })).toStrictEqual({
		kind: "rewrite",
		route: "/api/llms",
		path: undefined,
	});
});

test("a non-negotiable path is passed straight through", () => {
	expect(route({ pathname: "/favicon.ico", accept: CHROME })).toStrictEqual({
		kind: "pass",
	});
});

// --- the ordering cases, each of which shipped as a bug ---

test("a query string on a markdown request collapses onto the bare path", () => {
	for (const pathname of ["/contact.md", "/llms.txt"]) {
		const decision = redirecting({ pathname, search: "?bust=1", accept: CHROME });

		expect(decision.to, pathname).toBe(pathname);
	}

	const negotiated = redirecting({
		pathname: "/",
		search: "?bust=1",
		accept: "text/markdown",
	});
	expect(negotiated.to).toBe("/");
});

test("the collapse keeps the locale, and carries Vary", () => {
	// Built from the locale-stripped pathname alone, this 308 permanently
	// redirected every English edition to the French one.
	const decision = redirecting({
		pathname: "/contact.md",
		search: "?bust=1",
		locale: "en",
		accept: CHROME,
	});

	expect(decision.to).toBe("/en/contact.md");
	expect(decision.vary).toBe(true);
});

test("the HTML branch keeps its query, where a campaign parameter is legitimate", () => {
	passing({ pathname: "/contact", search: "?utm_source=x", accept: CHROME });
});

test("a data prefetch is passed through, naming the header in Vary", () => {
	// The flag comes from a request header a client can send, so a cache keyed on
	// (URL, Accept) alone would hand this variant to the next client asking for
	// markdown.
	const decision = passing({
		pathname: "/contact",
		accept: "text/markdown",
		isData: true,
	});

	expect(decision.vary).toBe("Accept, Accept-Encoding, x-nextjs-data");
});

test("the data flag does not preempt an explicit .md URL or /llms.txt", () => {
	// Placed above those branches, the flag answered both with an empty data
	// document instead of the file that was asked for.
	const md = rewriting({ pathname: "/contact.md", accept: CHROME, isData: true });
	expect(md.route).toBe(MARKDOWN_ROUTE);

	const llms = rewriting({ pathname: "/llms.txt", accept: CHROME, isData: true });
	expect(llms.route).toBe("/api/llms");
});

test("every branch that answers on the negotiated path sets Vary", () => {
	// Without it a CDN serves whichever variant it cached first to everyone.
	const negotiated: RouteInput[] = [
		{ pathname: "/contact", accept: CHROME },
		{ pathname: "/contact", accept: "text/markdown" },
		{ pathname: "/contact", accept: "application/pdf" },
		{ pathname: "/contact.md", accept: CHROME },
		{ pathname: "/contact", accept: CHROME, isData: true },
		{ pathname: "/contact.md", search: "?x=1", accept: CHROME },
	];

	for (const input of negotiated) {
		expect(route(input).vary, JSON.stringify(input)).toBeTruthy();
	}
});

test("a .md spelling nothing publishes is not a second URL for the page", () => {
	// `/contact/.md` sliced to `/contact/`, which routePath trimmed back to
	// `/contact`, so every page answered 200 markdown at a URL no annotation
	// names — a duplicate representation and an extra CDN key.
	for (const pathname of ["/contact/.md", "/.md", "/en/.md", "/expertise/.md"]) {
		expect(route({ pathname, accept: "text/markdown" }), pathname).toStrictEqual({
			kind: "pass",
		});
	}

	// The canonical spellings still resolve.
	expect(rewriting({ pathname: "/contact.md", accept: "*/*" }).route).toBe(MARKDOWN_ROUTE);
	expect(rewriting({ pathname: "/index.md", accept: "*/*" }).path).toBe("/");
});

test("only the .md branch may spell the root as index", () => {
	// `/index.md` is the sibling `markdownSibling` publishes for a locale root,
	// so it resolves to `/`. `/index` reached by negotiation is not a URL this
	// site has: it answered 200 markdown while its HTML twin answered 404.
	expect(rewriting({ pathname: "/index.md", accept: "*/*" }).path).toBe("/");

	const negotiated = rewriting({ pathname: "/index", accept: "text/markdown" });
	expect(negotiated.path).toBe("/index");
});
