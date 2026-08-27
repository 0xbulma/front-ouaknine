# CLAUDE.md

Guidance for working on the site. It lives at `apps/web` in a two-workspace
monorepo; the Sanity Studio that feeds it is `apps/studio`, and the repo root
carries its own CLAUDE.md. Every path below is relative to `apps/web`.

The design system section is the part that matters most: the site is almost
entirely typography and rules, so changes that look small are usually design
decisions.

## The project

Marketing site for **Alice Ouaknine**, a criminal-law practice in Paris (17 rue
de Douai, 75009). Bilingual `fr` / `en`. Seven pages: home, about, expertise,
publications, contact, ISKA, legal, plus a 404.

| | |
|---|---|
| Framework | Next.js 16, **pages router** (not App Router). Turbopack builds |
| Language | **TypeScript**, `strict` + `noUncheckedIndexedAccess`. No `.js` left outside `next.config.js` |
| Styling | SCSS modules + a global token file. No Tailwind, no CSS-in-JS |
| Content | Sanity for page copy, local JSON for UI strings |
| Tests | **Vitest** (`vitest.config.mts`), two projects: `libs` on node, `ui` on jsdom |
| Lint + format | **Biome** (`biome.json`) for both, plus ESLint for the `@next/next` rules only |
| Package manager | **pnpm**, workspaces from the repo root (`pnpm-lock.yaml` and `packageManager` both live there) |
| React | 19, with the **React Compiler** on (`reactCompiler: true`). It memoizes for you; do not hand-write `useMemo`/`useCallback`/`memo` |
| Node | 24.x per `engines` |
| CI | `../../.github/workflows/ci.yml` runs the four checks, plus the studio's two, on every PR |

Install once at the repo root; everything else runs from `apps/web`, or from the
root as `pnpm --filter web <script>`.

```bash
pnpm install --frozen-lockfile   # from the repo root
pnpm dev          # next dev
pnpm build        # next build
pnpm verify       # biome:check + lint + typecheck + test, what CI runs
pnpm biome:check  # biome check .        (lint + format, no writes)
pnpm biome:fix    # biome check --write .
pnpm lint         # eslint .
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest run
pnpm test:watch   # vitest
```

`pnpm verify` before calling anything done, then `pnpm build`, and know what each
one does and does not cover. CI runs the first four; the build is Vercel's job,
because it needs `NEXT_PUBLIC_SANITY_ID` and hits the CMS for every page.

## Two linters, on purpose

**Biome owns formatting and the general rules.** `biome.json` is the config from
the `dupondai/app-boilerplate` repo, so the two codebases format identically:
tabs at width 2, 100 columns, double quotes, trailing commas, imports organised.
The `no-type-assertion.grit` plugin is ported with it and is what enforces the
no-`as` rule.

Two of that config's rules are turned off or loosened here, because they target
a stack this repo does not have:

| Rule | Why |
|---|---|
| `useSortedClasses` | No Tailwind |
| `useMaxParams` | Raised from 2 to 3 |

`vcs.root` is `../..` because `useIgnoreFile` looks for `.gitignore` beside
`biome.json`, and the only `.gitignore` is the repo's. Without it Biome refuses
to start: "couldn't find an ignore file in the following folder".

Biome does not run over `apps/studio`. That is JS on `@sanity/eslint-config-studio`,
and its own rules would collide with this config's (`noRestrictedImports` alone
bans the `useCallback` its debounce hook is built on). `files.includes` is an
allowlist of this app's source globs, so the studio was never in scope; the
studio's `pnpm lint` is what covers it.

`noRestrictedImports` and `noReactForwardRef` came back on with React 19. The
first bans `useMemo`, `useCallback` and `memo` from `react`: the compiler
memoizes on its own, and a hand-written cache beside it is at best redundant and
at worst a stale-closure bug. Reach for `use no memo` in the one component that
genuinely needs to opt out, not for a `biome-ignore`.

The three a11y rules that used to be off here came back on with Next 16.
`useValidAnchor`, `useAnchorContent` and `useAriaPropsSupportedByRole` were
unusable under Next 12's legacy `<Link>`, which injected `href` onto an `<a>`
child at runtime and left every anchor reading as hrefless. `<Link>` renders
the anchor itself now, so they see the real element.

**Biome does not format SCSS.** `styles/` and every `*.module.scss` keep the
2-space, single-quote house style; only `.ts`/`.tsx` are on tabs. Do not try to
run Biome over them.

