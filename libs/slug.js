// Sanity carries no slug on several document types, so URLs are derived from
// the title. Shared so the derivation is identical everywhere: two slugifiers
// that disagree by one character produce a 404 nobody can find.
export const slugify = value =>
  (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
