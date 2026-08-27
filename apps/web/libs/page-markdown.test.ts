import {
	aboutMarkdown,
	contactMarkdown,
	expertiseFieldMarkdown,
	expertiseIndexMarkdown,
	homeMarkdown,
	iskaMarkdown,
	legalMarkdown,
	notFoundMarkdown,
	unavailableMarkdown,
} from "./page-markdown";

import { HOST } from "./site-url";
import type { Locale, MarkdownContext, MarkdownLabels, PortableNode } from "./types";

const paragraph = (text: string): PortableNode => ({
	_type: "block",
	_key: text.slice(0, 6),
	style: "normal",
	markDefs: [],
	children: [{ _type: "span", _key: "s", text, marks: [] }],
});

const LABELS = {
	pages: "Pages",
	footerLead: "Cabinet Ouaknine",
	notFoundTitle: "Page introuvable",
	notFoundBody: "Cette URL n’existe pas sur ce site.",
	unavailableTitle: "Site temporairement indisponible",
	unavailableBody: "Cette page existe, mais le contenu ne peut pas être chargé.",
} satisfies MarkdownLabels;

const ctx = (locale: Locale = "fr"): MarkdownContext => ({
	locale,
	labels: LABELS,
	contact: {
		fr: {
			address: "17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35",
			email: "cabinet@ouaknine-avocats.com",
			mobile: "+33 (0)6 29 65 35 12",
		},
		en: {
			address: "17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35",
			email: "cabinet@ouaknine-avocats.com",
			mobile: "+33 (0)6 29 65 35 12",
		},
	},
	contactLabels: {
		addressLabel: "Adresse",
		phoneLabel: "Téléphone",
		mobileLabel: "Mobile",
		emailLabel: "Email",
	},
	pages: [
		{ label: "Contact", path: "/contact", url: `${HOST}/contact`, note: "coordonnées" },
		{ label: "Expertise", path: "/expertise", url: `${HOST}/expertise` },
	],
});

const firstLine = (markdown: string): string => markdown.split("\n")[0] ?? "";

test("the footer spells out how to reach the firm", () => {
	// The one place outside the contact document where the address, phone and
	// email appear in every markdown page — what an agent reads when the body is
	// no use to it.
	const out = notFoundMarkdown(ctx());

	expect(
		out.includes(
			"Cabinet Ouaknine, 17 rue de Douai, 75009 Paris, France. +33 (0)1 84 16 20 35. cabinet@ouaknine-avocats.com",
		),
		out,
	).toBe(true);
});

test("no optional field leaks the word undefined into a document", () => {
	// Every renderer guards a field the CMS may not hold — the byline, the lead,
	// the section title, the aside. `joinBlocks` keeps `_undefined_` because it
	// is a non-blank string, so an unguarded one ships.
	const documents = [
		homeMarkdown({ title1: "T", body: [] }, ctx()),
		aboutMarkdown({ sectionTitle: "S", body: [] }, ctx()),
		contactMarkdown({ title: "Contact" }, ctx()),
		legalMarkdown({ title: "Mentions" }, ctx()),
		expertiseIndexMarkdown({ title: "E", expertiseList: [] }, ctx()),
		expertiseFieldMarkdown({ title: "F", slug: "f", description: [] }, ctx()),
		notFoundMarkdown(ctx()),
		unavailableMarkdown(ctx()),
	];

	for (const document of documents) {
		expect(document.includes("undefined"), document).toBe(false);
		expect(document.includes("[object Object]"), document).toBe(false);
	}
});

