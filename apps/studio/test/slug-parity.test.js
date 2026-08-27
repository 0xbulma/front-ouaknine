/**
 * Pins the two helpers `locations.js` copies from the site.
 *
 * `apps/studio` and `apps/web` share no package, on purpose, so the URL a
 * document location points at is built by a second copy of `slugify` and
 * `withLocale`. Two slugifiers that disagree by one character produce a link
 * that 404s from inside the Studio and nowhere else, which is the kind of
 * failure nobody reports because it looks like the preview being flaky.
 *
 * `slugify` is compared against the real thing: apps/web/libs/slug.ts is
 * TypeScript, but Node strips the types and the file imports nothing, so it
 * loads straight from the other workspace. That is the copy worth pinning, and
 * it is pinned properly.
 *
 * `withLocale` cannot be loaded the same way — apps/web/libs/site-url.ts opens
 * with `import { SITE_URL } from "./site"`, and Node's stripper does not resolve
 * an extensionless relative import. It is three lines, so it is checked against
 * a table instead. Weaker, and the reason is here rather than left to be
 * rediscovered.
 */
import {test, describe} from 'node:test'
import assert from 'node:assert/strict'

import {slugify, withLocale} from '../locations.js'

const {slugify: webSlugify} = await import('../../web/libs/slug.ts')

// Real titles from the dataset, plus the shapes that break a naive slugifier:
// accents, a trailing space, punctuation runs, an apostrophe, empty values.
const TITLES = [
  'Droit pénal général',
  'Enquêtes internes',
  'Press and media law    ',
  'Défense des ressortissants américains et des étrangers anglophones',
  'Guide de survie en garde à vue - épisode 1 : connaître ses droits',
  "Prise illégale d'intérêts",
  'Cyber-criminalité',
  '  ',
  '',
  null,
  undefined,
]

describe('the studio builds the same URLs as the site', () => {
  test('slugify agrees with apps/web/libs/slug.ts on every title', () => {
    for (const title of TITLES) {
      assert.equal(slugify(title), webSlugify(title), `slugify(${JSON.stringify(title)})`)
    }
  })

  test('withLocale matches apps/web/libs/site-url.ts', () => {
    // French unprefixed, English under /en, and the locale root spelled `/en`
    // rather than `/en/` — that last one is the case the site special-cases.
    const expected = [
      ['fr', '/', '/'],
      ['fr', '/about', '/about'],
      ['en', '/', '/en'],
      ['en', '/about', '/en/about'],
      ['en', '/expertise/droit-penal-general', '/en/expertise/droit-penal-general'],
      [undefined, '/publications/x', '/publications/x'],
    ]

    for (const [language, path, want] of expected) {
      assert.equal(withLocale(language, path), want, `withLocale(${language}, ${path})`)
    }
  })
})
