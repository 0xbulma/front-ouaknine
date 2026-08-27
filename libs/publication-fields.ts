import { slugify } from "./slug";
import type {
	Locale,
	PressPost,
	PublicationDocument,
	PublicationGroup,
	PublicationGroups,
	PublicationMeta,
	SeriesEntry,
	TitledPost,
	TitleParts,
} from "./types";

// The pure half of the publications module: everything that derives a value
// from a document without asking the CMS for anything. It lives apart from the
// fetchers so it can be loaded, and checked, without building a Sanity client.

export const otherLocale = (locale: string | undefined): Locale => (locale === "fr" ? "en" : "fr");

// Whether the practice wrote this or was written about. `filter` is the field
// the studio sets, and it is the answer when it is set; but it can be left
// empty, and a document carrying the URL of someone else's article is not the
// practice's own writing whatever the field says.
//
// Worth being sure about: this decides the section on the index, whether the
// author block appears, and whether the structured data names Alice Ouaknine as
// the author. Defaulting the other way publishes her as the author of Le Monde's
// copy.
export const isPress = (post: PressPost | null | undefined): boolean =>
	post?.filter === "press" || Boolean(post?.source);

// One slug for both languages, from the explicit field when the studio carries
// one and from the French title otherwise. Deriving it from each locale's own
// title would give the two versions different URLs, which is a 404 behind every
// hreflang; sharing it makes a publication the same path in either language and
// spares it the counterpart lookup a field of expertise needs.
//
// Derived in JS rather than stored, which is why a lookup by slug has to match
// against a fetched list instead of filtering in GROQ.
const publicationSlug = (post: PublicationDocument): string =>
	slugify(post.slug) || slugify(post.title) || post._id;

export const withSlug = (post: PublicationDocument): PublicationMeta => ({
	...post,
	slug: publicationSlug(post),
});

// Formatting in the runtime's own zone renders one day on the server and another
// in the browser for any evening timestamp: a hydration mismatch and a date off
// by one. The practice is in Paris, so that is the zone the date means.
export const formatDate = (
	iso: string | null | undefined,
	locale: string | undefined,
	options?: Intl.DateTimeFormatOptions,
): string =>
	new Date(iso ?? "").toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
		timeZone: "Europe/Paris",
		...options,
	});

// Until the studio carries series and episode as fields, an episode title holds
// them in prose: "Guide de survie en garde à vue - Épisode 2 : Connaître …".
//
// The pattern is deliberately narrow. A standalone article whose title merely
// contains a dash must come back whole rather than cut in half.
const EPISODE = /^(.+?)\s*[–—-]\s*(?:Épisodes?|Episodes?|Ep\.?)\s*(\d+)\s*[:.]?\s*(.*)$/i;

// The fields win when the studio carries them, but the title is still stripped:
// a document keeps its full "<Guide> - Épisode 1 : <subtitle>" title, so trusting
// the field alone would put the series name back into the heading the moment an
// editor filled the field the editorial brief asks them to fill.
export const splitTitle = (post: TitledPost | null | undefined): TitleParts => {
	const raw = post?.title ?? "";
	const match = EPISODE.exec(raw);

	// An episode with no subtitle after the number would otherwise leave an empty
	// heading and a title tag reading " | Cabinet Ouaknine".
	const title = match ? match[3]?.trim() || raw : raw;
	const episode = match ? Number(match[2]) : null;

	if (post?.series) {
		return { series: post.series, episode: post.episode ?? episode, title };
	}

	return { series: match?.[1]?.trim() ?? null, episode, title };
};

// The episodes of one guide, in reading order, so an episode can render its own
// series navigation and the index can group by guide.
//
// The date is the tie-break, not decoration: an editor who fills `series` and
// leaves `episode` empty gives every episode a null number, and without it the
// guide would list in reverse.
export const seriesOf = <T extends TitledPost & { publishedAt?: string | null }>(
	posts: T[],
	series: string,
): SeriesEntry<T>[] =>
	posts
		.map((post) => ({ post, ...splitTitle(post) }))
		.filter((entry) => entry.series && entry.series === series)
		.sort(
			(a, b) =>
				(a.episode ?? 0) - (b.episode ?? 0) ||
				new Date(a.post.publishedAt ?? 0).getTime() - new Date(b.post.publishedAt ?? 0).getTime(),
		);

// The episode before and after the one being read, from the rail the page was
// handed. Pure, and apart from the component, because the off-by-one is
// invisible in a render: at position -1 a bare `series[position + 1]` returns
// `series[0]`, publishing the guide's first episode as the "next" one on every
// document that is not part of it.
export const pagerFor = <T extends { post: { _id: string } }>(
	series: T[] | null | undefined,
	id: string,
): { previous: T | null; next: T | null } => {
	const position = series?.findIndex((entry) => entry.post._id === id) ?? -1;
	if (!series || position < 0) return { previous: null, next: null };

	return {
		previous: series[position - 1] ?? null,
		next: series[position + 1] ?? null,
	};
};

// Three surfaces on the index: the guides, grouped; the standalone articles;
// and what the press has written.
export const groupPublications = (posts: PublicationMeta[]): PublicationGroups => {
	const written = posts.filter((post) => !isPress(post));

	const guides: PublicationGroup[] = [];
	const articles: PublicationMeta[] = [];

	written.forEach((post) => {
		const { series } = splitTitle(post);
		if (!series) {
			articles.push(post);
			return;
		}

		const guide = guides.find((entry) => entry.series === series);
		if (guide) {
			guide.episodes.push(post);
			return;
		}

		guides.push({ series, episodes: [post] });
	});

	guides.forEach((guide) => {
		guide.episodes = seriesOf(guide.episodes, guide.series).map((e) => e.post);
	});

	return { guides, articles, press: posts.filter(isPress) };
};
