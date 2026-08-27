# CLAUDE.md

Two workspaces, one site. Everything specific to either of them is documented
inside it; this file is only the map and the seams between them.

```
apps/web      the Next.js site.               See apps/web/CLAUDE.md, the long one.
apps/studio   the Sanity Studio that feeds it. See apps/studio/CLAUDE.md.
docs/         editorial briefs. Prose about content, not about either codebase.
```

## Commands

pnpm workspaces, installed once from here. `packageManager` pins the pnpm
version; there is no Turborepo, because with two apps and no shared package
there is nothing for it to schedule.

```bash
pnpm install   # both workspaces
pnpm dev       # both dev servers: the site on :3000, the studio on :3333
pnpm build     # both. The site needs NEXT_PUBLIC_SANITY_ID
pnpm verify    # everything CI runs, every workspace
```

Every root script is `pnpm -r <task>`. None of them names a workspace, which is
the point: a third one is picked up without editing this file or the CI. Narrow
with `pnpm --filter web <task>` or `pnpm --filter studio <task>`.

## What keeps the two apps equal

Not sameness. They do not share a language, a linter, a test runner or a deploy
target, and forcing them to would mean giving the studio a `tsconfig.json` it
has no use for. What they share is the **task vocabulary**: `dev`, `build`,
`lint`, `test`, `verify`. Every workspace answers to those five words; what each
one runs behind them is its own business.

`scripts/workspace-parity.mjs` is what makes that a rule rather than a habit.
`pnpm -r <task>` runs the workspaces that define a task and **exits 0 on the
ones that do not**, so a workspace added without a `verify` does not fail CI, it
disappears from it. The guard fails the build instead. It runs first in
`pnpm verify`, and `pnpm verify` is the whole of the CI job.

`catalog:` in `pnpm-workspace.yaml` is the same idea for dependencies: React is
the one both apps really use, so it is declared once and neither can drift onto
its own 19.x.

Three asymmetries are deliberate, and named here so nobody tries to fix them:

| | Why |
|---|---|
| `engines.node` only in `apps/web` | Vercel reads it from the deployed workspace. A second copy would be a second thing to forget. CI points at that one file |
| Biome only covers `apps/web` | Its rules assume TypeScript and the React Compiler. The studio's own ESLint config covers the studio |
| Only the site has a `deploy` through git | The studio deploys with `pnpm --filter studio deploy`, to Sanity's hosting, by hand |

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

The second seam runs the other way, and it is a URL rather than a type.
`presentationTool` in `apps/studio/sanity.config.js` frames the site and calls
`/api/draft` on it to hand over a one-time preview secret;
`apps/web/pages/api/draft.ts` is what answers. Nothing validates that pairing
either: rename the route and the Studio keeps offering a preview button that
401s. `SANITY_STUDIO_PREVIEW_URL` chooses which site gets framed, defaulting to
production, and `.conductor/settings.toml` points it at the local one. The site
side of it is documented under "Draft mode, and editing on the page" in
`apps/web/CLAUDE.md`.

## Conductor

`.conductor/settings.toml` and `.worktreeinclude` at the root configure the
workspaces. Two run scripts rather than one, because the root `pnpm dev` starts
both servers and cannot give them different ports: `web` takes
`$CONDUCTOR_PORT` and `studio` takes `$CONDUCTOR_PORT + 1`, which is what makes
`run_mode = "concurrent"` safe. Both are `available_in = ["local"]`, since
`$CONDUCTOR_PORT` is unset in a cloud workspace and both servers would fall
back to their default port and collide.

`.worktreeinclude` copies `apps/web/.env*`, not a root `.env`. Next resolves
its env file from its own project directory, so a copy at the repo root is read
by nothing. **The main checkout has to have the file at `apps/web/.env` for
there to be anything to copy.**

The Mac app reads the shared `settings.toml` from the default branch on the
remote, so none of this takes effect until it is on `main`.

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
