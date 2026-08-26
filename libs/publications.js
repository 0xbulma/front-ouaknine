import clientApi from './clientApi';
import { slugify } from './slug';

const LOCALES = ['fr', 'en'];

export const otherLocale = locale => (locale === 'fr' ? 'en' : 'fr');

// Portable text lives at content<locale>.body<locale>, which GROQ cannot reach
// through a parameter, so the locale is interpolated. It is checked against the
// two the site has rather than trusted from the route.
const safeLocale = locale => (LOCALES.includes(locale) ? locale : 'fr');

// Everything but the body. This is what a list needs, and a list is most of what
// the section does: the index renders ten rows, the series rail renders links,
// the sitemap renders slugs. Projecting the body into any of them serialises the
// full text of every publication into the page's __NEXT_DATA__, which measured
// 227 kB on the index for content it never renders.
//
// `hasBody` stands in for the body in the one place a list still needs it: a
// piece is listed in a language only when it was written in that language.
const metaProjection = locale => {
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
    "hasBody": defined(content${l}.body${l}),
    "readingTime": round(length(pt::text(content${l}.body${l})) / 5 / 180)
  }`;
};

// The one caller that actually renders prose asks for it explicitly.
const bodyProjection = locale => {
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
    "hasBody": defined(content${l}.body${l}),
    "body": content${l}.body${l},
    "readingTime": round(length(pt::text(content${l}.body${l})) / 5 / 180)
  }`;
};

const PUBLISHED = '_type == "post" && dateTime(publishedAt) < dateTime(now())';

// Whether the practice wrote this or was written about. `filter` is the field
// the studio sets, and it is the answer when it is set; but it can be left
// empty, and a document carrying the URL of someone else's article is not the
// practice's own writing whatever the field says.
//
// Worth being sure about: this decides the section on the index, whether the
// author block appears, and whether the structured data names Alice Ouaknine as
// the author. Defaulting the other way publishes her as the author of Le Monde's
// copy.
export const isPress = post => post?.filter === 'press' || Boolean(post?.source);

// Only what the reader can actually read. A French press cutting has no English
// body, and listing it on the English site would be a link to an empty page.
const readable = post => Boolean(post?.hasBody);

const fetchWith = async (projection, locale) => {
  const posts = await clientApi.fetch(
    `*[${PUBLISHED}] | order(publishedAt desc) ${projection(locale)}`
  );

  return (posts ?? []).filter(readable).map(withSlug);
};

// Every publication in a language, without the prose. For lists, rails, sitemaps
// and membership checks.
export const fetchPublications = locale => fetchWith(metaProjection, locale);

// One publication, prose included. Fetched by slug rather than filtered out of
// the whole corpus, so an unknown slug costs one query and not a full download.
export const fetchPublication = async (locale, slug) => {
  const posts = await fetchWith(bodyProjection, locale);
  return posts.find(post => post.slug === slug) ?? null;
};

// The publication a legacy /articles/<id> URL was addressing. Looked up by id
// directly: that path space is unbounded and attacker-chosen, so it must not
// pull the corpus once per unknown id.
export const fetchPublicationById = async id => {
  const post = await clientApi.fetch(
    `*[_type == "post" && _id == $id][0]{
      "slug": coalesce(slug.current, contentfr.titlefr, contenten.titleen),
      publishedAt
    }`,
    { id }
  );

  if (!post?.slug) return null;
  if (post.publishedAt && new Date(post.publishedAt) > new Date()) return null;

  return { slug: slugify(post.slug) };
};

// Formatting in the runtime's own zone renders one day on the server and another
// in the browser for any evening timestamp: a hydration mismatch and a date off
// by one. The practice is in Paris, so that is the zone the date means.
export const formatDate = (iso, locale, options) =>
  new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    timeZone: 'Europe/Paris',
    ...options,
  });

// One slug for both languages, from the explicit field when the studio carries
// one and from the French title otherwise. Deriving it from each locale's own
// title would give the two versions different URLs, which is a 404 behind every
// hreflang; sharing it makes a publication the same path in either language and
// spares it the counterpart lookup a field of expertise needs.
export const publicationSlug = post =>
  slugify(post?.slug) || slugify(post?.title) || post?._id;

const withSlug = post => ({ ...post, slug: publicationSlug(post) });

// Until the studio carries series and episode as fields, an episode title holds
// them in prose: "Guide de survie en garde à vue - Épisode 2 : Connaître …".
//
// The pattern is deliberately narrow. A standalone article whose title merely
// contains a dash must come back whole rather than cut in half.
const EPISODE = /^(.+?)\s*[–—-]\s*(?:Épisodes?|Episodes?|Ep\.?)\s*(\d+)\s*[:.]?\s*(.*)$/i;

export const splitTitle = post => {
  const raw = post?.title ?? '';
  const match = EPISODE.exec(raw);

  // The fields win when the studio carries them, but the title still has to be
  // stripped: a document keeps its full "<Guide> - Épisode 1 : <subtitle>"
  // title, so trusting the field alone would put the series name back into the
  // heading the moment an editor filled the field the brief asks them to fill.
  if (post?.series) {
    return {
      series: post.series,
      episode: post.episode ?? (match ? Number(match[2]) : null),
      title: (match ? match[3].trim() : raw) || raw,
    };
  }

  if (!match) return { series: null, episode: null, title: raw };

  // An episode with no subtitle after the number would otherwise leave an empty
  // heading and a title tag reading " | Cabinet Ouaknine".
  return {
    series: match[1].trim(),
    episode: Number(match[2]),
    title: match[3].trim() || raw,
  };
};

// The episodes of one guide, in reading order, so an episode can render its own
// series navigation and the index can group by guide.
export const seriesOf = (posts, series) =>
  posts
    .map(post => ({ post, ...splitTitle(post) }))
    .filter(entry => entry.series && entry.series === series)
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0));

// Three surfaces on the index: the guides, grouped; the standalone articles;
// and what the press has written. `filter` already carries the last distinction.
export const groupPublications = posts => {
  const written = posts.filter(post => !isPress(post));

  const guides = [];
  const articles = [];

  written.forEach(post => {
    const { series } = splitTitle(post);
    if (!series) return articles.push(post);

    const guide = guides.find(entry => entry.series === series);
    if (guide) return guide.episodes.push(post);

    guides.push({ series, episodes: [post] });
  });

  guides.forEach(guide => {
    guide.episodes = seriesOf(guide.episodes, guide.series).map(e => e.post);
  });

  return { guides, articles, press: posts.filter(isPress) };
};