**Do not hand-write a vendor prefix beside its standard property.** Turbopack
minifies with Lightning CSS, which adds prefixes itself from `browserslist`.
Given both, in the header's case `backdrop-filter` followed by
`-webkit-backdrop-filter`, it keeps only the prefixed one, and the effect
silently disappears in every browser but Safari. `.svg` in
`components/layout/phone.module.scss` declares the standard property alone and
comes out with both. Declare the standard property and let the build prefix it.

An audit that catches this: compile every `*.scss` with `sass` directly, pull
the property names out of both that and `.next/static/chunks/*.css`, and diff
the two sets. Shorthand folding is expected noise (`animation-delay` and
`animation-fill-mode` into `animation`, `grid-row` into `grid-area`,
`border-top-color` into `border-top`); a property that vanishes with no
shorthand to explain it is a real loss.

**Turbopack names CSS-module classes differently.** Webpack emitted
`main-header_header__h46Bl`; Turbopack emits
`main-header-module-scss-module__h46BlG__header`. Nothing depends on the shape,
but a grep of the served HTML for the old one silently finds nothing, which
reads exactly like a component that stopped rendering.

**ESLint survives only for `@next/next`.** `eslint.config.mjs` is flat config,
because Next 16 removed `next lint` and ESLint 10 no longer reads `.eslintrc`.
It loads the Next plugin and `@typescript-eslint/parser` and nothing else. Those 21 rules have no Biome equivalent and
several matter here: `no-html-link-for-pages` in a pages-router app,
`inline-script-id` and `next-script-for-ga` for the gtag snippet,
`no-duplicate-head`. The two `google-font-*` rules no longer have anything to
watch, since `next/font` self-hosts. Suppressions are `biome-ignore`, not
`eslint-disable`, everywhere except those rules. The file list is the app, not
the build output and not `test/`, whose mocks render a bare `<img>` on purpose.

A Biome suppression must be **one line** and sit **immediately above** the line
it suppresses. A two-line comment silently does nothing and reports as
`suppressions/unused`. Several rules can share one comment:
`// biome-ignore lint/a11y/ruleA lint/a11y/ruleB: reason`.

`biome.json` is strict JSON with the `.json` extension, so it takes no comments.
Reasons live here instead.

**`tsconfig.json` is partly Next's.** `next build` rewrites it on every run to
enforce the options it needs, and on Next 16 those are the modern ones:
`moduleResolution: bundler` and `jsx: react-jsx`. Do not fight that; set
anything else beside it and it survives. The house config now applies in full,
including `verbatimModuleSyntax`, which Next 12 could not support because
`@portabletext/react@1` shipped `.d.ts` files re-exporting its own `.tsx`
sources.

**`next dev` and `next build` no longer collide.** Next 16 writes the dev
server's output to `.next/dev`, so a server left running in the workspace can
stay up while you build and curl `next start`. On Next 12 they shared `./.next`
and the clobbering cost time twice.

**The suite is two projects.** `libs` runs on node and covers the pure
derivations; `ui` runs on jsdom and covers the component seams the pure tests
cannot reach. Run one with `pnpm vitest run --project ui`.

`ui` mocks everything below the component in `test/setup.tsx`: `next/head`
renders its children inline so the annotations are queryable, `next/link`
renders the anchor itself the way Next 13+ does, `next/image` becomes an
`<img>`, and
`libs/clientApi` is stubbed because it throws at import without
`NEXT_PUBLIC_SANITY_ID`. A test sets the router with `setRouter({ locale: 'en' })`
in place of re-mocking the module. Stylesheets compile for real: sass is current
again since the upgrade, so the stub the project used to need is gone.

What `ui` is for: which annotations the head actually publishes (and which a
`noindex` page suppresses), what the JSON-LD graph says about a document, and
whether a CMS-authored link leaves the site. Those were curl-and-eyeball before.

**Assert head annotations against `document.head`, not the render result.**
React 19 hoists every `<title>`, `<meta>` and `<link>` out of the tree and into
the head wherever it was declared, so `render(...).container` comes back empty
for a component that emits nothing else. `components/head/head-page.test.tsx`
queries `document.head`; that RTL's `cleanup()` empties it again between tests
is what the `noindex` case relies on.

