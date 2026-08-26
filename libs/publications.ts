import clientApi from "./clientApi";
import { otherLocale, withSlug } from "./publication-fields";
import { slugify } from "./slug";
import type { Locale, PortableText, PublicationDocument, PublicationMeta } from "./types";

// The pure derivations live next door so they can be loaded without a CMS
// client. Re-exported here so call sites import one module.
export {
	formatDate,
	groupPublications,
	isPress,
	otherLocale,
	seriesOf,
	splitTitle,
} from "./publication-fields";

const LOCALES: readonly Locale[] = ["fr", "en"];

// Portable text lives at content<locale>.body<locale>, which GROQ cannot reach
// through a parameter, so the locale is interpolated. It is checked against the
// two the site has rather than trusted from the route.
const safeLocale = (locale: string | undefined): Locale =>
	LOCALES.find((candidate) => candidate === locale) ?? "fr";

// Everything but the prose. The body is the whole document, and projecting it
// into a list serialised every publication's full text into the page's
// __NEXT_DATA__: 227 kB on the index for content it never renders. The one page
// that renders prose fetches it separately, by id, in `fetchPublicationBody`.
const projection = (locale: string | undefined): string => {
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

// A dated document that is not a draft. `publishedAt` is what holds a piece back
// until its release date, so an undated one is not published at all.
const PUBLISHED = `_type == "post"
  && defined(publishedAt)
  && dateTime(publishedAt) < dateTime(now())
  && !(_id in path("drafts.**"))`;

// Only what the reader can actually read. A French press cutting has no English
// body, and listing it on the English site would be a link to an empty page.
const readable = (post: PublicationDocument): boolean => Boolean(post?.hasBody);

// Every publication in a language, without the prose. This is what a list needs,
// and a list is most of what the section does: the index renders rows, the rail
// renders links, the sitemap renders slugs.
export const fetchPublications = async (locale?: string): Promise<PublicationMeta[]> => {
	const posts = await clientApi.fetch<PublicationDocument[] | null>(
		`*[${PUBLISHED}] | order(publishedAt desc) ${projection(locale)}`,
	);

	return (posts ?? []).filter(readable).map(withSlug);
};

// One document's prose. The slug is derived in JS, so GROQ cannot filter on it;
// the caller matches the slug against the body-free list it already holds and
// passes the id. That way an unknown slug costs nothing beyond that list.
export const fetchPublicationBody = async (
	locale: string | undefined,
	id: string,
): Promise<PortableText | null> => {
	const l = safeLocale(locale);

	const post = await clientApi.fetch<{ body?: PortableText | null } | null>(
		`*[${PUBLISHED} && _id == $id][0]{ "body": content${l}.body${l} }`,
		{ id },
	);

	return post?.body ?? null;
};

// The publication a legacy /articles/<id> URL was addressing, in the language
// being read. It applies exactly the filters the destination page applies, so it
// can never resolve an id to a page that will 404 — which is what a permanent
// redirect to a locale with no body did.
export const fetchPublicationById = async (
	locale: string | undefined,
	id: string,
): Promise<{ slug: string } | null> => {
	const l = safeLocale(locale);

	const post = await clientApi.fetch<{ slug?: string | null; hasBody?: boolean } | null>(
		`*[${PUBLISHED} && _id == $id][0]{
      "slug": coalesce(slug.current, contentfr.titlefr, contenten.titleen),
      "hasBody": defined(content${l}.body${l})
    }`,
		{ id },
	);

	if (!post?.slug || !post.hasBody) return null;

	return { slug: slugify(post.slug) };
};
