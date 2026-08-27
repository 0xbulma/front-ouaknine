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

// The deployed Studio. stega encodes an edit link into every string a draft-mode
// query returns, and the link has to resolve somewhere: inside Presentation the
// overlay talks to its parent over postMessage, but a draft-mode visit made
// outside the Studio falls back to this.
const STUDIO_URL = "https://cabinet-ouaknine.sanity.studio";

// `SANITY_TOKEN` is read per call rather than at module scope, because the
// published site never needs it and must not fail to boot without it. A Viewer
// token is enough; drafts are all it has to see.
const draftToken = (): string => {
	const token = process.env.SANITY_TOKEN;
	if (!token) {
		throw new Error("Draft mode needs SANITY_TOKEN, a Sanity token with Viewer access");
	}

	return token;
};

// Unpublished content, and no CDN in front of it — a draft that is one edit old
// is the same as no draft at all. Deliberately without stega: the preview-secret
// handshake in pages/api/draft.ts compares a string it fetched from this client,
// and stega would have encoded that string.
export const previewClient = () =>
	clientApi.withConfig({ token: draftToken(), useCdn: false, perspective: "drafts" });

// What a page reads through. Draft mode swaps in a client that sees unpublished
// content and stega-encodes an edit link into every string it returns, which is
// what the overlay in pages/_app.tsx turns into a click target.
//
// Never the default: those links are invisible Unicode riding along inside the
// copy, and they would end up in the published HTML, in the markdown the agent
// surface serves, and in anything a reader copies off the page.
export const getClient = (draft?: boolean) =>
	draft
		? previewClient().withConfig({ stega: { enabled: true, studioUrl: STUDIO_URL } })
		: clientApi;
