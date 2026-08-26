import { joinBlocks, linkList, section } from './markdown-list';

test('a link list renders one bullet per item, notes optional', () => {
  expect(
    linkList([
      { label: 'Contact', url: 'https://h/contact', note: 'adresse et téléphone' },
      { label: 'Legal', url: 'https://h/legal' },
    ])
  ).toBe('- [Contact](https://h/contact): adresse et téléphone\n- [Legal](https://h/legal)');
});

test('a link list skips holes rather than rendering them', () => {
  expect(linkList([null, { label: 'A', url: 'u' }, undefined])).toBe('- [A](u)');
  expect(linkList([])).toBe('');
});

test('blocks are separated by one blank line, blanks dropped', () => {
  expect(joinBlocks(['a', '', null, '  ', 'b'])).toBe('a\n\nb');
});

test('a heading with nothing under it is not published', () => {
  // A section that names nothing is worse than no section: an agent parsing the
  // document reads a heading and finds no content behind it.
  expect(section('Pages', '- [A](u)')).toBe('## Pages\n\n- [A](u)');
  expect(section('', '- [A](u)')).toBe('- [A](u)');
  expect(section(undefined, '- [A](u)')).toBe('- [A](u)');
  expect(section('Pages', '')).toBe('');
  expect(section('Pages', undefined)).toBe('');
});
