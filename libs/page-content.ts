import clientApi from './clientApi';
import type { ContactDocument, HomeDocument, LegalDocument } from './types';

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
const fetchDocument = <T>(query: string, locale: string | undefined): Promise<T | null> =>
  clientApi.fetch<T | null>(query, { locale: locale ?? 'fr' });

export const fetchHome = (locale?: string) =>
  fetchDocument<HomeDocument>(HOME_QUERY, locale);

export const fetchContact = (locale?: string) =>
  fetchDocument<ContactDocument>(CONTACT_QUERY, locale);

export const fetchLegal = (locale?: string) =>
  fetchDocument<LegalDocument>(LEGAL_QUERY, locale);
