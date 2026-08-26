import { useRouter } from 'next/router';

import { resolveLocale } from '../libs/site-url';
import type { Locale } from '../libs/types';

// The language the page on screen is being read in. `router.locale` is optional
// in Next's types — i18n can be off — so it goes through the same guard the
// agent routes use rather than being indexed into the content files raw.
function useLocale(): Locale {
  const router = useRouter();
  return resolveLocale(router.locale);
}

export default useLocale;