**`pnpm test` covers the pure derivations.** `libs/slug.ts`, `libs/href.ts` and
`libs/publication-fields.ts` turn a title into every URL, hreflang and `@id` on
the site, and decide whether a CMS-authored link is same-site or hostile; they
fail silently into a 404 or an unsafe anchor, and one of them already broke
once. The agent surface adds the negotiation (`libs/accept.ts`), the routing
decision (`libs/proxy-route.ts`), the markdown rendering, the page list,
the URL spelling, llms.txt and the meta-description truncation
(`libs/plain-text.ts`). One test asserts no component can reach the Sanity
client, which is a property of the import graph rather than of any one module.

What makes a module testable is not importing the Sanity client or React —
Vite resolves extensionless imports and JSON imports, so nothing needs an
extension in its specifier or an import attribute. `libs/site.ts` reads
`NEXT_PUBLIC_HOST` at module scope, so the tests that exercise a bad value
re-import it under `vi.stubEnv` + `vi.resetModules()` rather than spawning a
subprocess.

**`libs/types.ts` is the shared vocabulary** — the CMS document shapes, Portable
Text, the publication projections, the agent-facing context. Copy types are
derived from the content files with `typeof import('../content/x.json')` rather
than restated, so a renamed key is a type error at the component that reads it.
Where a type is looser than the data really is (an optional label the JSON
always carries), `libs/site-pages.test.ts` is the guarantee: it reads the real
files and asserts every key is filled.

The routes have no tests: the negotiation branches, the status codes and the
cache headers are checked with curl against a verification build (above). There
is no end-to-end suite.

## Local development: read this before you try to run it

**`pnpm build` and `pnpm dev` cannot render pages without `NEXT_PUBLIC_SANITY_ID`.**
Every page's `getStaticProps` calls Sanity, and without the env var the client
throws `Configuration must contain projectId`. `pnpm build` compiles and
typechecks fine, then fails at "Collecting page data". Pages 500 in dev.

If you have the value, put `.env.local` at **`apps/web/.env.local`**: Next reads
it from the app directory, not from the repo root. Conductor's Files to copy
entry has to name that path too, or new workspaces come up without it.
`SANITY_TOKEN` belongs in the same file, but only draft mode reads it: see
"Draft mode, and editing on the page" below.

If you do not have it and need to see a visual change, stub the client:

```ts
// libs/clientApi.ts — TEMPORARY, revert before committing.
// The stub does not implement SanityClient, so `pnpm typecheck` will fail on
// this file for as long as it is in place. That is the reminder to revert it.
const block = (k: string, t: string) => ({ _type: 'block', _key: k, style: 'normal',
  children: [{ _type: 'span', _key: `${k}s`, text: t, marks: [] }] });
const HOME = { title1: 'Alice Ouaknine', title2: 'Barreaux de Paris et de Californie',
  tag1: '…', link1: 'e1', sectionTitle: 'Le cabinet', body: [block('b1', '…')] };
// The queries in libs/page-content.ts and libs/expertise.ts project `[0]`, so
// a fetch resolves to a document or to null — not to an array.
const clientApi = { fetch: async (q: string) => (q.includes('"home"') ? HOME : null) };
export default clientApi;
```

**Always restore `libs/clientApi.ts` before committing** and confirm with
`git diff --stat libs/clientApi.ts` that it is empty. Fixture copy is invented,
so anything sensitive to real string lengths — the 144px hero especially —
still needs checking against the Vercel preview.

### Screenshotting without the browser extension

Headless Chrome works and is the fastest way to check a change:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --virtual-time-budget=12000 --window-size=1440,900 \
  --screenshot=/tmp/shot.png "http://localhost:3000/"
