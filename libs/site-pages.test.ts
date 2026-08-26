import agentContent from "../content/agentContent.json";
import contactContent from "../content/contactContent.json";
import footerContent from "../content/footerContent.json";
import headerContent from "../content/headerContent.json";
import iskaContent from "../content/iskaContent.json";
import { sitePages } from "./site-pages";
import { HOST } from "./site-url";
import type { Locale, NavLink, SitePagesLabels } from "./types";

const labels: SitePagesLabels = {
	homeNote: "accueil",
	publicationsLabel: "Publications",
	publicationsNote: "les écrits du cabinet",
	aboutLabel: "Le cabinet",
	aboutNote: "le cabinet",
	expertiseNote: "compétences",
	contactNote: "coordonnées",
	iskaNote: "réseau",
	legalNote: "mentions",
};

const nav: NavLink[] = [
	{ label: "Le Cabinet", url: "/" },
	{ label: "Expertise", url: "/expertise" },
	{ label: "Contact", url: "/contact" },
];

const labelsWithFallbacks: SitePagesLabels = {
	...labels,
	footerLead: "Cabinet Ouaknine",
	expertiseLabel: "Expertise",
	contactLabel: "Contact",
	publicationsLabel: "Publications",
};

const args = { labels, nav, iskaTitle: "Réseau ISKA", legalLabel: "Mentions Légales" };

test("every public page is listed once, with a label, a note and an absolute URL", () => {
	const pages = sitePages("fr", args);

	expect(pages.map((page) => page.path)).toStrictEqual([
		"/",
		"/about",
		"/expertise",
		"/publications",
		"/contact",
		"/iska",
		"/legal",
	]);

	for (const page of pages) {
		expect(page.label, `label for ${page.path}`).toBeTruthy();
		expect(page.note, `note for ${page.path}`).toBeTruthy();
		expect(page.url.startsWith(HOST), page.url).toBe(true);
	}
});

test("the English edition carries the /en prefix on every entry", () => {
	const pages = sitePages("en", args);

	expect(pages[0]?.url).toBe(`${HOST}/en`);
	expect(pages[1]?.url).toBe(`${HOST}/en/about`);
	expect(pages[6]?.url).toBe(`${HOST}/en/legal`);
});

test("nav labels are resolved by url, so reordering the nav cannot relabel a page", () => {
	const reordered: NavLink[] = [
		{ label: "Contact", url: "/contact" },
		{ label: "Le Cabinet", url: "/" },
		{ label: "Expertise", url: "/expertise" },
	];

	const pages = sitePages("fr", { ...args, labels: labelsWithFallbacks, nav: reordered });

	expect(pages.find((page) => page.path === "/")?.label).toBe("Le Cabinet");
	expect(pages.find((page) => page.path === "/expertise")?.label).toBe("Expertise");
	expect(pages.find((page) => page.path === "/contact")?.label).toBe("Contact");
});

test("a nav missing an entry falls back rather than throwing", () => {
	const pages = sitePages("fr", {
		...args,
		labels: labelsWithFallbacks,
		nav: [{ label: "Le Cabinet", url: "/" }],
	});

	expect(pages).toHaveLength(7);
	expect(pages.find((page) => page.path === "/expertise")?.label).toBe("Expertise");
	expect(pages.find((page) => page.path === "/contact")?.label).toBe("Contact");
});

test("the real agent copy fills every label and note, in both languages", () => {
	// Binds the fixture names above to the file the routes actually pass in: a
	// key renamed in agentContent.json would otherwise ship `undefined` into
	// llms.txt with the suite still green.
	for (const locale of ["fr", "en"] satisfies Locale[]) {
		const pages = sitePages(locale, {
			labels: agentContent[locale],
			nav: headerContent[locale].nav,
			iskaTitle: iskaContent[locale].title,
			legalLabel: footerContent[locale].link2,
		});

		for (const page of pages) {
			expect(typeof page.label, `${locale} ${page.path} label`).toBe("string");
			expect(page.label?.trim(), `${locale} ${page.path} label is empty`).toBeTruthy();
			expect(typeof page.note, `${locale} ${page.path} note`).toBe("string");
			expect(page.note?.trim(), `${locale} ${page.path} note is empty`).toBeTruthy();
		}

		// Every other string the renderers read off `labels`. Renaming any of them
		// in the studio-facing JSON is a blank heading or a literal `undefined` in
		// llms.txt, and `guidance` is a 500 — none of which the page loop above
		// would notice.
		const copy = agentContent[locale];
		for (const key of [
			"summary",
			"whenToUse",
			"whenToUseLead",
			"whenToUseNote",
			"pages",
			"sitemapNote",
			"englishNote",
			"otherLocaleLabel",
			"expertiseLabel",
			"contactLabel",
			"publicationsLabel",
			"publicationsNote",
			"publicationsArticles",
			"publicationsPress",
			"notFoundTitle",
			"notFoundBody",
			"unavailableTitle",
			"unavailableBody",
			"footerLead",
		] as const) {
			expect(typeof copy[key], `${locale} ${key}`).toBe("string");
			expect(copy[key].trim(), `${locale} ${key} is empty`).toBeTruthy();
		}

		expect(Array.isArray(copy.guidance), `${locale} guidance`).toBe(true);
		expect(copy.guidance.length, `${locale} guidance is empty`).toBeGreaterThan(0);

		// And the contact labels the contact document renders.
		for (const key of ["addressLabel", "phoneLabel", "mobileLabel", "emailLabel"] as const) {
			expect(contactContent[locale][key].trim(), `${locale} ${key}`).toBeTruthy();
		}

		// And the ISKA copy, which is the one page whose whole body is a content
		// file rather than the CMS.
		const iska = iskaContent[locale];
		for (const key of ["title", "tagline", "networkTitle", "bringTitle", "skillsTitle"] as const) {
			expect(iska[key].trim(), `${locale} iska ${key}`).toBeTruthy();
		}
		for (const key of ["network", "bring", "skills"] as const) {
			expect(Array.isArray(iska[key]), `${locale} iska ${key}`).toBe(true);
			expect(iska[key].length, `${locale} iska ${key} is empty`).toBeGreaterThan(0);
		}
	}
});
