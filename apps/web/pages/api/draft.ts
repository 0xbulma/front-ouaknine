import { validatePreviewUrl } from "@sanity/preview-url-secret";
import type { NextApiRequest, NextApiResponse } from "next";
import { previewClient } from "../../libs/clientApi";
import { draftRedirect } from "../../libs/draft-redirect";

// The door Presentation opens to put this site in its iframe. The Studio mints a
// one-time secret in the dataset, appends it to this URL, and `validatePreviewUrl`
// reads it back and burns it; without that handshake anyone could set the cookie
// and read the practice's unpublished copy.
//
// The exit is pages/api/disable-draft.ts. Nothing on the public site links to
// either, because Presentation drives both.

export default async function enableDraft(req: NextApiRequest, res: NextApiResponse) {
	if (!req.url) {
		res.status(400).send("Missing URL");
		return;
	}

	// Every way this can fail (no secret, a stale one, a token the dataset no
	// longer recognises) means the same thing to the caller, and an uncaught
	// throw here answers a public endpoint with a stack trace. The reason is
	// worth exactly one server-side line.
	let redirectTo: string | undefined;
	try {
		const validated = await validatePreviewUrl(previewClient(), req.url);
		if (!validated.isValid) throw new Error("secret did not match");
		redirectTo = validated.redirectTo;
	} catch (err) {
		console.error("draft mode refused", err);
		res.status(401).send("Invalid secret");
		return;
	}

	// Next stops serving this browser from the ISR cache while the cookie is set,
	// and renders every page on demand instead. `getStaticProps` sees it as
	// `draftMode`, which is what libs/static-page-props.ts reads.
	res.setDraftMode({ enable: true });
	res.writeHead(307, { Location: draftRedirect(redirectTo) });
	res.end();
}