```

Two traps that have already cost time:

- **Chrome clamps the layout viewport to 500px minimum.** `--window-size=390,844`
  renders at 500px wide and crops the image to 390 — which looks exactly like
  horizontal overflow but is not. To test a true phone viewport, load the page in
  a sized `<iframe>` inside a local wrapper HTML and screenshot that.
- **Dev-server recompiles lag the screenshot.** After editing SCSS, request the
  page once with `curl`, wait, *then* capture. A stale capture has more than once
  looked like a CSS bug that was already fixed.

## Publications

`/publications` renders the Sanity `post` documents: the firm's own writing and
press mentions. Which is which is decided by `filter`, and by whether the
document carries someone else's URL in `source`.

Guides group themselves by the series name parsed out of the episode title
(`<Guide> - Épisode <n> : <subtitle>`), because the studio carries no `series`
field yet; the field takes over once it is added. Anyone writing for it works from
`../../docs/publications-editorial-brief.md`, which carries the house format, the
déontologie constraints, the full article list and the release schedule.

## Content: two sources, know which is which

**Sanity** is reached through `@sanity/client` and `@sanity/image-url` directly.
The `next-sanity` and `next-sanity-image` wrappers were dropped: each re-exported
one function, and between them they pinned the repo below Next 16. The
constructor is `createClient`, the named export; the default export still
resolves but is deprecated. `apiVersion` is pinned to `2025-02-19`, the version
where the default perspective changed from `raw` to `published`, and
`perspective` is set explicitly beside it so a later date cannot silently start
serving drafts: only the publications query filters `drafts.**` itself, and a
`[0]` projection would hand a page whichever copy came back first.

**The Sanity client must never reach the browser.** `SANITY_PROJECT` lives in
`libs/sanity-image.ts`, not beside the client, because the image URL builder
runs client-side and importing the constant from `libs/clientApi.ts` dragged
`@sanity/client`, `rxjs` and `get-it` into the bundle. For the same reason
neither `libs/publications.ts` nor `libs/expertise.ts` re-exports the pure
derivations beside it: a component importing `formatDate` or `plainText` from
the module that builds a client cost 23 kB gzipped on the home page. The pure
halves are `libs/publication-fields.ts`, `libs/expertise-list.ts` and
`libs/plain-text.ts`, and `libs/no-client-in-components.test.ts` walks the
import graph of every component and fails with the chain if one reaches the
client again. It is invisible in a diff and invisible in a screenshot; a test
is the only thing that sees it.

The image URL builder takes a plain `{ projectId, dataset }` rather than
reaching into the client for its private `clientConfig` — that coupling is what
forced a new major of `@sanity/image-url`, and what would otherwise have broken
on the jump from client v3 to v8.

`components/ui/sanityImage.tsx` reproduces what `useNextSanityImage` did by
default: `auto=format`, `fit=clip`, quality 75, a loader that resizes on Sanity's
CDN rather than through `/_next/image`, and a 64px blur-up placeholder at quality
30. The intrinsic size comes from the asset reference itself
(`image-<id>-<w>x<h>-<ext>`), parsed by `libs/sanity-image.ts`; without it
`next/image` cannot reserve the space and a responsive layout collapses.

**Sanity** (`libs/clientApi.ts`) holds page copy — titles, body rich text, the
expertise list. Editable by the client. No page component contains GROQ: the
queries live in `libs/page-content.ts` and `libs/expertise.ts`, which every
page's `getStaticProps` and the markdown route both call, so the two
representations of a page cannot drift. The one other query is inline in
`pages/api/sitemap.ts`, which asks the CMS only which field slugs exist today.

**`content/*.json`** holds UI strings and contact facts, keyed by locale.
`footerContent.json` is the canonical store for the address, phone, mobile,
email, the Google Maps URL and the geo coordinates; it is read by the home
colophon, the contact page, the footer and the structured data. Add contact details
there, not inline in a component.

### Orphaned Sanity fields

The redesign stopped rendering several fields. They still exist in the studio and
should be cleaned up there:

`mainImage`, `imageTitle` (all pages), `titleform`, `subform`, `titlebox`,
`body` (contact), `white`, `subtitle`.

The portrait is a **hardcoded local import**
(`components/layout/firm-section.tsx`, the block the home page and `/about`
share), not CMS driven — swapping it needs a developer.

### Draft mode, and editing on the page

The Studio's **Presentation** tool renders this site in an iframe beside the
form that feeds it, and every string on the page is a click target that selects
the field behind it. The Studio half is `apps/studio/sanity.config.js`, in the
other workspace; this half is the three pieces it talks to. Nothing validates
one against the other, so a change to either route name has to be made twice.

**`pages/api/draft.ts`** is the door. Presentation mints a one-time secret in
the dataset, calls the route with it, and `validatePreviewUrl` reads it back and
burns it. Anything less than a match is a `401`, including a dead token, which
is otherwise a stack trace on a public endpoint. The exit is
`pages/api/disable-draft.ts`, which needs no secret: the worst it can do is put
someone back on the published site. Nothing links to either; Presentation drives
the first, and the second is the way out for anyone who ends up holding the
cookie outside the Studio.

**`getClient(draft)` in `libs/clientApi.ts`** is what changes once the cookie is
set. Same query, same locale, same shape back; a different client. It reads
`perspective: "drafts"` off the API rather than the CDN, and it turns on
**stega**, which encodes an edit link into every string it returns.

Stega is why draft mode gates all of this rather than being on everywhere. Those
links are invisible Unicode riding along *inside* the copy: on the published
site they would end up in the HTML, in the markdown the agent surface serves,
and in anything a reader copies off the page. `getClient()` without the flag is
the ordinary published client and cannot produce them.

**`libs/static-page-props.ts`** carries the flag from Next to the fetcher, so
the six routes that go through it need no change of their own. The overlay in
`_app.tsx` keys off `router.isPreview` instead, which is global, so it covers
every route including the two that fetch outside `staticPageProps`.

`/publications` is deliberately not wired: `libs/publications.ts` filters
`drafts.**` and gates on `publishedAt` in GROQ, and those two would have to
become conditional to show an unpublished post. Publication pages render inside
Presentation, they just show what is live.

**Two env vars, and one of them is new.** `NEXT_PUBLIC_SANITY_ID` as before, plus
**`SANITY_TOKEN`**, a Sanity token with **Viewer** access, from
sanity.io/manage. It is read per request rather than at module scope, so the
published site neither needs it nor fails to boot without it. Only `/api/draft`
does, and it answers `401` when the token is missing or stale. The one that was
already in `.env` is revoked (`SIO-401-ANF`, "Session not found"); mint a fresh
one before expecting any of this to work.

**The overlay is not in the bundle a reader downloads.** It arrives through
`next/dynamic` with `ssr: false`, because it pulls `@sanity/ui` and
`styled-components`, the CSS-in-JS this repo otherwise does not have, and
those belong in a chunk nothing fetches until draft mode renders it. A build
that puts `styled-components` in `/_app` or `/` has lost that, and the symptom
is a bundle that grew, so check `.next/build-manifest.json` rather than the page.

## The agent surface

Every page answers in HTML to a browser and in markdown to an agent, from the
same URL. `proxy.ts` is the whole routing shim (`middleware` was renamed to
`proxy` in Next 16, and runs on Node rather than the edge):

| Request | Response |
|---|---|
| `Accept: text/markdown` on any page | `200 text/markdown`, rewritten to `pages/api/markdown.ts` |
| `/contact.md`, `/en/contact.md`, `/index.md` | the same, whatever the Accept header says |
| anything that resolves to markdown carrying a query string — a `.md` URL, `/llms.txt`, or any page under `Accept: text/markdown` | `308` to the same path without it, so `?bust=n` cannot mint a CDN key per visit. The HTML branch keeps its query, where a campaign parameter is legitimate |
| `Accept` that rules out both types | `406` from `pages/api/not-acceptable.ts` |
| a method other than `GET` or `HEAD` on a generated route | `405`. No CDN caches a non-GET, so it would otherwise reach the CMS on every request |
| anything else | the HTML page, plus `Vary: Accept` and a `Link: rel="alternate"` |
| a path that does not exist | `404` either way, and the markdown body lists the site |
| `/llms.txt`, `/en/llms.txt` | generated by `pages/api/llms.ts`, routed by the proxy |
| `/sitemap.xml` | generated by `pages/api/sitemap.ts`, routed by a `next.config.js` rewrite. Never reaches the proxy, so it bounds its own key space: an unexpected parameter is a `404`, not a `308` |

Rules worth keeping:

- **The routing decision is in `libs/proxy-route.ts`**, not in
  `proxy.ts`, which only turns the returned tag into a `NextResponse`.
  the suite cannot import the proxy file itself, and what keeps breaking is the
  branch *ordering* and which branch sets `Vary` — one table-driven test covers
  both. The decision is a tagged union (`pass` / `rewrite` / `redirect`), so the
  test narrows through a small helper per branch rather than reading a field off
  the wrong variant.
- **Parse the Accept header, never `includes('markdown')`.** `libs/accept.ts`
  implements RFC 9110 §12.5.1 (q-values, specificity, `q=0`); its tests are the
  table published at acceptmarkdown.com. A real Chrome header contains `*/*` and
  must resolve to HTML.
- **`Vary: Accept` on both branches.** Without it a CDN serves whichever variant
  it cached first to everyone.
- **The 406 is an API route the proxy rewrites to.** Next 12's middleware could
  not return a body at all; Next 16's proxy runs on Node and could, but keeping
  it a rewrite is what keeps the decision in `libs/proxy-route.ts` a value, and
  therefore testable.
- **Rewrites to an API route are built from `req.nextUrl.origin`** plus the
  route path, not from `nextUrl.clone()`, which carries the locale and would
  produce `/en/api/…`. The destination is the origin plus a constant route
  path, so nothing from the incoming URL reaches the route except the
  parameters the proxy sets on it.
- **The CDN keys on the incoming URL, not the rewritten one**, so keeping the
  query out of the rewrite is not what bounds the key space — the `redirect()`
  branch in `libs/proxy-route.ts` is. A markdown request carrying a query is 308'd onto the bare path, which
  collapses `?bust=n` onto one cacheable URL. It has to re-attach the locale:
  `nextUrl.pathname` arrives stripped, so building the target from it alone
  permanently redirects the English edition of a page to the French one.
- `locale: false` on a `next.config.js` rewrite silently stops it matching under
  i18n. `/sitemap.xml` is one rewrite without it; `/llms.txt` cannot be one at
  all, because it has a French and an English edition and only the proxy knows
  which was asked for.
- The markdown of a page and its HTML come from the same fetchers
  (`libs/page-content.ts`, `libs/expertise.ts`), so they cannot drift.
- **Every URL the site publishes comes from `libs/site-url.ts`** (`HOST`,
  `withLocale`, `pageUrl`, `markdownSibling`, `markdownUrl`, `routePath`): a
  canonical, an hreflang, a sitemap entry and a markdown sibling all have to
  agree, so there is one definition of how French goes unprefixed and English
  carries `/en`.
- **A new page has to be registered in four places**: `libs/site-pages.ts`
  (the list llms.txt and the `## Pages` section of every page's markdown
  publish), `pages/api/sitemap.ts`
  (`PAGES`), `content/404Content.json` (`links`) and the `render` match in
  `pages/api/markdown.ts`. `content/agentContent.json` needs its label and note.
  `/publications` is the worked example: its index and every post answer in
  markdown, an episode carrying the rest of its guide the way the page does.
