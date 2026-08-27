import {defineLocations} from 'sanity/presentation'

/**
 * Which URL on the site each document appears at.
 *
 * Presentation uses this for the "Used on" panel above the form: without it the
 * Studio can frame the site but cannot tell an editor where the document they
 * have open actually shows up, and for a post it genuinely cannot be guessed —
 * the slug is derived from the title by code that lives in the other workspace.
 *
 * The seam this crosses is the one the root CLAUDE.md names: `apps/studio` and
 * `apps/web` share no package, so both `slugify` and `withLocale` below are
 * copies. `test/slug-parity.test.js` loads the originals and fails if the two
 * ever disagree, because two slugifiers that differ by one character produce a
 * dead link in the Studio and nothing else.
 */

/** Copy of apps/web/libs/slug.ts. Pinned by test/slug-parity.test.js. */
export const slugify = value =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Copy of `withLocale` in apps/web/libs/site-url.ts. French goes unprefixed. */
export const withLocale = (language, path) =>
  language === 'fr' || language === undefined ? path : `/${language}${path === '/' ? '' : path}`

/** A document that is one language and sits at fixed paths. */
const staticPage = (pages) =>
  defineLocations({
    select: {language: 'language'},
    resolve: (doc) =>
      doc?.language
        ? {locations: pages.map(([title, path]) => ({title, href: withLocale(doc.language, path)}))}
        : {message: 'Set the language before this page has a URL.', tone: 'caution'},
  })

export const locations = {
  // The home document feeds two routes: the hero at `/` and the same firm
  // section again, under its own heading, at `/about`.
  home: staticPage([
    ['Home', '/'],
    ['The firm', '/about'],
  ]),

  // `/expertise` renders the first field and canonicalises onto it, which is why
  // it is not in the sitemap. It is still the URL this document is framed at.
  expertise: staticPage([['Expertise', '/expertise']]),
  contact: staticPage([['Contact', '/contact']]),
  legal: staticPage([['Legal notice', '/legal']]),
  articles: staticPage([['Publications', '/publications']]),
  iska: staticPage([['ISKA network', '/iska']]),

  // A field of expertise carries no language of its own: it is the list that
  // references it that has one, so the language is read back up the reference.
  // An item no list references has no page, and saying so is more use than an
  // empty panel.
  expertiseItem: defineLocations({
    select: {
      title: 'title',
      language: '*[_type == "expertise" && references(^._id)][0].language',
    },
    resolve: (doc) => {
      const slug = slugify(doc?.title)
      if (!slug) return {message: 'Give this field a title to give it a URL.', tone: 'caution'}
      if (!doc?.language) {
        return {
          message: 'No expertise list references this field, so the site does not show it.',
          tone: 'caution',
        }
      }

      return {
        locations: [
          {title: doc.title.trim(), href: withLocale(doc.language, `/expertise/${slug}`)},
        ],
      }
    },
  }),

  // One post is up to two pages. The site lists it in a language only when it
  // has a body in that language, so the same rule decides the locations: an
  // English-only piece has no French URL, and offering one would frame a 404.
  //
  // The slug is the same in both, and mirrors the projection in
  // apps/web/libs/publications.ts. `slug.current` is legacy and usually absent,
  // which is why the title is what it normally falls through to.
  post: defineLocations({
    select: {
      slug: 'coalesce(slug.current, contentfr.titlefr, contenten.titleen)',
      titlefr: 'contentfr.titlefr',
      titleen: 'contenten.titleen',
      hasFr: 'defined(contentfr.bodyfr)',
      hasEn: 'defined(contenten.bodyen)',
    },
    resolve: (doc) => {
      const slug = slugify(doc?.slug)
      if (!slug) return {message: 'Give this post a title to give it a URL.', tone: 'caution'}

      const locations = [
        doc.hasFr && {
          title: `${doc.titlefr?.trim() || 'Publication'} (français)`,
          href: withLocale('fr', `/publications/${slug}`),
        },
        doc.hasEn && {
          title: `${doc.titleen?.trim() || 'Publication'} (English)`,
          href: withLocale('en', `/publications/${slug}`),
        },
      ].filter(Boolean)

      // A post with a title and no body anywhere is filtered out of every list
      // the site builds, so it has no page yet rather than a broken one.
      return locations.length
        ? {locations}
        : {message: 'Write a body in at least one language to give this post a page.', tone: 'caution'}
    },
  }),
}
