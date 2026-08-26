import assert from 'node:assert/strict';
import { test } from 'node:test';

import { slugify } from './slug.js';
import { splitTitle, seriesOf, isPress } from './publication-fields.js';

// slugify is the single derivation behind every publication URL, every field of
// expertise URL, every hreflang and every @id in the JSON-LD graph. It has
// already broken once on this branch: the combining-diacritic range was written
// as two invisible literal characters instead of the escape, a diff no reviewer
// can see. These pin the behaviour that regression changed.
test('slugify strips accents', () => {
  assert.equal(slugify('Droit pénal des affaires'), 'droit-penal-des-affaires');
  assert.equal(slugify('Cyber-criminalité'), 'cyber-criminalite');
  assert.equal(
    slugify('Guide de survie en garde à vue - Épisode 1 : Connaître ses droits'),
    'guide-de-survie-en-garde-a-vue-episode-1-connaitre-ses-droits'
  );
});

test('slugify tolerates nothing', () => {
  assert.equal(slugify(null), '');
  assert.equal(slugify(undefined), '');
  assert.equal(slugify(''), '');
});

// splitTitle feeds the h1, the title tag, the index grouping, the rail numbering
// and the schema isPartOf. Its four quadrants are (series field) x (title match).
test('splitTitle parses an episode title', () => {
  assert.deepEqual(
    splitTitle({ title: 'Guide de survie – Épisode 2 : Connaître les raisons' }),
    { series: 'Guide de survie', episode: 2, title: 'Connaître les raisons' }
  );
});

test('splitTitle still strips the title when the series field is set', () => {
  assert.deepEqual(
    splitTitle({
      title: 'Guide de survie – Épisode 2 : Connaître les raisons',
      series: 'Guide de survie',
      episode: 2,
    }),
    { series: 'Guide de survie', episode: 2, title: 'Connaître les raisons' }
  );
});

test('splitTitle leaves a standalone title whole', () => {
  const title = 'Sapin II, article 17 - les huit piliers';
  assert.deepEqual(splitTitle({ title }), {
    series: null,
    episode: null,
    title,
  });
});

test('splitTitle never yields an empty heading', () => {
  const title = 'Guide de survie – Épisode 6';
  assert.equal(splitTitle({ title }).title, title);
  assert.equal(splitTitle({}).title, '');
});

test('seriesOf orders by episode, not by publication date', () => {
  const posts = [
    { _id: 'a', title: 'G – Épisode 1 : a', publishedAt: '2027-05-01' },
    { _id: 'b', title: 'G – Épisode 2 : b', publishedAt: '2027-04-01' },
    { _id: 'c', title: 'G – Épisode 3 : c', publishedAt: '2027-03-01' },
  ];

  assert.deepEqual(
    seriesOf(posts, 'G').map(entry => entry.episode),
    [1, 2, 3]
  );
});

// Getting this wrong publishes Alice Ouaknine as the author of Le Monde's copy.
test('a document carrying someone else\'s URL is press whatever filter says', () => {
  assert.equal(isPress({ filter: 'press' }), true);
  assert.equal(isPress({ source: 'https://lemonde.fr/x' }), true);
  assert.equal(isPress({ filter: 'fact' }), false);
  assert.equal(isPress({}), false);
});
