# Ouaknine

Marketing site for Alice Ouaknine, a criminal-law practice in Paris, and the
Sanity Studio that feeds it.

| | |
|---|---|
| `apps/web` | Next.js 16, pages router, TypeScript. Deployed on Vercel |
| `apps/studio` | Sanity Studio v6. Deployed on Sanity's hosting |

```bash
pnpm install
pnpm dev        # the site on :3000
pnpm studio     # the studio on :3333
pnpm verify     # lint, typecheck and test both workspaces
```

The site needs `NEXT_PUBLIC_SANITY_ID` in `apps/web/.env.local` to render a
page: every page's `getStaticProps` fetches from the CMS.

`CLAUDE.md` at the root and in `apps/web` carry the rest.
