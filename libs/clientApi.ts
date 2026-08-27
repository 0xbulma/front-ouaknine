import { createClient } from "@sanity/client";
import { SANITY_PROJECT } from "./sanity-image";

// `@sanity/client` directly, not through `next-sanity`. That wrapper re-exported
// one function; its current release peers on Next 16 with React 19, while
// `next-sanity-image` capped the other end at Next 15. Between them they pinned
// this repo to a version of Next it has outgrown.

// `SANITY_PROJECT` lives in libs/sanity-image.ts, which the browser imports.
// The builder takes those two fields straight rather than reaching into the
// client for its private `clientConfig` — the coupling that forced a new major
// of @sanity/image-url, and what would otherwise have broken on this bump.

const clientApi = createClient({
	...SANITY_PROJECT,
	// The API version this code was written against, and the one where the
	// default perspective changed from `raw` to `published`. `perspective` is set
	// beside it anyway, so bumping the date cannot silently start serving drafts:
	// only the publications query filters `drafts.**` itself, and a `[0]`
	// projection would otherwise hand a page whichever copy the CMS returned first.
	apiVersion: "2025-02-19",
	perspective: "published",
	useCdn: true,
});

export default clientApi;
