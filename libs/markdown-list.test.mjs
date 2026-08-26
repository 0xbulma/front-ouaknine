import assert from 'node:assert/strict';
import test from 'node:test';

import { joinBlocks, linkList, section } from './markdown-list.mjs';

test('a link list renders one bullet per item, notes optional', () => {
  assert.equal(
    linkList([
      { label: 'Contact', url: 'https://h/contact', note: 'adresse et téléphone' },
      { label: 'Legal', url: 'https://h/legal' },
    ]),
    '- [Contact](https://h/contact): adresse et téléphone\n- [Legal](https://h/legal)'
  );
});

test('a link list skips holes rather than rendering them', () => {
  assert.equal(linkList([null, { label: 'A', url: 'u' }, undefined]), '- [A](u)');
  assert.equal(linkList([]), '');
});

test('blocks are separated by one blank line, blanks dropped', () => {
  assert.equal(joinBlocks(['a', '', null, '  ', 'b']), 'a\n\nb');
});

test('a heading with nothing under it is not published', () => {
  // A section that names nothing is worse than no section: an agent parsing the
  // document reads a heading and finds no content behind it.
  assert.equal(section('Pages', '- [A](u)'), '## Pages\n\n- [A](u)');
  assert.equal(section('', '- [A](u)'), '- [A](u)');
  assert.equal(section(undefined, '- [A](u)'), '- [A](u)');
  assert.equal(section('Pages', ''), '');
  assert.equal(section('Pages', undefined), '');
});
