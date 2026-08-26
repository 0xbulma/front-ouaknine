import { internalPath, isSafeExternal } from "./href";
import { isPress, seriesOf, splitTitle } from "./publication-fields";
import { slugify } from "./slug";

// slugify is the single derivation behind every publication URL, every field of
// expertise URL, every hreflang and every @id in the JSON-LD graph. It has
// already broken once on this branch: the combining-diacritic range was written
// as two invisible literal characters instead of the escape, a diff no reviewer
// can see. These pin the behaviour that regression changed.
test("slugify strips accents", () => {
	expect(slugify("Droit pénal des affaires")).toBe("droit-penal-des-affaires");
	expect(slugify("Cyber-criminalité")).toBe("cyber-criminalite");
	expect(slugify("Guide de survie en garde à vue - Épisode 1 : Connaître ses droits")).toBe(
		"guide-de-survie-en-garde-a-vue-episode-1-connaitre-ses-droits",
	);
});

test("slugify tolerates nothing", () => {
	expect(slugify(null)).toBe("");
	expect(slugify(undefined)).toBe("");
	expect(slugify("")).toBe("");
});

// splitTitle feeds the h1, the title tag, the index grouping, the rail numbering
// and the schema isPartOf. Its four quadrants are (series field) x (title match).
test("splitTitle parses an episode title", () => {
	expect(
		splitTitle({ title: "Guide de survie – Épisode 2 : Connaître les raisons" }),
	).toStrictEqual({
		series: "Guide de survie",
		episode: 2,
		title: "Connaître les raisons",
	});
});

test("splitTitle still strips the title when the series field is set", () => {
	expect(
		splitTitle({
			title: "Guide de survie – Épisode 2 : Connaître les raisons",
			series: "Guide de survie",
			episode: 2,
		}),
	).toStrictEqual({
		series: "Guide de survie",
		episode: 2,
		title: "Connaître les raisons",
	});
});

test("splitTitle leaves a standalone title whole", () => {
	const title = "Sapin II, article 17 - les huit piliers";
	expect(splitTitle({ title })).toStrictEqual({
		series: null,
		episode: null,
		title,
	});
});

test("splitTitle never yields an empty heading", () => {
	const title = "Guide de survie – Épisode 6";
	expect(splitTitle({ title }).title).toBe(title);
	expect(splitTitle({}).title).toBe("");
});

test("seriesOf orders by episode, not by publication date", () => {
	const posts = [
		{ _id: "a", title: "G – Épisode 1 : a", publishedAt: "2027-05-01" },
		{ _id: "b", title: "G – Épisode 2 : b", publishedAt: "2027-04-01" },
		{ _id: "c", title: "G – Épisode 3 : c", publishedAt: "2027-03-01" },
	];

	expect(seriesOf(posts, "G").map((entry) => entry.episode)).toStrictEqual([1, 2, 3]);
});

// Getting this wrong publishes Alice Ouaknine as the author of Le Monde's copy.
test("a document carrying someone else's URL is press whatever filter says", () => {
	expect(isPress({ filter: "press" })).toBe(true);
	expect(isPress({ source: "https://lemonde.fr/x" })).toBe(true);
	expect(isPress({ filter: "fact" })).toBe(false);
	expect(isPress({})).toBe(false);
});

// Link marks and `source` are free text an editor fills. Both decisions used to
// be written twice and drifted; these pin the one that survived.
test("internalPath keeps a same-site link on the site", () => {
	expect(internalPath("https://www.ouaknine-avocats.com/articles/abc")).toBe("/articles/abc");
	expect(internalPath("/publications/x")).toBe("/publications/x");
	expect(internalPath("#top")).toBe("#top");
	// The bare domain, which is what an editor gets by copying it.
	expect(internalPath("https://ouaknine-avocats.com/publications/x")).toBe("/publications/x");
});

test("internalPath sends everything else away", () => {
	expect(internalPath("https://evil.com/")).toBe(null);
	expect(internalPath("//evil.com")).toBe(null);
	expect(internalPath("/\\evil.com")).toBe(null);
	expect(internalPath("https://www.ouaknine-avocats.com@evil.com")).toBe(null);
	expect(internalPath("https://notouaknine-avocats.com/x")).toBe(null);
	expect(internalPath("javascript:alert(1)")).toBe(null);
	// A real subdomain is somewhere else. internalPath returns a bare path, so
	// calling it internal would silently land the reader on the apex.
	expect(internalPath("https://blog.ouaknine-avocats.com/x")).toBe(null);
});

test("internalPath never returns a protocol-relative path", () => {
	// `new URL` resolves `..` before pathname is read, so these arrive as
	// "//evil.com" unless the leading slashes are collapsed.
	for (const href of ["/..//evil.com", "/.//evil.com", "/a/../..//evil.com"]) {
		const path = internalPath(href);
		expect(path === null || !path.startsWith("//"), `${href} -> ${path}`).toBe(true);
	}
});

test("isSafeExternal refuses anything it does not recognise", () => {
	expect(isSafeExternal("https://lemonde.fr/x")).toBe(true);
	expect(isSafeExternal("mailto:a@b.c")).toBe(true);
	expect(isSafeExternal("javascript:alert(1)")).toBe(false);
	expect(isSafeExternal("  JAVASCRIPT:alert(1)")).toBe(false);
	expect(isSafeExternal("data:text/html,x")).toBe(false);
	expect(isSafeExternal(null)).toBe(false);
	expect(isSafeExternal(undefined)).toBe(false);
});

// libs/site.ts owns the origin behind every canonical, hreflang, sitemap loc and
// @id, and it reads the environment at module scope — so these re-import it with
// the variable stubbed. Both cases below used to pass the guard: one throws, the
// other parses to an opaque origin and is the silent half.
const withHost = async <T>(host: string, read: () => Promise<T>): Promise<T> => {
	vi.stubEnv("NEXT_PUBLIC_HOST", host);
	vi.resetModules();
	try {
		return await read();
	} finally {
		vi.unstubAllEnvs();
		vi.resetModules();
	}
};

test("a bad NEXT_PUBLIC_HOST falls back instead of poisoning every URL", async () => {
	for (const bad of ["", "ouaknine-avocats.com", "mailto:a@b.c", "javascript:1"]) {
		const probe = await withHost(bad, async () => {
			const { SITE_URL, SITE_HOSTS } = await import("./site");
			const { internalPath: resolve } = await import("./href");
			return { SITE_URL, SITE_HOSTS, js: resolve("javascript:alert(1)") };
		});

		expect(probe.SITE_URL, `SITE_URL for ${bad}`).toBe("https://www.ouaknine-avocats.com");
		expect(probe.SITE_HOSTS).toStrictEqual(["ouaknine-avocats.com", "www.ouaknine-avocats.com"]);
		expect(probe.js, `javascript: href must never be internal (${bad})`).toBe(null);
	}
});

test("SITE_HOSTS is the same pair whichever spelling the env var uses", async () => {
	const read = (host: string) => withHost(host, async () => (await import("./site")).SITE_HOSTS);

	expect(await read("https://ouaknine-avocats.com")).toStrictEqual(
		await read("https://www.ouaknine-avocats.com"),
	);
});
