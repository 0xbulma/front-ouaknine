# CLAUDE.md

Guidance for working in this repository. The design system section is the part
that matters most: the site is almost entirely typography and rules, so changes
that look small are usually design decisions.

## The project

Marketing site for **Alice Ouaknine**, a criminal-law practice in Paris (17 rue
de Douai, 75009). Bilingual `fr` / `en`. Seven pages: home, about, expertise,
publications, contact, ISKA, legal, plus a 404.

| | |
|---|---|
| Framework | Next.js 12, **pages router** (not App Router) |
| Styling | SCSS modules + a global token file. No Tailwind, no CSS-in-JS |
| Content | Sanity for page copy, local JSON for UI strings |
| Package manager | **yarn** (`yarn.lock` is committed; there is no `packageManager` field) |
| Node | 24.x per `engines` |

```bash
yarn install --frozen-lockfile
yarn dev      # next dev
yarn build    # next build
yarn lint     # next lint
yarn test     # node --test
```

Run `yarn lint`, `yarn test` and `yarn build` before calling anything done, and
know what each one does and does not cover.

**There is no typecheck.** No TypeScript, no `tsconfig.json`, so `next build`
checks nothing beyond compiling.

**`next lint` walks only what it is told to.** Its default directory list is
`pages`, `components`, `lib`, `src`. This repo's is `libs` (plural), so for a
long time nothing in it was linted at all; the `lint` script now passes
`--dir pages --dir components --dir libs --dir hooks --dir context`. Adding a
top-level directory means adding it there too.

**`yarn test` covers the pure derivations.** `libs/slug.js`, `libs/href.js` and
`libs/publication-fields.js` turn a title into every URL, hreflang and `@id` on
the site, and decide whether a CMS-authored link is same-site or hostile; they
fail silently into a 404 or an unsafe anchor, and one of them already broke
once. The agent surface adds the negotiation (`libs/accept.mjs`), the routing
decision (`libs/middleware-route.mjs`), the markdown rendering, the page list,
the URL spelling and llms.txt. Node's own runner, no dependencies, no config.

Node 24 detects module syntax, so a `.mjs` test imports a plain `.js` module
fine — the extension is not what makes something testable. What does is not
importing the Sanity client or React, and writing the import with its extension
(`'./slug.js'`, not `'./slug'`, which only webpack resolves). A bare
`import x from './foo.json'` still needs `with { type: 'json' }` under Node,
which is why `libs/agent-context.js` keeps the JSON imports and
`libs/site-pages.mjs` stays pure.

The JSON-LD has no unit test; it lives in JSX components and is checked with
curl. Components and routes have none either — check those with curl against
`yarn build && yarn start`. There is no end-to-end suite.

## Local development: read this before you try to run it

**`yarn build` and `yarn dev` cannot render pages without `NEXT_PUBLIC_SANITY_ID`.**
Every page's `getStaticProps` calls Sanity, and without the env var the client
throws `Configuration must contain projectId`. `yarn build` compiles and
typechecks fine, then fails at "Collecting page data". Pages 500 in dev.

If you have the value, put `.env.local` in the **repository root** (not the
worktree) so new workspaces inherit it via Files to copy.

If you do not have it and need to see a visual change, stub the client:

```js
// libs/clientApi.js — TEMPORARY, revert before committing
const block = (k, t) => ({ _type: 'block', _key: k, style: 'normal',
  children: [{ _type: 'span', _key: k + 's', text: t, marks: [] }] });
const HOME = { title1: 'Alice Ouaknine', title2: 'Barreaux de Paris et de Californie',
  tag1: '…', link1: 'e1', sectionTitle: 'Le cabinet', body: [block('b1', '…')] };
// The queries in libs/page-content.js and libs/expertise.js project `[0]`, so
// a fetch resolves to a document or to null — not to an array.
const clientApi = { fetch: async q => (q.includes('"home"') ? HOME : null) };
export default clientApi;
```

**Always restore `libs/clientApi.js` before committing** and confirm with
`git diff --stat libs/clientApi.js` that it is empty. Fixture copy is invented,
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
`docs/publications-editorial-brief.md`, which carries the house format, the
déontologie constraints, the full article list and the release schedule.

## Content: two sources, know which is which

**Sanity** (`libs/clientApi.js`) holds page copy — titles, body rich text, the
expertise list. Editable by the client. No page component contains GROQ: the
queries live in `libs/page-content.js` and `libs/expertise.js`, which every
page's `getStaticProps` and the markdown route both call, so the two
representations of a page cannot drift. The one other query is inline in
`pages/api/sitemap.js`, which asks the CMS only which field slugs exist today.

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
(`components/layout/firm-section.jsx`, the block the home page and `/about`
share), not CMS driven — swapping it needs a developer.

## The agent surface

Every page answers in HTML to a browser and in markdown to an agent, from the
same URL. `middleware.js` is the whole routing shim:

