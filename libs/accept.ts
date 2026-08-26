// Content negotiation for text/markdown, per acceptmarkdown.com and RFC 9110
// §12.5.1. Pure: no request object, no framework, so the suite can run it.

export type MediaType = 'text/html' | 'text/markdown';

const PRODUCES = ['text/html', 'text/markdown'] as const;

// Anything with a file extension is a real file (an image, the manifest, a
// favicon) and is not a representation of a page. `.md` is the exception: it is
// the explicit markdown sibling of a page.
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

export const isMarkdownPath = (pathname: string): boolean => pathname.endsWith('.md');

export const isNegotiablePath = (pathname: string): boolean =>
  !FILE_EXTENSION.test(pathname) || isMarkdownPath(pathname);

type AcceptEntry = { type: string; q: number; specificity: number };

const parseEntry = (raw: string): AcceptEntry => {
  const parts = raw.trim().split(';').map(s => s.trim());
  const type = (parts[0] ?? '').toLowerCase();

  let q = 1;
  for (const param of parts.slice(1)) {
    const [name, value] = param.split('=').map(s => s.trim());
    if (name?.toLowerCase() !== 'q') continue;
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
  }

  // A fully specified type outranks `text/*`, which outranks `*/*`.
  const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;

  return { type, q, specificity };
};

// Client order is preserved: it breaks ties that q and specificity do not.
const parseAccept = (header: string): AcceptEntry[] => header.split(',').map(parseEntry);

const matches = (entry: AcceptEntry, candidate: MediaType): boolean => {
  if (entry.type === '*/*') return true;
  if (entry.type.endsWith('/*')) {
    return candidate.startsWith(entry.type.slice(0, -1));
  }
  return entry.type === candidate;
};

// The representation to serve, or null when the client accepts none of them —
// the only case that warrants a 406. A missing header means "no constraint",
// which is not the same as "nothing works".
export const preferredType = (header: string | null | undefined): MediaType | null => {
  if (!header) return PRODUCES[0];

  const entries = parseAccept(header);

  // A header made only of exclusions ("text/markdown;q=0") states no positive
  // preference, so an unlisted representation is still fair game. A header with
  // a positive entry ("application/pdf") does constrain, and an unlisted
  // representation is then unacceptable.
  const constrains = entries.some(entry => entry.q > 0);

  let best: MediaType | null = null;
  let bestQ = -1;
  let bestPosition = Infinity;
  let fallback: MediaType | null = null;

  for (const candidate of PRODUCES) {
    // The most specific matching range wins regardless of q, so
    // `text/html;q=0, */*` rejects HTML rather than letting the wildcard
    // override the explicit refusal.
    let matched: AcceptEntry | null = null;
    let matchedPosition = Infinity;

    for (const [index, entry] of entries.entries()) {
      if (!matches(entry, candidate)) continue;
      const moreSpecific =
        matched === null ||
        entry.specificity > matched.specificity ||
        (entry.specificity === matched.specificity && index < matchedPosition);
      if (!moreSpecific) continue;
      matched = entry;
      matchedPosition = index;
    }

    if (matched === null) {
      if (!constrains && fallback === null) fallback = candidate;
      continue;
    }
    if (matched.q <= 0) continue;

    if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
      bestQ = matched.q;
      bestPosition = matchedPosition;
      best = candidate;
    }
  }

  return best ?? fallback;
};

// Without this a CDN happily hands the cached HTML to an agent asking for
// markdown, whichever variant landed in the cache first.
export const varyWithAccept = (existing: string | null | undefined): string => {
  if (!existing) return 'Accept, Accept-Encoding';
  const tokens = existing.split(',').map(s => s.trim().toLowerCase());
  return tokens.includes('accept') ? existing : `${existing}, Accept`;
};
