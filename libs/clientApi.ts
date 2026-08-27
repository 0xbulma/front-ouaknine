import SanityClient from "@sanity/client";

// `@sanity/client` directly, not through `next-sanity`. That wrapper re-exported
// one function; its current release peers on Next 16 with React 19, while
// `next-sanity-image` capped the other end at Next 15. Between them they pinned
// this repo to a version of Next it has outgrown.
//
// `createClient` is a named export from v4 onwards. On the version pinned here
// the constructor is the default export, and it may be called without `new`.

// The two fields that address a project on the CDN. Exported so the image URL
// builder can take them straight, rather than reaching into the client for its
// private `clientConfig` — which is the coupling that forced a new major of
// @sanity/image-url, and the thing that would break on the next client bump.
// An absent id stays absent rather than becoming a silent default: the client
// refuses a blank one with "Configuration must contain `projectId`", which is
// the error the local-development notes in CLAUDE.md tell you to expect.
export const SANITY_PROJECT = {
	projectId: process.env.NEXT_PUBLIC_SANITY_ID ?? "",
	dataset: "production",
};

const clientApi = SanityClient({
	...SANITY_PROJECT,
	apiVersion: "2022-03-25",
	useCdn: true,
});

export default clientApi;