| Request | Response |
|---|---|
| `Accept: text/markdown` on any page | `200 text/markdown`, rewritten to `pages/api/markdown.js` |
| `/contact.md`, `/en/contact.md`, `/index.md` | the same, whatever the Accept header says |
| anything that resolves to markdown carrying a query string — a `.md` URL, `/llms.txt`, or any page under `Accept: text/markdown` | `308` to the same path without it, so `?bust=n` cannot mint a CDN key per visit. The HTML branch keeps its query, where a campaign parameter is legitimate |
| `Accept` that rules out both types | `406` from `pages/api/not-acceptable.js` |
| a method other than `GET` or `HEAD` on a generated route | `405`. No CDN caches a non-GET, so it would otherwise reach the CMS on every request |
| anything else | the HTML page, plus `Vary: Accept` and a `Link: rel="alternate"` |
| a path that does not exist | `404` either way, and the markdown body lists the site |
| `/llms.txt`, `/en/llms.txt` | generated by `pages/api/llms.js`, routed by the middleware |
| `/sitemap.xml` | generated by `pages/api/sitemap.js`, routed by a `next.config.js` rewrite. Never reaches the middleware, so it bounds its own key space: an unexpected parameter is a `404`, not a `308` |

Rules worth keeping:

- **The middleware decision is in `libs/middleware-route.mjs`**, not in
  `middleware.js`, which only turns the returned tag into a `NextResponse`.
  `node --test` cannot import a middleware file, and what keeps breaking is the
  branch *ordering* and which branch sets `Vary` — one table-driven test covers
  both.
- **Parse the Accept header, never `includes('markdown')`.** `libs/accept.mjs`
  implements RFC 9110 §12.5.1 (q-values, specificity, `q=0`); its tests are the
  table published at acceptmarkdown.com. A real Chrome header contains `*/*` and
  must resolve to HTML.
- **`Vary: Accept` on both branches.** Without it a CDN serves whichever variant
  it cached first to everyone.
- **Middleware cannot return a body** in Next 12; that is a build error, not a
  warning. Anything with a body is an API route it rewrites to.
- **Rewrites to an API route are built from `req.nextUrl.origin`** plus the
  route path, not from `nextUrl.clone()`, which carries the locale and would
  produce `/en/api/…`. The destination is the origin plus a constant route
  path, so nothing from the incoming URL reaches the route except the
  parameters middleware sets on it.
- **The CDN keys on the incoming URL, not the rewritten one**, so keeping the
  query out of the rewrite is not what bounds the key space — the `redirect()`
  branch in `libs/middleware-route.mjs` is. A markdown request carrying a query is 308'd onto the bare path, which
  collapses `?bust=n` onto one cacheable URL. It has to re-attach the locale:
  `nextUrl.pathname` arrives stripped, so building the target from it alone
  permanently redirects the English edition of a page to the French one.
- `locale: false` on a `next.config.js` rewrite silently stops it matching under
  i18n. `/sitemap.xml` is one rewrite without it; `/llms.txt` cannot be one at
  all, because it has a French and an English edition and only middleware knows
  which was asked for.
- The markdown of a page and its HTML come from the same fetchers
  (`libs/page-content.js`, `libs/expertise.js`), so they cannot drift.
- **Every URL the site publishes comes from `libs/site-url.mjs`** (`HOST`,
  `withLocale`, `pageUrl`, `markdownSibling`, `markdownUrl`, `routePath`): a
  canonical, an hreflang, a sitemap entry and a markdown sibling all have to
  agree, so there is one definition of how French goes unprefixed and English
  carries `/en`.
- **A new page has to be registered in four places**: `libs/site-pages.mjs`
  (the list llms.txt and the `## Pages` section of every page's markdown
  publish), `pages/api/sitemap.js`
  (`PAGES`), `content/404Content.json` (`links`) and the `render` match in
  `pages/api/markdown.js`. `content/agentContent.json` needs its note.
- The JSON-LD lives in `components/head/site-schema.jsx` (published once per
  page from the layout) and `expertise-schema.jsx`, fed by
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
`$ink-muted`, capped at `$measure` (62ch).

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

One curve and two durations: `$ease` (`cubic-bezier(0.22, 1, 0.36, 1)`),
`$dur-fast` 150ms, `$dur` 250ms, `$stagger` 80ms. Reveals are deliberately
short — a typographic page with slow choreography reads broken, not elegant.
Hovers change **colour only**; never nudge an element with `transform` under
the cursor.

`globals.scss` has a `prefers-reduced-motion` block and a single
`:focus-visible` rule. Keep both working.

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
- New pure logic goes in `libs/*.mjs` with a colocated `*.test.mjs`. Anything
  that needs React, the Sanity client, or a bare `import … from '*.json'` stays
  in `.js` / `.jsx` and is verified with curl or a screenshot — webpack resolves
  a bare JSON import, Node ESM would need `with { type: 'json' }`, which is why
  `libs/agent-context.js` is `.js` and keeps `libs/site-pages.mjs` pure.

## Known debt

- **Ten unused dependencies**: `sib-api-v3-sdk`, `nodemailer`, `validator`,
  `axios`, `react-lottie`, `vivus`, `styled-components`, `bezier-easing`, `qs`,
  `sharp`. Removing them touches the lockfile and has not been done.
- `public/images/_50A7988_1.jpeg` (5.3MB) and `logodraft.svg` are unreferenced.
- `public/images/paris-map.svg` is 810KB raw / ~254KB gzipped — the heaviest
  asset on the site. SVGO would likely halve it.
- Legacy tokens (`$white`, `$gray*`, `$cyan*`) still sit in `_variables.scss`;
  `$green600` and `$amber600` are genuinely used by form status icons.

> When auditing for unused tokens, note that macOS ships **BSD grep**, which does
> not honour `\b`. A `grep -r '\$token\b'` sweep silently matches nothing and
> reports everything as unused. Use `grep -rF`.