- The JSON-LD lives in `components/head/site-schema.tsx` (published once per
  page from the layout) and `expertise-schema.tsx`, fed by
  `content/organizationContent.json` and `content/footerContent.json`. Contact
  facts have one home; do not retype the address into a schema block.
- `content/agentContent.json` holds the agent-facing copy: the llms.txt summary,
  the "when to use" guidance, the per-page notes. It is the one file to edit when
  that wording changes.

## Design system

The site carries no photography except the portrait and no colour except one dot.
Everything is type, rules and space, so the tokens are the design. They live in
`styles/_variables.scss`; use them rather than literals.

### Palette

```scss
$bg: #0a0a0a;          // page ground
$bg-raised: #141414;   // cookie banner, dropdown, modal surfaces
$paper: #f2f0ea;       // primary text, "white" for marks
$ink: #f2f0ea;         // alias of $paper for text
$ink-muted: #8f8c85;   // body copy, labels, secondary
$rule: #2a2a2a;        // hairlines
$rule-strong: #454545; // hover borders
```

**The only colour on the site is the coral dot in the ISKA wordmark**
(`#FF6C59`). Do not introduce accents. `$accent` exists but is deliberately
aliased to `$paper` — it is not a colour, it is emphasis.

Hardcoded literals have caused every dark-theme bug so far (`background-color:
black` on the burger, `white` autofill shadows, `color: black` placeholders).
If you write a raw colour word, you have almost certainly made a mistake.

