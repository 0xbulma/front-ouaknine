import { fullPaths, llmsFull } from "./llms-full";
import { llmsHeader } from "./llms-txt";
import type { ContactStore, LlmsLabels } from "./types";

const CONTACT: ContactStore = {
	phone: "+33184162035",
	fr: {
		address: "17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35",
		email: "cabinet@ouaknine-avocats.com",
	},
	en: {
		address: "17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35",
		email: "cabinet@ouaknine-avocats.com",
	},
};

const LABELS: LlmsLabels = {
	footerLead: "Cabinet Ouaknine",
	summary: "Cabinet d’avocat dédié à la défense pénale.",
	guidance: ["Joignable au {phone}, à {email}."],
	whenToUse: "Quand solliciter ce cabinet",
	whenToUseLead: "Les situations pour lesquelles le cabinet est le bon interlocuteur.",
	pages: "Pages",
	sitemapNote: "toutes les URL du site",
	fullNote: "le site entier en un fichier",
	englishNote: "la même arborescence en anglais",
	otherLocaleLabel: "English",
};

const PAGES = ["/", "/about", "/expertise", "/publications", "/contact", "/iska", "/legal"].map(
	(path) => ({ path }),
);

const header = llmsHeader({ locale: "fr", labels: LABELS, contact: CONTACT });

const doc = (title: string, path: string) =>
	`# ${title}\n\nSource: https://www.ouaknine-avocats.com${path}\n\nCorps.\n\n---\n\nCabinet Ouaknine\n`;

test("every page of the llms.txt list is there, in its order", () => {
	expect(fullPaths(PAGES, [], [])).toStrictEqual(PAGES.map(({ path }) => path));
});

test("each field and each publication follows its own index", () => {
	expect(fullPaths(PAGES, ["droit-penal-general", "enquetes-internes"], ["guide-1"])).toStrictEqual(
		[
			"/",
			"/about",
			"/expertise",
			"/expertise/droit-penal-general",
			"/expertise/enquetes-internes",
			"/publications",
			"/publications/guide-1",
			"/contact",
			"/iska",
			"/legal",
		],
	);
});

test("the file opens on the llms.txt header, and only the header", () => {
	const file = llmsFull(header, [doc("Contact", "/contact")]);
	const lines = file.split("\n");

	expect(lines[0]).toBe("# Cabinet Ouaknine");
	expect(lines[2]).toBe("> Cabinet d’avocat dédié à la défense pénale.");
	expect(file.startsWith(header), file).toBe(true);
	// The link sections belong to llms.txt; here the pages themselves follow.
	expect(file.includes("## Quand solliciter ce cabinet")).toBe(false);
	expect(file.includes("## Optional")).toBe(false);
	expect(file.includes("Joignable au +33184162035, à cabinet@ouaknine-avocats.com.")).toBe(true);
});

test("each page keeps its title and source URL, in the order given", () => {
	const file = llmsFull(header, [doc("Accueil", "/"), doc("Contact", "/contact")]);

	const home = file.indexOf("# Accueil\n\nSource: https://www.ouaknine-avocats.com/\n");
	const contact = file.indexOf("# Contact\n\nSource: https://www.ouaknine-avocats.com/contact\n");
	expect(home, file).toBeGreaterThan(header.length - 1);
	expect(contact, file).toBeGreaterThan(home);
});

test("documents are separated by one blank line and the file ends on one newline", () => {
	const file = llmsFull(header, [doc("Accueil", "/"), doc("Contact", "/contact")]);

	expect(file.includes("\n\n\n")).toBe(false);
	expect(file.endsWith("Cabinet Ouaknine\n")).toBe(true);
});

test("a CMS outage still ships the header", () => {
	expect(llmsFull(header, [])).toBe(`${header}\n`);
});
