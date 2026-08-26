import { splitAddress } from './address.mjs';
import { joinBlocks as join, linkList, section } from './markdown-list.mjs';
import { toMarkdown } from './portable-text-to-markdown.mjs';
import { HOST, pageUrl } from './site-url.mjs';

// The markdown representation of each page. Pure: the caller fetches, these
// functions only shape. `ctx` carries the locale, the agent-facing labels
// (content/agentContent.json), the contact facts (content/footerContent.json)
// and the site's page list. The host comes from libs/site-url.mjs.

const footer = ({ locale, labels, contact }) => {
  const { street, phone } = splitAddress(contact[locale].address);

  return join([
    '---',
    `${labels.footerLead}, ${street}. ${phone}. ${contact[locale].email}`,
    // llms.txt has an edition per language; the sitemap is one file for both.
    `${pageUrl(locale, '/llms.txt')} · ${HOST}/sitemap.xml`,
  ]);
};

// Every document ends with the site's page list: it is the shape, not a
// per-page decision, so `document` appends it rather than each caller.
const pagesSection = ctx => section(ctx.labels.pages, linkList(ctx.pages));

const document = (ctx, { title, lead, sections, path }) =>
  `${join([
    title?.trim() ? `# ${title.trim()}` : '',
    lead ? `> ${lead}` : '',
    path === undefined ? '' : `Source: ${pageUrl(ctx.locale, path)}`,
    ...sections,
    pagesSection(ctx),
  ])}\n\n${footer(ctx)}\n`;

export const homeMarkdown = (data, ctx) =>
  document(ctx, {
    path: '/',
    title: data.title1?.trim() ?? '',
    lead: data.descriptionseo,
    sections: [
      data.title2 ? `_${data.title2.trim()}_` : '',
      section(data.sectionTitle?.trim(), toMarkdown(data.body)),
    ],
  });

// `/about` renders the firm section of the home document, so its own summary
// comes from that section's body — not from `descriptionseo`, which describes
// the home page and would make this document's lead a copy of `/index.md`'s.
// The HTML page derives its meta description the same way.
export const aboutMarkdown = (data, ctx) =>
  document(ctx, {
    path: '/about',
    title: data.sectionTitle?.trim() ?? '',
    lead: ctx.lead,
    sections: [toMarkdown(data.body)],
  });

export const expertiseIndexMarkdown = (data, ctx) =>
  document(ctx, {
    path: '/expertise',
    title: data.title?.trim() ?? '',
    lead: data.descriptionseo,
    sections: [
      linkList(
        (data.expertiseList ?? []).map(field => ({
          label: field.title?.trim(),
          url: pageUrl(ctx.locale, `/expertise/${field.slug}`),
        }))
      ),
    ],
  });

export const expertiseFieldMarkdown = (field, ctx) =>
  document(ctx, {
    path: `/expertise/${field.slug}`,
    title: field.title?.trim() ?? '',
    sections: [
      toMarkdown(field.description),
      section(field.titleSpe?.trim(), toMarkdown(field.right)),
    ],
  });

export const contactMarkdown = (data, ctx) => {
  const { locale, contactLabels, contact } = ctx;
  const { street, phone } = splitAddress(contact[locale].address);

  return document(ctx, {
    path: '/contact',
    title: data.title?.trim() ?? '',
    lead: data.descriptionseo,
    sections: [
      [
        `- ${contactLabels.addressLabel}: ${street}`,
        `- ${contactLabels.phoneLabel}: ${phone}`,
        `- ${contactLabels.mobileLabel}: ${contact[locale].mobile}`,
        `- ${contactLabels.emailLabel}: ${contact[locale].email}`,
      ].join('\n'),
    ],
  });
};

export const legalMarkdown = (data, ctx) =>
  document(ctx, {
    path: '/legal',
    title: data.title?.trim() ?? '',
    lead: data.descriptionseo,
    sections: [toMarkdown(data.block)],
  });

export const iskaMarkdown = (content, ctx) =>
  document(ctx, {
    path: '/iska',
    title: content.title,
    lead: content.tagline,
    sections: [
      section(content.networkTitle, content.network.join('\n\n')),
      section(content.bringTitle, content.bring.join('\n\n')),
      section(content.skillsTitle, content.skills.map(skill => `- ${skill}`).join('\n')),
    ],
  });

// Served with a 503: the page exists, the CMS behind it does not answer. Kept
// apart from the 404 document, whose body says the URL is wrong — an agent
// reading that during an outage would drop the URL from its index.
export const unavailableMarkdown = ctx =>
  document(ctx, {
    title: ctx.labels.unavailableTitle,
    lead: ctx.labels.unavailableBody,
    sections: [],
  });

// Served with a 404 status: an agent that guessed a URL gets told where to look
// instead of a dead end.
export const notFoundMarkdown = ctx =>
  document(ctx, {
    title: ctx.labels.notFoundTitle,
    lead: ctx.labels.notFoundBody,
    sections: [],
  });
