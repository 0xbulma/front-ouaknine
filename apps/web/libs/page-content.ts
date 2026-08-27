import { getClient } from "./clientApi";
import type { ContactDocument, HomeDocument, LegalDocument } from "./types";

// One place for the page documents, so `getStaticProps` and the markdown
// representation of a page always read the same fields. Locale goes through a
// query parameter rather than string interpolation, as in libs/expertise.ts.

const HOME_QUERY = `*[_type == "home" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title1,
  title2,
  tag1,
  "link1": link1->title,
  tag2,
  "link2": link2->title,
  tag3,
  "link3": link3->title,
  sectionTitle,
  body
}`;

const CONTACT_QUERY = `*[_type == "contact" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title
}`;

const LEGAL_QUERY = `*[_type == "legal" && language == $locale][0]{
  titleseo,
  descriptionseo,
  title,
  block
}`;

// Every one of these projects `[0]`, so a reachable Sanity with nothing
// published resolves to null rather than rejecting.
//
// `draft` is the flag libs/static-page-props.ts reads off Next's draft mode. It
// picks the client, and nothing else changes: same query, same locale, same
// shape back. What differs is that the answer may be unpublished and that every
// string in it carries a stega-encoded edit link.
const fetchDocument = <T>(
	query: string,
	locale: string | undefined,
	draft?: boolean,
): Promise<T | null> => getClient(draft).fetch<T | null>(query, { locale: locale ?? "fr" });

export const fetchHome = (locale?: string, draft?: boolean) =>
	fetchDocument<HomeDocument>(HOME_QUERY, locale, draft);

export const fetchContact = (locale?: string, draft?: boolean) =>
	fetchDocument<ContactDocument>(CONTACT_QUERY, locale, draft);

export const fetchLegal = (locale?: string, draft?: boolean) =>
	fetchDocument<LegalDocument>(LEGAL_QUERY, locale, draft);
