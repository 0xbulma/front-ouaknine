import assert from 'node:assert/strict';
import test from 'node:test';

import { normaliseFields } from './expertise-list.mjs';

test('the slug comes from the title, not from another field', () => {
  // Derived from the wrong field, every field URL collapses onto `/expertise/`
  // — in the sitemap, in llms.txt, in the markdown and in getStaticPaths.
  const [field] = normaliseFields([
    { title: 'Droit pénal général', titleseo: 'Autre chose' },
  ]);

  assert.equal(field.slug, 'droit-penal-general');
});

test('a dangling studio reference is dropped, not carried', () => {
  // A dereference yields null for a target that has been deleted or is only a
  // draft; handed on, it throws in every consumer.
  const fields = normaliseFields([
    { title: 'Droit pénal général' },
    null,
    { title: 'Enquêtes internes' },
    undefined,
  ]);

  assert.equal(fields.length, 2);
  assert.deepEqual(fields.map(f => f.slug), ['droit-penal-general', 'enquetes-internes']);
});

test('the rest of the field is preserved', () => {
  const [field] = normaliseFields([
    { title: 'Droit de la presse', description: [{ _type: 'block' }], titleSpe: 'Compétences' },
  ]);

  assert.equal(field.titleSpe, 'Compétences');
  assert.deepEqual(field.description, [{ _type: 'block' }]);
});

test('a missing list is an empty one', () => {
  assert.deepEqual(normaliseFields(undefined), []);
  assert.deepEqual(normaliseFields(null), []);
  assert.deepEqual(normaliseFields([]), []);
});
