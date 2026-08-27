# CLAUDE.md

Two workspaces, one site. Everything specific to either of them is documented
inside it; this file is only the map and the seams between them.

```
apps/web      the Next.js site.       See apps/web/CLAUDE.md, which is the long one.
apps/studio   the Sanity Studio that feeds it. Imported from 0xbulma/back-ouaknine.
docs/         editorial briefs. Prose about content, not about either codebase.
```

## Commands

pnpm workspaces, installed once from here. `packageManager` pins the pnpm
version; there is no Turborepo, because with two apps and no shared package
there is nothing for it to schedule.

```bash
pnpm install              # both workspaces
pnpm dev                  # the site on :3000
pnpm studio               # the studio on :3333
pnpm verify               # everything CI runs, both workspaces
pnpm build                # next build. Needs NEXT_PUBLIC_SANITY_ID
pnpm studio:deploy        # sanity deploy, pinned to the existing studio by appId
```

Anything narrower is `pnpm --filter web <script>` or `pnpm --filter studio
<script>`. The two apps do not share a lint, a test runner, or a language: the
site is TypeScript on Biome + Vitest, the studio is JavaScript on
`@sanity/eslint-config-studio` + `node --test`. `pnpm verify` runs both.

`catalog:` in `pnpm-workspace.yaml` holds the one dependency they genuinely
share, React, so the studio and the site cannot drift onto two different 19.x.

## The seam

`apps/studio/schemas` is the contract `apps/web/libs/types.ts` describes by
hand. Nothing validates one against the other, so a schema change lands in the
site as a runtime surprise rather than a type error. When you touch a schema,
grep `apps/web/libs` for the field name.

`apps/studio/scripts/check-orphaned-fields.mjs` is the other half of that: it
reads the live dataset and reports fields the schema no longer has anywhere to
put. `pnpm --filter studio check:data`. It hits the network, so it is not part
of `verify`.

Both halves point at Sanity project `46fx2dmc`, dataset `production`. The site
reads the id from `NEXT_PUBLIC_SANITY_ID`; the studio hardcodes it in
`sanity.cli.js` and `sanity.config.js`.

## Deploying

Vercel builds `apps/web` only. Its **Root Directory** must be `apps/web`, with
"Include files outside the Root Directory" on so the install can see the root
lockfile. Nothing in the repo sets that, so it is a dashboard change and the
build breaks without it.

The studio deploys separately with `pnpm studio:deploy`, to Sanity's own
hosting. It is not part of the Vercel build and CI never builds it.

## History

`apps/studio` was brought in with `git subtree`, so its six commits are real
commits in this repo: `git log apps/studio` works, and so does `git show
835b9718:schemas/post.js` for a path that predates the move.
`apps/studio/test/schema-parity.test.js` depends on the second, which is why
CI checks out with `fetch-depth: 0`.
