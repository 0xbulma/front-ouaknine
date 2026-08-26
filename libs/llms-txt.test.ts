import { type LlmsTxtInput, leadSentence, llmsTxt } from "./llms-txt";
import { HOST } from "./site-url";
import type { ContactStore, LlmsLabels } from "./types";

// Mirrors content/footerContent.json: the dial-safe number lives at the top
// level, the displayed one inside the address block.
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

const FR_LABELS: LlmsLabels = {
	footerLead: "Cabinet Ouaknine",
	summary: "Cabinet d’avocat dédié à la défense pénale.",
	guidance: ["Première consigne.", "Joignable au {phone}, à {email}."],
	whenToUse: "Quand solliciter ce cabinet",
	whenToUseLead: "Les situations pour lesquelles le cabinet est le bon interlocuteur.",
	pages: "Pages",
	sitemapNote: "toutes les URL du site",
	englishNote: "la même arborescence en anglais",
	otherLocaleLabel: "English",
};

const EN_LABELS: LlmsLabels = {
	footerLead: "Ouaknine Law Firm",
	summary: "Criminal defence law firm in Paris.",
	guidance: ["Reach the firm on {phone} or at {email}."],
	whenToUse: "When to use this firm",
	whenToUseLead: "The situations this firm is the right contact for.",
	pages: "Pages",
	sitemapNote: "every URL on the site",
	englishNote: "the same tree in French",
	otherLocaleLabel: "Français",
};

const build = (overrides: Partial<LlmsTxtInput> = {}) =>
	llmsTxt({
		locale: "fr",
		labels: FR_LABELS,
		contact: CONTACT,
		pages: [{ label: "Contact", path: "/contact", url: `${HOST}/contact`, note: "coordonnées" }],
		fields: [
			{
				label: "Droit pénal général",
				url: `${HOST}/expertise/droit-penal-general`,
				note: "la défense pénale de droit commun",
			},
		],
		otherLocale: "en",
		...overrides,
	});

test("the file follows the llmstxt.org order: H1, blockquote, prose, H2 lists", () => {
	const lines = build().split("\n");

	expect(lines[0]).toBe("# Cabinet Ouaknine");
	expect(lines[1]).toBe("");
	expect(lines[2]).toBe("> Cabinet d’avocat dédié à la défense pénale.");

	const headings = lines.filter((line) => line.startsWith("## "));
	expect(headings).toStrictEqual(["## Quand solliciter ce cabinet", "## Pages", "## Optional"]);
});

test("the when-to-use section names the fields and links each one", () => {
	const markdown = build();
	expect(
		markdown.includes("Les situations pour lesquelles le cabinet est le bon interlocuteur."),
	).toBe(true);
	expect(
		markdown.includes(
			`- [Droit pénal général](${HOST}/expertise/droit-penal-general): la défense pénale de droit commun`,
		),
	).toBe(true);
});

test("every bullet under an H2 is a markdown link", () => {
	const bullets = build()
		.split("\n")
		.filter((line) => line.startsWith("- "));

	expect(bullets.length).toBeGreaterThanOrEqual(3);
	for (const bullet of bullets) {
		expect(bullet).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)/);
	}
});

test("the contact facts and both well-known files are listed", () => {
	const markdown = build();
	expect(
		markdown.includes(
			"17 rue de Douai, 75009 Paris, France. +33 (0)1 84 16 20 35. cabinet@ouaknine-avocats.com",
		),
	).toBe(true);
	expect(markdown.includes(`- [sitemap.xml](${HOST}/sitemap.xml)`)).toBe(true);
	expect(markdown.includes(`- [English](${HOST}/en)`)).toBe(true);
	expect(markdown.endsWith("\n")).toBe(true);
});

test("a CMS outage drops the fields section rather than emitting an empty heading", () => {
	// The heading and its lead go together. Publishing "the situations this firm
	// is the right contact for" with no list under it is the empty section the
	// shared `section()` helper exists to prevent, and it reads as a broken file
	// rather than as a degraded one.
	const markdown = build({ fields: [] });

	expect(markdown.includes("## Quand solliciter ce cabinet")).toBe(false);
	expect(markdown.includes("Les situations pour lesquelles")).toBe(false);
	// The rest of the file still ships.
	expect(markdown.includes("## Pages")).toBe(true);
	expect(markdown.includes("## Optional")).toBe(true);
});

test("a field note stops at the end of a sentence, not mid-clause", () => {
	const description =
		"Le cabinet conseille, assiste et représente ses clients exposés à des " +
		"problématiques relevant du droit pénal dit de droit commun. Dans ce cadre, " +
		"il assure la défense des particuliers et des entreprises.";

	expect(leadSentence(description)).toBe(
		"Le cabinet conseille, assiste et représente ses clients exposés à des problématiques relevant du droit pénal dit de droit commun.",
	);
});