**The fonts are self-hosted, through `next/font/google` in `pages/_app.tsx`.**
They are downloaded at build time and served from this origin; there is no
request to `fonts.googleapis.com` or `fonts.gstatic.com` at page load. That
matters twice over: it was a render-blocking third-party stylesheet in front of
a page made almost entirely of type, and it sent every visitor's IP to Google
from a law practice's own site.

The loader declares no `fallback` list on purpose. Passing one suppresses the
metrics-matched face Next derives from the real font (`ascent-override`,
`size-adjust`), and that face is what keeps a 144px headline from reflowing when
the webfont swaps in. The designer's `Didot, 'Times New Roman', serif` chain
lives on as the `var()` fallback in `styles/_variables.scss`, for the only case
it was really for: the custom property not being set at all.

Stylesheets name the families through `var(--font-bodoni)` and
`var(--font-inter)`, never as literals. `_app.tsx` sets both on `:root` with a
`<style jsx global>` block, because `globals.scss` styles `body` and `body` is
above anything a component can put a className on.

`pages/_document.tsx` is gone: the three font `<link>` tags were the only thing
in it that Next's default document does not already do.

### Type — two families, split by size

| | |
|---|---|
| **Bodoni Moda** | headlines only, roughly ≥40px. `@include serif` / `@include seriflight` |
| **Inter** | everything else — nav, labels, links, body, UI |

