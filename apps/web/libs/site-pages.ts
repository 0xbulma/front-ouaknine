import { pageUrl } from "./site-url";
import type { SitePage, SitePagesCopy } from "./types";

// The site's public pages, in the order an agent should meet them. One
// definition, published by llms.txt and by the `## Pages` section of every
// page's markdown.
//
// Pure — the caller passes the copy in, so the list stays testable without the
// content JSON.
export const sitePages = (
	locale: string,
	{ labels, nav, iskaTitle, legalLabel }: SitePagesCopy,
): SitePage[] => {
	// By URL, not by position: reordering content/headerContent.json would
	// otherwise relabel every page here, and a shorter nav would throw.
	const navLabel = (path: string, fallback: string | undefined) =>
		nav.find((link) => link.url === path)?.label ?? fallback;

	return [
		{ label: navLabel("/", labels.footerLead), path: "/", note: labels.homeNote },
		{ label: labels.aboutLabel, path: "/about", note: labels.aboutNote },
		{
			label: navLabel("/expertise", labels.expertiseLabel),
			path: "/expertise",
			note: labels.expertiseNote,
		},
		{
			label: navLabel("/publications", labels.publicationsLabel),
			path: "/publications",
			note: labels.publicationsNote,
		},
		{
			label: navLabel("/contact", labels.contactLabel),
			path: "/contact",
			note: labels.contactNote,
		},
		{ label: iskaTitle, path: "/iska", note: labels.iskaNote },
		{ label: legalLabel, path: "/legal", note: labels.legalNote },
	].map((page) => ({ ...page, url: pageUrl(locale, page.path) }));
};
