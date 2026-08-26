import agentContent from '../content/agentContent.json';
import contactContent from '../content/contactContent.json';
import footerContent from '../content/footerContent.json';
import headerContent from '../content/headerContent.json';
import iskaContent from '../content/iskaContent.json';

import { sitePages } from './site-pages';
import { resolveLocale } from './site-url';
import type {
  ContactLabels,
  ContactStore,
  LlmsLabels,
  Locale,
  MarkdownLabels,
  SitePage,
} from './types';

// Everything both agent-facing routes read off the copy file, in the one shape
// they share. `whenToUseNote` belongs to neither renderer — it is the fallback
// llms.txt uses when a field of expertise has no usable description.
export type AgentLabels = MarkdownLabels & LlmsLabels & { whenToUseNote: string };

export type AgentContext = {
  locale: Locale;
  labels: AgentLabels;
  contact: ContactStore;
  contactLabels: ContactLabels;
  pages: SitePage[];
};

// The copy and facts every agent-facing representation needs, assembled once.
// The routes used to build this bag each, so a new key had to be added twice.
export const agentContext = (value: unknown): AgentContext => {
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