The split is a hard rule, not a preference. Bodoni is a Didone: its hairlines
thin out badly on a black ground at small sizes. It is loaded with an `opsz`
axis and `font-optical-sizing: auto` so the sizes it *is* used at stay solid.

`@include micro` is the counterweight and the site's workhorse label style:
0.75rem, 500, `0.18em` tracking, uppercase, Inter. Nav, section indices, field
labels, buttons and the colophon all use it.

Headings are **uppercase** with slightly negative tracking. Body copy is
`$ink-muted`, capped at `$measure` (39rem, 624px, about 84 characters a line at
the 1rem body size).

`$measure` was `62ch` and is a fixed length now. `ch` is the width of the `0`
glyph, and Inter's `0` is a third wider than its average letter, so `62ch` never
meant 62 characters, it meant about 84. Worse, it scaled with the font size of
whatever it was applied to: on the ISKA tagline, at 40px, the same token was
1378px. A length means one thing everywhere, and the characters per line follow
from the font size of the text inside it.

`$measure-wide` (60rem) is the publications measure, and it is a **cap, not a
width**. `.body` fills whatever grid column it is given and stops at the cap.
Beside the episode index that column is narrower and wins, so a guide episode
sets at 832px on a 1440px screen with its right edge flush against the meta rule
and the banner, and it stays flush at every width because it is the column
rather than a number. An article has no index, so its row is the whole container
and the cap is what stops it; without one it ran to 164 characters a line.

Both are anchored left, where the banner and the meta rule start. A centred
column reads as floating on a page whose every other edge is flush left.
`$measure` is the blurb width and is not used by publications.

### Scale

| Token | 375px | 1440px | Used by |
|---|---|---|---|
| `$fs-display` | 48px | **144px** | home hero name |
| `$fs-h1` | 44px | 88px | page banners |
| `$fs-section` | 36px | 64px | section headings |
| `$fs-h2` | 26px | 40px | expertise accordion items |
| `$fs-h3` | 20px | 28px | small headings |
| `$fs-display-sub` | 12px | 14px | hero byline |

All fluid `clamp()`, interpolating 375 → 1440. **Do not add breakpoint-specific
font sizes.** The old code did, and produced a cliff where the hero jumped from
92px to 35px across a single pixel at the 768 breakpoint.

The extreme contrast between the 144px name and the 12px byline is the design,
not an accident. Resist filling the gap between them.

### Space, motion, rules

`$space-1`…`$space-8` on an 8px base (0.5rem → 8rem). Use them; do not write
ad-hoc rem values.

Motion is nearly absent, and that is the design rather than an omission.

**Nothing animates because it arrived.** The pages are type on a black ground,
served rendered: a reveal laid over that is a page pretending to load, and it
costs the one thing the design is actually built on, which is that the type is
up immediately.

**Three things animate, and all three animate because something changed:**

- picking a field of expertise — the column that was replaced fades, keyed on
  the field's slug so it replays on every pick. Everything around it, the index
  included, holds still, which is the point: without a cue the swap is invisible.
- opening the mobile menu — the panel fades as one.
- the cookie banner arriving.

One curve and two durations: `$ease` (`cubic-bezier(0.22, 1, 0.36, 1)`),
`$dur-fast` 150ms, `$dur` 250ms. Hovers change **colour only**; never nudge an
element with `transform` under the cursor.

`globals.scss` has a `prefers-reduced-motion` block and a single
`:focus-visible` rule. Keep both working.

**A full reveal vocabulary was built here and taken out again.** Four things it
cost, so that they do not have to be found twice:

- **A JS reveal has to be paid for in the HTML.** Server-rendering
  `opacity: 0` and turning it on after hydration means the page is blank
  whenever that JavaScript does not arrive: a chunk that 404s after a deploy
  while a tab is open, an extension, JS off. Seen for real in this repo, twice,
  as a black screen with a header. CSS keyframes do not have this failure mode.
- **It gates LCP.** Nothing on the page is a contentful-paint candidate while it
  is transparent, so the largest element cannot be measured until hydration
  finishes. FCP stayed at ~85ms; LCP moved behind the JS.
- **`motion` is ~43KB gzipped**, on a site that self-hosts its fonts to save one
  render-blocking stylesheet. It cannot be trimmed with `LazyMotion` either:
  `inView` is in none of its feature presets (`domMin`, `domAnimation`,
  `domMax` are four lines each in
  `node_modules/framer-motion/dist/es/render/dom/features-*.mjs`), so
  `whileInView` needs the full component.