test("every document opens with an H1 and closes with the recovery footer", () => {
	const documents = [
		homeMarkdown({ title1: "Défense pénale", body: [paragraph("Le cabinet.")] }, ctx()),
		aboutMarkdown({ sectionTitle: "Alice Ouaknine", body: [paragraph("Bio.")] }, ctx()),
		contactMarkdown({ title: "Contact" }, ctx()),
		legalMarkdown({ title: "Mentions", block: [paragraph("Texte.")] }, ctx()),
		notFoundMarkdown(ctx()),
	];

	for (const document of documents) {
		expect(firstLine(document)).toMatch(/^# \S/);
		expect(document.includes(`${HOST}/llms.txt`)).toBe(true);
		expect(document.includes(`${HOST}/sitemap.xml`)).toBe(true);
		expect(document.includes("## Pages")).toBe(true);
		expect(document.endsWith("\n")).toBe(true);
	}
});

test("the home document carries the byline, the firm text and the source URL", () => {
	const markdown = homeMarkdown(
		{
			title1: "Défense pénale ",
			title2: "Barreaux de Paris et de Californie",
			descriptionseo: "Avocate aux barreaux de Paris et de Californie.",
			sectionTitle: "Alice Ouaknine",
			body: [paragraph("Le cabinet est dédié à la défense pénale.")],
		},
		ctx(),
	);

	expect(firstLine(markdown)).toBe("# Défense pénale");
	expect(markdown.includes("> Avocate aux barreaux de Paris et de Californie.")).toBe(true);
	expect(markdown.includes("_Barreaux de Paris et de Californie_")).toBe(true);
	expect(markdown.includes("## Alice Ouaknine")).toBe(true);
	expect(markdown.includes(`Source: ${HOST}/`)).toBe(true);
});

test("the contact document lists every way to reach the firm", () => {
	const markdown = contactMarkdown({ title: "Contacter le Cabinet" }, ctx());

	expect(markdown.includes("- Adresse: 17 rue de Douai, 75009 Paris, France")).toBe(true);
	expect(markdown.includes("- Téléphone: +33 (0)1 84 16 20 35")).toBe(true);
	expect(markdown.includes("- Mobile: +33 (0)6 29 65 35 12")).toBe(true);
	expect(markdown.includes("- Email: cabinet@ouaknine-avocats.com")).toBe(true);
});

test("the expertise index links every field at its own URL", () => {
	const markdown = expertiseIndexMarkdown(
		{
			title: "Champs de compétence",
			expertiseList: [
				{ title: "Droit pénal général", slug: "droit-penal-general" },
				{ title: "Cyber-criminalité", slug: "cyber-criminalite" },
			],
		},
		ctx(),
	);

	expect(markdown.includes(`- [Droit pénal général](${HOST}/expertise/droit-penal-general)`)).toBe(
		true,
	);
	expect(markdown.includes(`- [Cyber-criminalité](${HOST}/expertise/cyber-criminalite)`)).toBe(
		true,
	);
});

test("a document with no lead publishes no blockquote", () => {
	// `expertiseFieldMarkdown` never passes one, and contact/legal pass a CMS
	// field that may be absent — unguarded, every field document would open with
	// a literal `> undefined`.
	const field = expertiseFieldMarkdown(
		{ title: "Droit pénal général", slug: "droit-penal-general", description: [] },
		ctx(),
	);
	expect(
		field.split("\n").some((line) => line.startsWith("> ")),
		field,
	).toBe(false);

	const contact = contactMarkdown({ title: "Contact" }, ctx());
	expect(
		contact.split("\n").some((line) => line.startsWith("> ")),
		contact,
	).toBe(false);
});

test("an expertise field renders its description and its aside", () => {
	const markdown = expertiseFieldMarkdown(
		{
			title: "White-collar crime",
			slug: "white-collar-crime",
			description: [paragraph("The firm has extensive expertise.")],
			titleSpe: "Expertise",
			right: [{ ...paragraph("fraud"), listItem: "bullet", level: 1 }],
		},
		ctx("en"),
	);

	expect(firstLine(markdown)).toBe("# White-collar crime");
	expect(markdown.includes("## Expertise")).toBe(true);
	expect(markdown.includes("- fraud")).toBe(true);
	expect(markdown.includes(`Source: ${HOST}/en/expertise/white-collar-crime`)).toBe(true);
});

test("an expertise field with no aside omits the heading", () => {
	const markdown = expertiseFieldMarkdown(
		{ title: "Cyber", slug: "cyber", description: [paragraph("Texte.")] },
		ctx(),
	);
	expect(markdown.includes("## undefined")).toBe(false);
});

test("the ISKA document renders its two rich-text sections and its practice areas", () => {
	const markdown = iskaMarkdown(
		{
			title: "Réseau ISKA",
			tagline: "Un réseau d’avocats indépendants.",
			networkTitle: "Le réseau",
			network: [
				paragraph("Implanté au cœur de Paris."),
				paragraph("Ses avocats plaident partout."),
			],
			bringTitle: "Ce que le réseau apporte",
			bring: [paragraph("Le cabinet reste indépendant."), paragraph("Une seule interlocutrice.")],
			skillsTitle: "Les compétences du réseau",
			skills: ["Droit pénal", "Droit du travail"],
		},
		ctx(),
	);

	expect(firstLine(markdown)).toBe("# Réseau ISKA");
	expect(markdown.includes("> Un réseau d’avocats indépendants.")).toBe(true);
	expect(markdown.includes("## Les compétences du réseau")).toBe(true);
	expect(markdown.includes("- Droit pénal\n- Droit du travail")).toBe(true);
	// Each section carries several blocks; they stay separate paragraphs rather
	// than being glued into one.
	expect(
		markdown.includes("Implanté au cœur de Paris.\n\nSes avocats plaident partout."),
		markdown,
	).toBe(true);
	expect(
		markdown.includes("Le cabinet reste indépendant.\n\nUne seule interlocutrice."),
		markdown,
	).toBe(true);
});

test("an ISKA document the studio has barely filled in omits its empty sections", () => {
	const markdown = iskaMarkdown({ title: "Réseau ISKA" }, ctx());

	expect(firstLine(markdown)).toBe("# Réseau ISKA");
	expect(markdown.includes("undefined"), markdown).toBe(false);
});

test("the 404 document names the site map and the agent guide", () => {
	const markdown = notFoundMarkdown(ctx());

	expect(firstLine(markdown)).toBe("# Page introuvable");
	expect(markdown.includes(`${HOST}/sitemap.xml`)).toBe(true);
	expect(markdown.includes(`${HOST}/llms.txt`)).toBe(true);
	expect(markdown.includes(`- [Contact](${HOST}/contact): coordonnées`)).toBe(true);
	// Nothing to cite: a 404 has no source URL of its own.
	expect(markdown.includes("Source:")).toBe(false);
});

test("a link with no note renders without a trailing colon", () => {
	expect(notFoundMarkdown(ctx()).includes(`- [Expertise](${HOST}/expertise)\n`)).toBe(true);
});

test("the unavailable document is not the 404 document", () => {
	// The 503 and the 404 must never converge: a body reading "this URL does not
	// exist" beside a status meaning "try again later" is what makes an agent
	// drop a live URL during an outage.
	const out = unavailableMarkdown(ctx());

	expect(out.startsWith(`# ${LABELS.unavailableTitle}`), out).toBe(true);
	expect(out.includes(`> ${LABELS.unavailableBody}`), out).toBe(true);
	expect(out.includes(`## ${LABELS.pages}`), out).toBe(true);
	expect(out.includes(LABELS.notFoundTitle)).toBe(false);
	expect(out.includes(LABELS.notFoundBody)).toBe(false);
});

test("the English edition links the English llms.txt", () => {
	// The sitemap is one file for both languages; llms.txt is not.
	const out = notFoundMarkdown(ctx("en"));

	expect(out.includes(`${HOST}/en/llms.txt`), out).toBe(true);
	expect(out.includes(`${HOST}/llms.txt`)).toBe(false);
	expect(out.includes(`${HOST}/sitemap.xml`), out).toBe(true);
});

test("the about document summarises its own section, not the home page", () => {
	// `/about` renders the firm section of the home document; leading with the
	// home page's `descriptionseo` made its summary a copy of `/index.md`'s,
	// while the HTML page derived a different one from the same body.
	const home = {
		title1: "Alice Ouaknine",
		title2: "Barreaux de Paris et de Californie",
		descriptionseo: "La page d’accueil du cabinet.",
		sectionTitle: "Le cabinet",
		body: [paragraph("Le cabinet est dédié à la défense pénale.")],
	};

	const about = aboutMarkdown(home, {
		...ctx(),
		lead: "Le cabinet est dédié à la défense pénale.",
	});

	expect(about.includes("> Le cabinet est dédié à la défense pénale."), about).toBe(true);
	expect(about.includes("La page d’accueil du cabinet."), about).toBe(false);
});
