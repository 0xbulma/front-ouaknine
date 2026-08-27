# CLAUDE.md

Guidance for working on the Sanity Studio. It lives at `apps/studio`; the site
it feeds is `apps/web`, and the repo root carries its own CLAUDE.md. Every path
below is relative to `apps/studio`.

## The project

The content back office for the Alice Ouaknine site. Sanity project `46fx2dmc`,
dataset `production`, deployed to Sanity's own hosting rather than to Vercel.

| | |
|---|---|
| Framework | Sanity Studio **v6**, upgraded from v2 |
| Language | **JavaScript**, ESM (`"type": "module"`). No TypeScript, so no `typecheck` |
| Lint | **ESLint** with `@sanity/eslint-config-studio`. Biome does not run here |
| Tests | `node --test`. No Vitest, no test framework |
| Deploy | `pnpm --filter studio deploy`, pinned to the existing studio by `appId` |

```bash
pnpm dev          # sanity dev, :3333
pnpm build        # sanity build
pnpm verify       # lint + test, what CI runs
pnpm lint         # eslint .
pnpm test         # node --test
pnpm check:data   # orphaned-field report against the live dataset. Not in verify
```

## Its toolchain is not the site's, on purpose

The site is TypeScript on Biome; this is JavaScript on
`@sanity/eslint-config-studio`. Do not try to bring Biome here: the site's
config bans `useCallback` from `react` (the React Compiler memoizes for it), and
`helpers/debounce-hooks.js` is built on `useCallback`. `biome.json` lives in
`apps/web` and its `files.includes` is an allowlist of that app's globs, so this
directory was never in scope.

What the two workspaces do share is the **task vocabulary**: `dev`, `build`,
`lint`, `test`, `verify`. `scripts/workspace-parity.mjs` at the repo root fails
if either drops one, because `pnpm -r <task>` exits 0 on a workspace that does
not define it, and silence reads exactly like a pass.

`@sanity/eslint-config-studio` declares neither Node nor browser globals, so
`eslint.config.js` adds each by hand to the files that need them: `console` /
`process` / `fetch` for `scripts` and `test`, `setTimeout` / `clearTimeout` for
`components` and `helpers`. Adding `globals` as a dependency for a handful of
names is not worth it.

## The schema is the contract

`schemas/` is what `apps/web/libs/types.ts` describes by hand. Nothing validates
one against the other: a renamed field is a runtime surprise in the site, not a
type error. When you touch a schema, grep `apps/web/libs` for the field name.

Two tools exist for that seam and they look at opposite ends of it:

- **`test/schema-parity.test.js`** compares the current schema against the v2
  original, loaded straight out of git (`git show <sha>:schemas/...`). It proves
  the v2 to v6 upgrade changed nothing but the two entries in `EXPECTED_DIFFS`.
  The baseline is pinned to commit `835b9718`, **not** to a branch ref: it was
  `origin/master`, which moved onto v6 the moment that upgrade merged, and the
  test spent a while comparing v6 against itself. Reaching that commit needs
  full history, which is why CI checks out with `fetch-depth: 0`.
  An intentional schema change means editing `EXPECTED_DIFFS`, with the reason.
- **`scripts/check-orphaned-fields.mjs`** reads the live dataset and reports
  fields that exist in documents but have nowhere to live in the schema. Not
  lost data, just invisible in the Studio. It hits the network, so it is not
  part of `verify`. `apps/web/CLAUDE.md` lists the fields the redesign stopped
  rendering; they should be cleaned up here.

## Conventions

- Schema types are plain, import-free objects. That is what lets the parity test
  load two versions of them side by side, so keep them that way.
- `sanity.cli.js` carries `deployment.appId`, which pins `sanity deploy` to the
  existing studio so it can never prompt for one and mint a second.
- The `components/` tree is largely inherited from the Sanity blog template
  (pets, products, humans) and is not wired to any schema here. Deleting it is
  safe and overdue; nothing in `schemas/` imports it.