- **A page transition has two traps.** Next scrolls a new route to the top on
  the first frame of a navigation, measured at 13ms, while the page being left
  is still fully lit — so an article read to the end snaps back to its own title
  before it fades, and something has to hold the position for the length of the
  fade-out. And `/expertise/[slug]` is ten routes over one page which must be
  one key, or the whole page transitions every time the index is clicked.

### The kit — six elements, and that is the whole vocabulary

1. Bodoni headlines
2. Inter micro-labels
3. Hairline rules (`$rule`)
4. Numeric index — `01 / 02 / 03` on the home practice list, the expertise
   accordion, the publications index and a guide's episode rail
5. The ink-illustration portrait
6. The ISKA wordmark

Four surfaces share one row shape: a micro-caps label gutter, the value beside
it, a rule beneath. The home practice list, the contact details, the publications
index and a guide's episode rail are all the same pattern — keep them that way.

**Deliberately removed. Do not reintroduce without asking:** diagonal
`clip-path` panels, the scales-of-justice line drawing, decorative photography,
the splash loader, gradient scrims, drop shadows, border radius, decorative
icons. Three icons remain, all functional: `ArrowSmRightIcon` (expertise card
link), `ChevronDownIcon` (accordion and language picker), `PhoneIcon` (mobile
call button). Adding a fourth should need a reason.

## Conventions

- SCSS modules colocated with the component, `kebab-case.module.scss`.
- `@use '../styles/variables' as *;` at the top of every module.
- Layout containers via `@include desktop-container` (1200px, 90% max).
- Breakpoints: `$breakpoint-sm` 768, `$breakpoint-md` 992, `$breakpoint-lg` 1200.
- Header is `position: sticky`; anchor targets need `scroll-margin-top`.
- French copy: use typographic apostrophes and respect the `(0)` trunk prefix in
  phone numbers. It is displayed but must be stripped from `tel:` hrefs, or the
  number will not dial, so `content/footerContent.json` stores both forms:
  `phone` / `mobilePhone` are dial-safe, and the displayed strings live in
  `fr.address` / `en.address` for the landline and `fr.mobile` / `en.mobile`
  for the mobile. llms.txt hands agents the dial-safe form.
- Formatting is Biome's, not yours: run `pnpm biome:fix` rather than matching
  the surrounding style by hand. SCSS is the exception, see above.
- New pure logic goes in `libs/*.ts` with a colocated `*.test.ts`, and its
  shared types in `libs/types.ts`. Anything that needs React or the Sanity
  client is verified with curl or a screenshot instead — Vitest could import it,
  but there is no component or route test in the suite and none is expected.
- Import specifiers carry no extension (`'./slug'`), and type-only imports use
  `import type`.

## Known debt

- `sharp` was removed with the other eleven unreferenced dependencies. Next 12
  picks it up implicitly for image optimisation when it is present; on Vercel the
  platform supplies it, so this only matters if the site is ever self-hosted.
- `public/images/alice-portrait-illustration.png` is 1.7MB in the repo. It goes
  through `next/image`, so what ships is optimised, but the source is heavy.
- Legacy tokens (`$white`, `$gray*`, `$cyan*`) still sit in `_variables.scss`;
  `$green600` and `$amber600` are genuinely used by form status icons.
- `content/publicationsContent.json` carries no `description`, so the markdown
  representation of `/publications` publishes a title and its lists with no
  blockquote lead. Every other page has one.
- No published document currently embeds a CMS image, so
  `components/ui/sanityImage.tsx` is unexercised in production. It is covered by
  the reference parser's tests, a component test for the size and alt reaching
  the DOM, and a manual check that all three CDN URLs it builds resolve.
- `images.qualities` in `next.config.js` does not take effect: Next 16 inlines
  two copies of the image config into the pages-router SSR bundle, and
  `next/image` resolves against the default `[75]` rather than the project's.
  The portrait's `quality={72}` was dropped for that reason. Do not re-add a
  `quality` prop expecting it to survive without checking the emitted `q=`.
- `libs/types.ts` describes the CMS documents by hand rather than parsing them.
  The GROQ projections are the contract, and nothing validates that a document
  matches the type at the boundary; a studio schema change is caught by a
  screenshot, not by the compiler.

> When auditing for unused tokens, note that macOS ships **BSD grep**, which does
> not honour `\b`. A `grep -r '\$token\b'` sweep silently matches nothing and
> reports everything as unused. Use `grep -rF`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
