import agentContent from '../content/agentContent.json';
import contactContent from '../content/contactContent.json';
import footerContent from '../content/footerContent.json';
import headerContent from '../content/headerContent.json';
import iskaContent from '../content/iskaContent.json';

import { sitePages } from './site-pages.mjs';
import { resolveLocale } from './site-url.mjs';

// The copy and facts every agent-facing representation needs, assembled once.
// The routes used to build this bag each, so a new key had to be added twice.
// It owns the JSON imports so `libs/site-pages.mjs` stays pure and testable.
export const agentContext = value => {
  const locale = resolveLocale(value);
  const labels = agentContent[locale];

  return {
    locale,
    labels,
    contact: footerContent,
    contactLabels: contactContent[locale],
    pages: sitePages(locale, {
      labels,
      nav: headerContent[locale].nav,
      iskaTitle: iskaContent[locale].title,
      legalLabel: footerContent[locale].link2,
    }),
  };
};
