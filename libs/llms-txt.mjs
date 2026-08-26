import { splitAddress } from './address.mjs';
import { joinBlocks, linkList, section } from './markdown-list.mjs';
import { HOST, pageUrl } from './site-url.mjs';

// https://llmstxt.org: an H1, a blockquote summary, free-form prose, then H2
// sections holding lists of links. The "Optional" heading is a keyword of the
// format and stays in English in both languages.

// Abbreviations that end in a period without ending a sentence. French legal
// copy is full of them, and "…au titre de l art. 132-1" cut at the first period
// publishes a fragment as the when-to-use guidance for a practice area.
const ABBREVIATIONS = new Set([
  'al', 'art', 'av', 'cf', 'ch', 'dr', 'etc', 'ex', 'me', 'mme', 'm', 'mm',
  'no', 'p', 'pp', 'st', 'ste',
]);

// Does the terminator at `index` actually end a sentence? `!` and `?` always
// do. A period does when it follows a real word and precedes a capital, so a
// decimal ("3.5 ans"), an initial ("A. Ouaknine") and an abbreviation are all
// read through rather than cut at.
const endsSentence = (text, index) => {
  if (text[index] !== '.') return true;

  const before = text.slice(0, index).match(/(\S+)$/)?.[1] ?? '';
  const word = before.toLowerCase().replace(/^[^\p{L}]+/u, '');
  if (ABBREVIATIONS.has(word)) return false;
  if (/^\p{Lu}$/u.test(before)) return false;

  // `clean` is trimmed, so a terminator at the very end leaves `after` empty
  // and the caller already holds the whole string — no separate case needed.
  // French sets a space inside its guillemets, so an opening mark may be
  // separated from the word it quotes.
  return /^\s+["'\u201c\u00ab(]?\s*\p{Lu}/u.test(text.slice(index + 1));
};

// A field's description down to its first full sentence. Guidance that stops
// mid-clause reads as broken output, so the cut is made at a sentence end
// rather than at a character count; the length guard is only for a description
// written as one very long sentence.
export const leadSentence = (text, limit = 260) => {
  const clean = (text ?? '').replace(/\u2026\s*$/, '').trim();
  if (!clean) return '';

  let sentence = clean;
  for (const match of clean.matchAll(/[.!?](?=\s|$)/g)) {
    if (endsSentence(clean, match.index)) {
      sentence = clean.slice(0, match.index + 1);
      break;
    }
  }

  if (sentence.length <= limit) return sentence;

  const cut = sentence.lastIndexOf(' ', limit);
  return `${sentence.slice(0, cut > 0 ? cut : limit)}\u2026`;
};

// The guidance prose names the firm's phone and email. They are not retyped
// here: footerContent.json is the canonical store for contact details, so the
// copy carries placeholders and this fills them in. The phone it hands an
// assistant is the E.164 form, because the displayed `(0)` trunk prefix does
// not dial from outside France.
const fill = (text, values) =>
  text.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);

export const llmsTxt = ({ locale, labels, contact, pages, fields, otherLocale }) => {
  const { street, phone } = splitAddress(contact[locale].address);
  const email = contact[locale].email;

  const blocks = [
    `# ${labels.footerLead}`,
    `> ${labels.summary}`,
    labels.guidance
      .map(line => fill(line, { street, phone: contact.phone, email }))
      .join('\n\n'),
    `${street}. ${phone}. ${email}`,
    // The lead is dropped with the list: a heading followed by "the situations
    // this firm is right for" and then nothing is the empty section this file's
    // own helper exists to prevent.
    section(labels.whenToUse, fields.length ? joinBlocks([labels.whenToUseLead, linkList(fields)]) : ''),
    section(labels.pages, linkList(pages)),
    section(
      'Optional',
      linkList([
        { label: 'sitemap.xml', url: `${HOST}/sitemap.xml`, note: labels.sitemapNote },
        {
          label: labels.otherLocaleLabel,
          url: pageUrl(otherLocale, '/'),
          note: labels.englishNote,
        },
      ])
    ),
  ];

  return `${joinBlocks(blocks)}\n`;
};
