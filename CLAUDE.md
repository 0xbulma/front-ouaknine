# CLAUDE.md

Guidance for working in this repository. The design system section is the part
that matters most: the site is almost entirely typography and rules, so changes
that look small are usually design decisions.

## The project

Marketing site for **Alice Ouaknine**, a criminal-law practice in Paris (17 rue
de Douai, 75009). Bilingual `fr` / `en`. Six pages: home, expertise,
publications, contact, iska, legal, plus a 404.

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
`--dir pages --dir components --dir libs`. Adding a top-level directory means
adding it there too.

**`yarn test` covers the pure derivations** in `libs/slug.js`, `libs/href.js` and
`libs/publication-fields.js`: the functions that turn a title into every URL,
hreflang and `@id` on the site, and that decide whether a CMS-authored link is
same-site or hostile. They fail silently into a 404 or an unsafe anchor, and one
of them already broke once. Node's own runner, no dependencies, no config. There
is no component or end-to-end suite.

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
const clientApi = { fetch: async q => (q.includes('"home"') ? [HOME] : []) };
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

**Sanity** (`libs/clientApi.js`, GROQ in each page's `getStaticProps`) holds page
copy — titles, body rich text, the expertise list. Editable by the client.

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

The home portrait is a **hardcoded local import** (`pages/index.js`), not CMS
driven — swapping it needs a developer.

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
  phone numbers — it is displayed but must be stripped from `tel:` hrefs, or the
  number will not dial.

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
