import clientApi from './clientApi';
import { slugify } from './slug';
import { otherLocale, withSlug } from './publication-fields';

// The pure derivations live next door so they can be loaded without a CMS
// client. Re-exported here so call sites import one module.
export {
  formatDate,
  groupPublications,
  isPress,
  otherLocale,
  seriesOf,
  splitTitle,
} from './publication-fields';

const LOCALES = ['fr', 'en'];

// Portable text lives at content<locale>.body<locale>, which GROQ cannot reach
// through a parameter, so the locale is interpolated. It is checked against the
// two the site has rather than trusted from the route.
const safeLocale = locale => (LOCALES.includes(locale) ? locale : 'fr');

// One projection, with the body opt-in. Two near-identical copies drifted the
// moment a field was added to one and not the other, and the body is the whole
// document: projecting it into a list serialises every publication's full text
// into the page's __NEXT_DATA__, which measured 227 kB on the index for content
// it never renders.
const projection = (locale, { body = false } = {}) => {
  const l = safeLocale(locale);
  const o = otherLocale(l);

  return `{
    _id,
    filter,
    author,
    source,
    publishedAt,
    "slug": coalesce(slug.current, contentfr.titlefr, contenten.titleen),
    "series": series,
    "episode": episode,
    "field": relatedExpertise->title,
    "title": coalesce(content${l}.title${l}, content${o}.title${o}),
    "hasBody": defined(content${l}.body${l}),${body ? `\n    "body": content${l}.body${l},` : ''}
    "readingTime": round(length(pt::text(content${l}.body${l})) / 5 / 180)
  }`;
};

// A dated document that is not a draft. `publishedAt` is what holds a piece back
// until its release date, so an undated one is not published at all.
const PUBLISHED = `_type == "post"
  && defined(publishedAt)
  && dateTime(publishedAt) < dateTime(now())
  && !(_id in path("drafts.**"))`;

// Only what the reader can actually read. A French press cutting has no English
// body, and listing it on the English site would be a link to an empty page.
const readable = post => Boolean(post?.hasBody);

// Every publication in a language, without the prose. This is what a list needs,
// and a list is most of what the section does: the index renders rows, the rail
// renders links, the sitemap renders slugs.
export const fetchPublications = async locale => {
  const posts = await clientApi.fetch(
    `*[${PUBLISHED}] | order(publishedAt desc) ${projection(locale)}`
  );

  return (posts ?? []).filter(readable).map(withSlug);
};

// One document's prose. The slug is derived in JS, so GROQ cannot filter on it;
// the caller matches the slug against the body-free list it already holds and
// passes the id. That way an unknown slug costs nothing beyond that list.
export const fetchPublicationBody = async (locale, id) => {
  const l = safeLocale(locale);

  const post = await clientApi.fetch(
    `*[${PUBLISHED} && _id == $id][0]{ "body": content${l}.body${l} }`,
    { id }
  );

  return post?.body ?? null;
};

// The publication a legacy /articles/<id> URL was addressing, in the language
// being read. It applies exactly the filters the destination page applies, so it
// can never resolve an id to a page that will 404 — which is what a permanent
// redirect to a locale with no body did.
export const fetchPublicationById = async (locale, id) => {
  const l = safeLocale(locale);

  const post = await clientApi.fetch(
    `*[${PUBLISHED} && _id == $id][0]{
      "slug": coalesce(slug.current, contentfr.titlefr, contenten.titleen),
      "hasBody": defined(content${l}.body${l})
    }`,
    { id }
  );

  if (!post?.slug || !post.hasBody) return null;

  return { slug: slugify(post.slug) };
};
