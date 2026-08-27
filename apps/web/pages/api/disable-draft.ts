import type { NextApiRequest, NextApiResponse } from "next";

// The way back out of draft mode. Clearing the cookie needs no secret: the worst
// an unauthenticated call can do is put a reader back on the published site,
// which is where they already were.
export default function disableDraft(_req: NextApiRequest, res: NextApiResponse) {
	res.setDraftMode({ enable: false });
	res.writeHead(307, { Location: "/" });
	res.end();
}
