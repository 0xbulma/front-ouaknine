import { splitAddress } from "./address";
import { joinBlocks as join, linkList, section } from "./markdown-list";
import { toMarkdown } from "./portable-text-to-markdown";
import { HOST, pageUrl } from "./site-url";
import type {
	ContactDocument,
	ExpertiseDocument,
	ExpertiseField,
	HomeDocument,
	IskaContent,
	LegalDocument,
	MarkdownContext,
	PublicationMeta,
	PublicationsDocument,
} from "./types";

// The markdown representation of each page. Pure: the caller fetches, these
// functions only shape. `ctx` carries the locale, the agent-facing labels
// (content/agentContent.json), the contact facts (content/footerContent.json)
// and the site's page list. The host comes from libs/site-url.ts.

type Document = {
	title?: string;
	lead?: string;
	sections: (string | null | undefined)[];
	path?: string;
};

const footer = ({ locale, labels, contact }: MarkdownContext): string => {
	const { street, phone } = splitAddress(contact[locale].address);

	return join([
		"---",
		`${labels.footerLead}, ${street}. ${phone}. ${contact[locale].email}`,
		// llms.txt has an edition per language; the sitemap is one file for both.
		`${pageUrl(locale, "/llms.txt")} · ${HOST}/sitemap.xml`,
	]);
};

// Every document ends with the site's page list: it is the shape, not a
// per-page decision, so `document` appends it rather than each caller.
const pagesSection = (ctx: MarkdownContext): string =>
	section(ctx.labels.pages, linkList(ctx.pages));

const document = (ctx: MarkdownContext, { title, lead, sections, path }: Document): string =>
	`${join([
		title?.trim() ? `# ${title.trim()}` : "",
		lead ? `> ${lead}` : "",
		path === undefined ? "" : `Source: ${pageUrl(ctx.locale, path)}`,
		...sections,
		pagesSection(ctx),
	])}\n\n${footer(ctx)}\n`;

export const homeMarkdown = (data: HomeDocument, ctx: MarkdownContext): string =>
	document(ctx, {
		path: "/",
		title: data.title1?.trim() ?? "",
		lead: data.descriptionseo,
		sections: [
			data.title2 ? `_${data.title2.trim()}_` : "",
			section(data.sectionTitle?.trim(), toMarkdown(data.body)),
		],
	});

// `/about` renders the firm section of the home document, so its own summary
// comes from that section's body — not from `descriptionseo`, which describes
// the home page and would make this document's lead a copy of `/index.md`'s.
// The HTML page derives its meta description the same way.
export const aboutMarkdown = (data: HomeDocument, ctx: MarkdownContext): string =>
	document(ctx, {
		path: "/about",
		title: data.sectionTitle?.trim() ?? "",
		lead: ctx.lead,
		sections: [toMarkdown(data.body)],
	});

export const expertiseIndexMarkdown = (data: ExpertiseDocument, ctx: MarkdownContext): string =>
	document(ctx, {
		path: "/expertise",
		title: data.title?.trim() ?? "",
		lead: data.descriptionseo,
		sections: [
			linkList(
				(data.expertiseList ?? []).map((field) => ({
					label: field.title?.trim(),
					url: pageUrl(ctx.locale, `/expertise/${field.slug}`),
				})),
			),
		],
	});

export const expertiseFieldMarkdown = (field: ExpertiseField, ctx: MarkdownContext): string =>
	document(ctx, {
		path: `/expertise/${field.slug}`,
		title: field.title?.trim() ?? "",
		sections: [
			toMarkdown(field.description),
			section(field.titleSpe?.trim(), toMarkdown(field.right)),
		],
	});

export const contactMarkdown = (data: ContactDocument, ctx: MarkdownContext): string => {
	const { locale, contactLabels, contact } = ctx;
	const { street, phone } = splitAddress(contact[locale].address);

	return document(ctx, {
		path: "/contact",
		title: data.title?.trim() ?? "",
		lead: data.descriptionseo,
		sections: [
			[
				`- ${contactLabels.addressLabel}: ${street}`,
				`- ${contactLabels.phoneLabel}: ${phone}`,
				`- ${contactLabels.mobileLabel}: ${contact[locale].mobile}`,
				`- ${contactLabels.emailLabel}: ${contact[locale].email}`,
			].join("\n"),
		],
	});
};

export const legalMarkdown = (data: LegalDocument, ctx: MarkdownContext): string =>
	document(ctx, {
		path: "/legal",
		title: data.title?.trim() ?? "",
		lead: data.descriptionseo,
		sections: [toMarkdown(data.block)],
	});

export const iskaMarkdown = (content: IskaContent, ctx: MarkdownContext): string =>
	document(ctx, {
		path: "/iska",
		title: content.title,
		lead: content.tagline,
		sections: [
			section(content.networkTitle, content.network.join("\n\n")),
			section(content.bringTitle, content.bring.join("\n\n")),
			section(content.skillsTitle, content.skills.map((skill) => `- ${skill}`).join("\n")),
		],
	});

// The publications index: the guides grouped by series, the standalone
// articles, then what the press has written. `groups` is what
// `groupPublications` returns, already shaped by the caller.
export const publicationsIndexMarkdown = (
	data: PublicationsDocument,
	ctx: MarkdownContext,
): string => {
	const { guides = [], articles = [], press = [] } = ctx.groups ?? {};

	const link = (post: PublicationMeta) => ({
		label: post.title?.trim(),
		url: pageUrl(ctx.locale, `/publications/${post.slug}`),
	});

	return document(ctx, {
		path: "/publications",
		title: data.title?.trim() ?? "",
		lead: data.descriptionseo,
		sections: [
			...guides.map((guide) => section(guide.series, linkList(guide.episodes.map(link)))),
			section(ctx.labels.publicationsArticles, linkList(articles.map(link))),
			section(ctx.labels.publicationsPress, linkList(press.map(link))),
		],
	});
};

// One publication. An episode carries the rest of its guide beneath it, the way
// the page does, so an agent reading one part can reach the others.
export const publicationMarkdown = (post: PublicationMeta, ctx: MarkdownContext): string =>
	document(ctx, {
		path: `/publications/${post.slug}`,
		title: post.title?.trim() ?? "",
		lead: post.source ? `${ctx.labels.publicationsPress} — ${post.source}` : "",
		sections: [
			toMarkdown(ctx.body),
			section(
				(ctx.series?.length ?? 0) > 1 ? post.series : "",
				linkList(
					(ctx.series ?? []).map((item) => ({
						label: item.title?.trim(),
						url: pageUrl(ctx.locale, `/publications/${item.slug}`),
					})),
				),
			),
		],
	});

// Served with a 503: the page exists, the CMS behind it does not answer. Kept
// apart from the 404 document, whose body says the URL is wrong — an agent
// reading that during an outage would drop the URL from its index.
export const unavailableMarkdown = (ctx: MarkdownContext): string =>
	document(ctx, {
		title: ctx.labels.unavailableTitle,
		lead: ctx.labels.unavailableBody,
		sections: [],
	});

// Served with a 404 status: an agent that guessed a URL gets told where to look
// instead of a dead end.
export const notFoundMarkdown = (ctx: MarkdownContext): string =>
	document(ctx, {
		title: ctx.labels.notFoundTitle,
		lead: ctx.labels.notFoundBody,
		sections: [],
	});
