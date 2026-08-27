// Where pages/api/draft.ts sends the browser once the preview secret checks out.
//
// The destination arrives as `sanity-preview-pathname` on the URL the Studio
// built, which makes it caller-controlled: the route hands it straight to a
// `Location` header, and a `Location` that leaves this origin is an open
// redirect on a law practice's domain. Pure and separate from the route for the
// same reason libs/proxy-route.ts is separate from proxy.ts, which is that the
// decision is the part worth testing and the route cannot be imported.
//
// Only a path on this site survives. Everything else falls back to the home
// page, which is where Presentation opens by default anyway.
export const draftRedirect = (target: string | undefined): string => {
	if (!target?.startsWith("/")) return "/";

	// `//host` and `/\host` are both protocol-relative to a browser, and a
	// backslash is normalised to a slash before the URL is resolved.
	if (/^[/\\]/.test(target.slice(1))) return "/";

	return target;
};