test("leadSentence drops an ellipsis left by an upstream cut", () => {
	expect(leadSentence("Une phrase entière. Une autre…")).toBe("Une phrase entière.");
	expect(leadSentence("Sans ponctuation finale…")).toBe("Sans ponctuation finale");
});

test("leadSentence falls back to a word cut for one very long sentence", () => {
	// The fixture must not be word-aligned on the limit, or a raw slice would
	// pass this too and a description could publish a chopped word.
	const long = `${"a".repeat(120)} ${"b".repeat(200)}.`;
	const cut = leadSentence(long);

	expect(cut.endsWith("…")).toBe(true);
	expect(cut.length).toBeLessThanOrEqual(262);
	// Cut on the word boundary, so the long second word is dropped whole rather
	// than sliced mid-way.
	expect(cut).toBe(`${"a".repeat(120)}…`);
});

test("leadSentence on missing or empty input", () => {
	expect(leadSentence(undefined)).toBe("");
	expect(leadSentence("   ")).toBe("");
});

test("every URL in the file is published under one host", () => {
	// The sitemap link and the other-language link once came from two different
	// sources, so a configured host applied to one of them and not the other.
	const urls = build().match(/\((https?:\/\/[^)]+)\)/g) ?? [];

	expect(urls.length, `expected several links, got ${urls.length}`).toBeGreaterThanOrEqual(3);
	for (const url of urls) {
		expect(url.startsWith(`(${HOST}`), url).toBe(true);
	}
});

test("the guidance names the firm from the contact store, never a retyped literal", () => {
	const file = build();

	// The E.164 form, not the displayed `(0)`: the line tells an assistant which
	// number to hand out, and `+33 (0)1 …` does not dial from abroad.
	expect(file.includes("Joignable au +33184162035, à cabinet@ouaknine-avocats.com."), file).toBe(
		true,
	);
	expect(file.includes("Joignable au +33 (0)")).toBe(false);
	// The human-readable address line keeps the displayed form.
	expect(file.includes("France. +33 (0)1 84 16 20 35. cabinet@"), file).toBe(true);
	expect(file.includes("{phone}")).toBe(false);
	expect(file.includes("{email}")).toBe(false);
});

test("the English edition is a full file, not the French one relabelled", () => {
	const file = build({ locale: "en", otherLocale: "fr", labels: EN_LABELS });

	expect(file.split("\n")[0]).toBe("# Ouaknine Law Firm");
	expect(file.includes("## When to use this firm"), file).toBe(true);
	expect(
		file.includes("Reach the firm on +33184162035 or at cabinet@ouaknine-avocats.com."),
		file,
	).toBe(true);
	expect(file.includes(`- [Français](${HOST}/)`), file).toBe(true);
	expect(file.includes("Cabinet Ouaknine")).toBe(false);
});

test("leadSentence reads through abbreviations, initials and decimals", () => {
	expect(
		leadSentence("Le cabinet intervient au titre de l art. 132-1 du code pénal. Puis autre chose."),
	).toBe("Le cabinet intervient au titre de l art. 132-1 du code pénal.");
	expect(leadSentence("Défense de M. Dupont devant la cour. Ensuite rien.")).toBe(
		"Défense de M. Dupont devant la cour.",
	);
	expect(leadSentence("Un délai de 3.5 ans est prévu. Ensuite rien.")).toBe(
		"Un délai de 3.5 ans est prévu.",
	);
	// A bare initial is not in the abbreviation set, so this is the only vector
	// that exercises the single-uppercase guard.
	expect(leadSentence("Défense de A. Ouaknine devant la cour. Ensuite rien.")).toBe(
		"Défense de A. Ouaknine devant la cour.",
	);
	// An abbreviation followed by a capital is the only input that distinguishes
	// the ABBREVIATIONS set from the rules around it: without the set, the cut
	// lands on the abbreviation's own period.
	expect(
		leadSentence("Le cabinet intervient au titre de l art. Une exception existe. Puis fin."),
	).toBe("Le cabinet intervient au titre de l art. Une exception existe.");
	expect(leadSentence("Voir cf. Les autres cas. Puis fin.")).toBe("Voir cf. Les autres cas.");
	// Only the following-capital rule rejects these: a period followed by a
	// lower-case word or a digit is mid-sentence, whatever precedes it.
	expect(leadSentence("Il intervient au pénal. voir aussi le civil.")).toBe(
		"Il intervient au pénal. voir aussi le civil.",
	);
	expect(leadSentence("Un délai de trois ans. 132-1 du code pénal.")).toBe(
		"Un délai de trois ans. 132-1 du code pénal.",
	);
	// A quoted or bracketed opening still starts a sentence.
	expect(leadSentence("Le cabinet plaide. « Une citation » suit.")).toBe("Le cabinet plaide.");
	// `!` and `?` end a sentence without any of the period rules applying.
	expect(leadSentence("Vous êtes convoqué ? Le cabinet intervient.")).toBe("Vous êtes convoqué ?");
	expect(leadSentence("Agissez vite ! Le délai court.")).toBe("Agissez vite !");
});
