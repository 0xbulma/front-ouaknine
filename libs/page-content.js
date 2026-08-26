import clientApi from './clientApi';

// One place for the page documents, so `getStaticProps` and the markdown
// representation of a page always read the same fields. Locale goes through a
// query parameter rather than string interpolation, as in libs/expertise.js.

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

const fetchDocument = (query, locale) =>
  clientApi.fetch(query, { locale: locale ?? 'fr' });

export const fetchHome = locale => fetchDocument(HOME_QUERY, locale);
export const fetchContact = locale => fetchDocument(CONTACT_QUERY, locale);
export const fetchLegal = locale => fetchDocument(LEGAL_QUERY, locale);
