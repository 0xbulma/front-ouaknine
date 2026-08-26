// Does this request carry a query the route did not ask for?
//
// The CDN keys on the whole URL, so an unexpected parameter mints a fresh cache
// key and a fresh upstream query on every request. A *repeated* parameter
// arrives as an array, which a check on key names alone would let through while
// it still varies the key.
export const unexpectedQuery = (
  query: Partial<Record<string, string | string[]>> | null | undefined,
  allowedKeys: readonly string[]
): boolean =>
  Object.entries(query ?? {}).some(
    ([key, value]) => !allowedKeys.includes(key) || Array.isArray(value)
  );

// A generated representation is a document, so only GET and HEAD reach it. No
// CDN serves a non-GET from cache, so a POST loop would otherwise bypass
// `s-maxage` entirely and reach the CMS on every request.
export const methodNotAllowed = (method: string | undefined): boolean =>
  method !== 'GET' && method !== 'HEAD';
