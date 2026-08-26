import clientApi from './clientApi';
import { slugify } from './slug';

const LOCALES = ['fr', 'en'];

export const otherLocale = locale => (locale === 'fr' ? 'en' : 'fr');

// Portable text lives at content<locale>.body<locale>, which GROQ cannot reach
// through a parameter, so the locale is interpolated. It is checked against the
// two the site has rather than trusted from the route.
const projection = locale => {
  const l = LOCALES.includes(locale) ? locale : 'fr';
  const o = otherLocale(l);

  return `{
    _id,
    language,
    filter,
    author,
    source,
    publishedAt,
    "slug": coalesce(slug.current, contentfr.titlefr, contenten.titleen),
    "series": series,
    "episode": episode,
    "field": relatedExpertise->title,
    "title": coalesce(content${l}.title${l}, content${o}.title${o}),
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
const readable = post => Boolean(post?.body?.length);

export const fetchPublications = async locale => {
  const posts = await clientApi.fetch(
    `*[${PUBLISHED}] | order(publishedAt desc) ${projection(locale)}`
  );

  return (posts ?? []).filter(readable).map(withSlug);
};

export const fetchPublication = async (locale, slug) => {
  const posts = await fetchPublications(locale);
  return posts.find(post => post.slug === slug) ?? null;
};

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
  if (post?.series) {
    return {
      series: post.series,
      episode: post.episode ?? null,
      title: post.title ?? '',
    };
  }

  const match = EPISODE.exec(post?.title ?? '');
  if (!match) return { series: null, episode: null, title: post?.title ?? '' };

  return {
    series: match[1].trim(),
    episode: Number(match[2]),
    title: match[3].trim(),
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
