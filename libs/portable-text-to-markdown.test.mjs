import assert from 'node:assert/strict';
import test from 'node:test';

import { toMarkdown } from './portable-text-to-markdown.mjs';

const block = (text, extra = {}) => ({
  _type: 'block',
  _key: text.slice(0, 6) || 'empty',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: 's', text, marks: [] }],
  ...extra,
});

test('paragraphs are separated by a blank line', () => {
  assert.equal(toMarkdown([block('One'), block('Two')]), 'One\n\nTwo');
});

test('whitespace-only spacer blocks are dropped', () => {
  // The behaviour `isSpacer` adds over the empty-text check: Sanity produces a
  // space-only paragraph whenever an editor leaves one in a spacer, and it
  // would otherwise emit a stray indented line.
  assert.equal(
    toMarkdown([block('One'), block('   '), block('Two')]),
    'One\n\nTwo'
  );
});

test('empty spacer blocks are dropped', () => {
  // The CMS stores an empty paragraph between every paragraph of the bio.
  assert.equal(toMarkdown([block('One'), block(''), block('Two')]), 'One\n\nTwo');
});

test('headings and blockquotes carry their markdown prefix', () => {
  assert.equal(toMarkdown([block('Title', { style: 'h2' })]), '## Title');
  assert.equal(toMarkdown([block('Quote', { style: 'blockquote' })]), '> Quote');
});

test('consecutive list items become one list', () => {
  const value = [
    block('Intro'),
    block('First', { listItem: 'bullet', level: 1 }),
    block('Second', { listItem: 'bullet', level: 1 }),
    block('Outro'),
  ];
  assert.equal(toMarkdown(value), 'Intro\n\n- First\n- Second\n\nOutro');
});

test('numbered lists are numbered and levels are indented', () => {
  const value = [
    block('One', { listItem: 'number', level: 1 }),
    block('Two', { listItem: 'number', level: 1 }),
    block('Nested', { listItem: 'bullet', level: 2 }),
  ];
  assert.equal(toMarkdown(value), '1. One\n2. Two\n  - Nested');
});

test('decorator marks and links', () => {
  const value = [
    {
      _type: 'block',
      _key: 'b',
      style: 'normal',
      markDefs: [{ _key: 'l1', _type: 'link', href: 'https://example.com' }],
      children: [
        { _type: 'span', _key: 's1', text: 'plain ', marks: [] },
        { _type: 'span', _key: 's2', text: 'bold', marks: ['strong'] },
        { _type: 'span', _key: 's3', text: ' and ', marks: [] },
        { _type: 'span', _key: 's4', text: 'italic', marks: ['em'] },
        { _type: 'span', _key: 's5', text: ' and ', marks: [] },
        { _type: 'span', _key: 's6', text: 'a link', marks: ['l1'] },
      ],
    },
  ];
  assert.equal(
    toMarkdown(value),
    'plain **bold** and _italic_ and [a link](https://example.com)'
  );
});

test('an unknown mark leaves the text alone', () => {
  const value = [block('kept', {
    children: [{ _type: 'span', _key: 's', text: 'kept', marks: ['underline'] }],
  })];
  assert.equal(toMarkdown(value), 'kept');
});

test('missing and empty input', () => {
  assert.equal(toMarkdown(undefined), '');
  assert.equal(toMarkdown([]), '');
  assert.equal(toMarkdown([block('')]), '');
});

test('a non-block between list items closes the list first', () => {
  // Without the flush the image is pushed before the open list, so the two
  // items merge and the image jumps ahead of them.
  assert.equal(
    toMarkdown([
      { ...block('A'), listItem: 'bullet' },
      { _type: 'image', _key: 'i', alt: 'Portrait' },
      { ...block('B'), listItem: 'bullet' },
    ]),
    '- A\n\nPortrait\n\n- B'
  );
});

test('images render as their alt text only', () => {
  // Not `![alt]()`: this module is pure and the projections return a raw asset
  // reference, so there is no URL to put in the parentheses, and an empty one
  // is a broken reference to whatever reads the document.
  assert.equal(toMarkdown([{ _type: 'image', _key: 'i', alt: 'A portrait' }]), 'A portrait');
  assert.equal(toMarkdown([{ _type: 'image', _key: 'i', caption: 'Une légende' }]), 'Une légende');
  assert.equal(toMarkdown([{ _type: 'image', _key: 'i' }]), '');
  assert.equal(toMarkdown([{ _type: 'image', _key: 'i' }]).includes('!['), false);
});
