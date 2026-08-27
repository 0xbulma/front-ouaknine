import {
	HOST,
	markdownSibling,
	markdownUrl,
	pageUrl,
	resolveLocale,
	routePath,
	withLocale,
} from "./site-url";

test("French is unprefixed, English carries /en, the root keeps its slash", () => {
	expect(withLocale("fr", "/")).toBe("/");
	expect(withLocale("en", "/")).toBe("/en");
	expect(withLocale("fr", "/contact")).toBe("/contact");
	expect(withLocale("en", "/contact")).toBe("/en/contact");
	expect(withLocale("en", "/expertise/criminal-law")).toBe("/en/expertise/criminal-law");
});

test("the host is an origin, whatever the environment holds", () => {
	// The value itself comes from libs/site.ts, which owns the env parsing; this
	// asserts only the shape every URL here concatenates onto. Pinning a literal
	// would fail the suite for anyone who exports NEXT_PUBLIC_HOST.
	expect(HOST).toMatch(/^https:\/\/[^/]+$/);
	expect(HOST.endsWith("/")).toBe(false);
});

test("pageUrl is the same path against the host", () => {
	expect(pageUrl("fr", "/")).toBe(`${HOST}/`);
	expect(pageUrl("en", "/")).toBe(`${HOST}/en`);
	expect(pageUrl("en", "/about")).toBe(`${HOST}/en/about`);
});

test("a locale from a query string is only ever fr or en", () => {
	expect(resolveLocale("fr")).toBe("fr");
	expect(resolveLocale("en")).toBe("en");
	expect(resolveLocale("de")).toBe("fr");
	expect(resolveLocale(undefined)).toBe("fr");
	expect(resolveLocale(["en"])).toBe("fr");
});

test("a locale root spells its markdown sibling /index.md", () => {
	expect(markdownSibling("/")).toBe("/index.md");
	expect(markdownSibling("/en")).toBe("/en/index.md");
	expect(markdownSibling("/contact")).toBe("/contact.md");
	expect(markdownSibling("/en/contact")).toBe("/en/contact.md");
	expect(markdownSibling("/expertise/droit-penal-general")).toBe(
		"/expertise/droit-penal-general.md",
	);
});

test("markdownUrl carries the locale and the host", () => {
	expect(markdownUrl("fr", "/")).toBe(`${HOST}/index.md`);
	expect(markdownUrl("en", "/")).toBe(`${HOST}/en/index.md`);
	expect(markdownUrl("en", "/contact")).toBe(`${HOST}/en/contact.md`);
});

test("routePath survives a query parameter that is not a string", () => {
	// `req.query.path` is an array when the parameter repeats. It used to throw,
	// and the route reported the site as down for a malformed request.
	expect(routePath(["/contact", "/legal"])).toBe("/");
	expect(routePath(null)).toBe("/");
	expect(routePath(42)).toBe("/");
});

test("routePath is the inverse the markdown route reads", () => {
	// `/index` is not folded here: only the `.md` branch may undo the filename a
	// locale root's sibling carries.
	expect(routePath("/index")).toBe("/index");
	expect(routePath("/")).toBe("/");
	expect(routePath("")).toBe("/");
	expect(routePath(undefined)).toBe("/");
	expect(routePath("contact")).toBe("/contact");
	expect(routePath("/contact/")).toBe("/contact");
	expect(routePath("/contact///")).toBe("/contact");
	expect(routePath("/expertise/droit-penal-general")).toBe("/expertise/droit-penal-general");
});

test("every public path round-trips through its markdown sibling", () => {
	for (const path of ["/", "/about", "/contact", "/expertise/criminal-law"]) {
		for (const locale of ["fr", "en"]) {
			const sibling = markdownSibling(withLocale(locale, path));
			const stem = sibling.slice(0, -".md".length).replace(/^\/en/, "");
			expect(routePath(stem === "/index" ? "/" : stem)).toBe(path);
		}
	}
});
