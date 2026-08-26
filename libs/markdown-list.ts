import type { LinkItem } from './types';

// How this site spells a markdown link list, a section and a block break.
// Shared by the page representations and llms.txt, which publish the same
// shapes, so a change to either lands on both.

export const linkList = (items: (LinkItem | null | undefined)[]): string =>
  items
    .filter((item): item is LinkItem => Boolean(item))
    .map(({ label, url, note }) => `- [${label}](${url})${note ? `: ${note}` : ''}`)
    .join('\n');

export const joinBlocks = (parts: (string | null | undefined)[]): string =>
  parts.filter(part => part && part.trim()).join('\n\n');

// A heading with nothing after it is worse than no heading: an agent parsing
// the document sees a section that names nothing.
export const section = (
  title: string | null | undefined,
  body: string | null | undefined
): string => (title && body ? joinBlocks([`## ${title}`, body]) : body || '');
