import clientApi from './clientApi';

// The CMS has no slug field on an expertise item, so the URL is derived from
// the title — stable for as long as the title is.
export const expertiseSlug = title =>
  (title ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EXPERTISE_QUERY = `*[_type == "expertise" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title,
  "expertiseList": expertiseList[]->
}`;

export const fetchExpertise = locale =>
  clientApi.fetch(EXPERTISE_QUERY, { locale: locale ?? 'fr' });

// Portable text down to one line, for a meta description.
export const plainText = (blocks, limit = 160) => {
  const text = (blocks ?? [])
    .filter(block => block._type === 'block')
    .map(block => (block.children ?? []).map(span => span.text).join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= limit) return text;

  const cut = text.lastIndexOf(' ', limit);

  // Trailing punctuation would run straight into the ellipsis ("commun....").
  const kept = text.slice(0, cut > 0 ? cut : limit).replace(/[\s.,;:]+$/, '');

  return `${kept}…`;
};
