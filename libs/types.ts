// The vocabulary the CMS documents, the content files and the agent surface
// share. Nothing here is fetched or rendered: it is the shape everything else
// agrees on, in one place, so the markdown representation of a page and its
// HTML cannot describe the same document differently.
//
// Where a type is looser than the data really is — an optional label the JSON
// always carries — that is deliberate. The content files are not parsed at a
// boundary, they are imported; the guarantee that every key is filled lives in
// libs/site-pages.test.ts, which reads the real files.

export type Locale = "fr" | "en";

// --- Portable Text -----------------------------------------------------------

export type PortableMarkDef = {
	_key: string;
	_type: string;
	href?: string;
};

export type PortableSpan = {
	_type: string;
	_key?: string;
	text?: string;
	marks?: string[];
};

export type SanityImageRef = {
	_ref: string;
	_type: string;
};

// One bag rather than a union of block/image/unknown: both renderers sniff
// `_type` and then read whichever fields that type carries, so a union would
// only move the narrowing into every branch of a switch neither of them has.
export type PortableNode = {
	_type: string;
	_key?: string;
	style?: string;
	listItem?: string;
	level?: number;
	markDefs?: PortableMarkDef[];
	children?: PortableSpan[];
	alt?: string;
	caption?: string;
	asset?: SanityImageRef;
};

export type PortableText = PortableNode[];

// --- CMS documents -----------------------------------------------------------

export type SeoFields = {
	titleseo?: string;
	descriptionseo?: string;
};

export type HomeDocument = SeoFields & {
	title1?: string;
	title2?: string;
	tag1?: string;
	link1?: string;
	tag2?: string;
	link2?: string;
	tag3?: string;
	link3?: string;
	sectionTitle?: string;
	body?: PortableText;
};

export type ContactDocument = SeoFields & {
	title?: string;
};

export type LegalDocument = SeoFields & {
	title?: string;
	block?: PortableText;
};

export type ExpertiseFieldDocument = {
	_id?: string;
	title?: string;
	// Dereferenced whole (`expertiseList[]->`), so the item carries its own SEO
	// fields. Named here only so nothing derives a URL from one of them.
	titleseo?: string;
	descriptionseo?: string;
	description?: PortableText;
	titleSpe?: string;
	right?: PortableText;
};

// The studio carries no slug on a field, so every consumer reads the one
// `normaliseFields` derives from the title.
export type ExpertiseField = ExpertiseFieldDocument & { slug: string };

export type ExpertiseDocumentRaw = SeoFields & {
	title?: string;
	expertiseList?: (ExpertiseFieldDocument | null | undefined)[] | null;
};

export type ExpertiseDocument = SeoFields & {
	title?: string;
	expertiseList: ExpertiseField[];
};

export type PublicationsDocument = SeoFields & {
	title?: string;
};

// --- Publications ------------------------------------------------------------

// What `splitTitle` and `seriesOf` need, and no more: the guide fixtures in the
// tests are documents with three fields, not whole publications.
export type TitledPost = {
	title?: string;
	series?: string | null;
	episode?: number | null;
};

export type PressPost = {
	filter?: string | null;
	source?: string | null;
};

export type TitleParts = {
	series: string | null;
	episode: number | null;
	title: string;
};

export type SeriesEntry<T> = TitleParts & { post: T };

// The body-free projection: what a list needs, which is most of what the
// section does.
export type PublicationMeta = TitledPost &
	PressPost & {
		_id: string;
		slug: string;
		author?: string | null;
		publishedAt?: string | null;
		field?: string | null;
		hasBody?: boolean;
		readingTime?: number | null;
	};

// The same document before `withSlug` has derived its slug.
export type PublicationDocument = Omit<PublicationMeta, "slug"> & {
	slug?: string | null;
};

export type Publication = PublicationMeta & {
	body?: PortableText | null;
};

// What the episode rail and the pager render. Whole documents would serialise
// every episode of the guide into the page's __NEXT_DATA__.
export type SeriesLink = {
	post: { _id: string; slug: string };
	episode: number | null;
	title: string;
};

export type PublicationGroup = {
	series: string;
	episodes: PublicationMeta[];
};

export type PublicationGroups = {
	guides: PublicationGroup[];
	articles: PublicationMeta[];
	press: PublicationMeta[];
};

// --- Links, pages, agent copy ------------------------------------------------

export type NavLink = {
	label: string;
	url: string;
};

export type LinkItem = {
	label?: string;
	url: string;
	note?: string;
};

export type SitePage = LinkItem & { path: string };

// Only the labels `sitePages` itself reads. Each is a fallback for a nav entry
// or a note, and any of them may be missing from a fixture.
export type SitePagesLabels = Partial<
	Record<
		| "footerLead"
		| "homeNote"
		| "aboutLabel"
		| "aboutNote"
		| "expertiseLabel"
		| "expertiseNote"
		| "publicationsLabel"
		| "publicationsNote"
		| "contactLabel"
		| "contactNote"
		| "iskaNote"
		| "legalNote",
		string
	>
>;

export type SitePagesCopy = {
	labels: SitePagesLabels;
	nav: NavLink[];
	iskaTitle: string;
	legalLabel: string;
};

// content/footerContent.json: the dial-safe number at the top level, the
// displayed one inside each language's address block.
export type ContactLines = {
	address?: string;
	email?: string;
	mobile?: string;
};

export type ContactStore = { [K in Locale]: ContactLines } & {
	phone?: string;
};

export type ContactLabels = {
	addressLabel: string;
	phoneLabel: string;
	mobileLabel: string;
	emailLabel: string;
};

// --- The agent surface -------------------------------------------------------

export type MarkdownLabels = {
	pages: string;
	footerLead: string;
	notFoundTitle?: string;
	notFoundBody?: string;
	unavailableTitle?: string;
	unavailableBody?: string;
	publicationsArticles?: string;
	publicationsPress?: string;
};

export type LlmsLabels = {
	footerLead: string;
	summary: string;
	guidance: string[];
	whenToUse: string;
	whenToUseLead: string;
	pages: string;
	sitemapNote: string;
	englishNote: string;
	otherLocaleLabel: string;
};

// What every markdown renderer is handed. The first five are the same for the
// whole request; the rest are what one particular document needs.
export type MarkdownContext = {
	locale: Locale;
	labels: MarkdownLabels;
	contact: ContactStore;
	contactLabels: ContactLabels;
	pages: SitePage[];
	lead?: string;
	body?: PortableText | null;
	series?: PublicationMeta[];
	groups?: PublicationGroups;
};

export type IskaContent = {
	title: string;
	tagline: string;
	networkTitle: string;
	network: string[];
	bringTitle: string;
	bring: string[];
	skillsTitle: string;
	skills: string[];
};

// --- UI copy -----------------------------------------------------------------

// Derived from the content files rather than restated, so a key renamed in the
// JSON is a type error at the component that reads it. `typeof import(...)` is
// a type position, so nothing is loaded at runtime.
export type IskaCopy = typeof import("../content/headerContent.json")["fr"]["iska"];

export type PublicationsCopy = typeof import("../content/publicationsContent.json")["fr"];

// --- Page props --------------------------------------------------------------

export type PageSeo = {
	title?: string;
	description?: string;
	alternates?: Partial<Record<Locale, string>> | null;
};
