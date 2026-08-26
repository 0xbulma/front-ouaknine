import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';

import { slugify } from './slug.js';
import { splitTitle, seriesOf, isPress } from './publication-fields.js';
import { internalPath, isSafeExternal } from './href.js';

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

// Link marks and `source` are free text an editor fills. Both decisions used to
// be written twice and drifted; these pin the one that survived.
test('internalPath keeps a same-site link on the site', () => {
  assert.equal(
    internalPath('https://www.ouaknine-avocats.com/articles/abc'),
    '/articles/abc'
  );
  assert.equal(internalPath('/publications/x'), '/publications/x');
  assert.equal(internalPath('#top'), '#top');
  // The bare domain, which is what an editor gets by copying it.
  assert.equal(
    internalPath('https://ouaknine-avocats.com/publications/x'),
    '/publications/x'
  );
});

test('internalPath sends everything else away', () => {
  assert.equal(internalPath('https://evil.com/'), null);
  assert.equal(internalPath('//evil.com'), null);
  assert.equal(internalPath('/\\evil.com'), null);
  assert.equal(internalPath('https://www.ouaknine-avocats.com@evil.com'), null);
  assert.equal(internalPath('https://notouaknine-avocats.com/x'), null);
  assert.equal(internalPath('javascript:alert(1)'), null);
  // A real subdomain is somewhere else. internalPath returns a bare path, so
  // calling it internal would silently land the reader on the apex.
  assert.equal(internalPath('https://blog.ouaknine-avocats.com/x'), null);
});

test('internalPath never returns a protocol-relative path', () => {
  // `new URL` resolves `..` before pathname is read, so these arrive as
  // "//evil.com" unless the leading slashes are collapsed.
  for (const href of ['/..//evil.com', '/.//evil.com', '/a/../..//evil.com']) {
    const path = internalPath(href);
    assert.ok(path === null || !path.startsWith('//'), `${href} -> ${path}`);
  }
});

test('isSafeExternal refuses anything it does not recognise', () => {
  assert.equal(isSafeExternal('https://lemonde.fr/x'), true);
  assert.equal(isSafeExternal('mailto:a@b.c'), true);
  assert.equal(isSafeExternal('javascript:alert(1)'), false);
  assert.equal(isSafeExternal('  JAVASCRIPT:alert(1)'), false);
  assert.equal(isSafeExternal('data:text/html,x'), false);
  assert.equal(isSafeExternal(null), false);
  assert.equal(isSafeExternal(undefined), false);
});

// libs/site.js owns the origin behind every canonical, hreflang, sitemap loc and
// @id, and it reads the environment at module scope — so this runs in a
// subprocess with the variable set. Both cases below used to pass the guard: one
// throws, the other parses to an opaque origin and is the silent half.
test('a bad NEXT_PUBLIC_HOST falls back instead of poisoning every URL', () => {
  const probe = `
    import { SITE_URL, SITE_HOSTS } from './libs/site.js';
    import { internalPath } from './libs/href.js';
    process.stdout.write(JSON.stringify({
      SITE_URL,
      SITE_HOSTS,
      js: internalPath('javascript:alert(1)'),
    }));
  `;

  for (const bad of ['', 'ouaknine-avocats.com', 'mailto:a@b.c', 'javascript:1']) {
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      env: { ...process.env, NEXT_PUBLIC_HOST: bad },
      encoding: 'utf8',
    });

    const { SITE_URL, SITE_HOSTS, js } = JSON.parse(out);
    assert.equal(SITE_URL, 'https://www.ouaknine-avocats.com', `SITE_URL for ${bad}`);
    assert.deepEqual(SITE_HOSTS, ['ouaknine-avocats.com', 'www.ouaknine-avocats.com']);
    assert.equal(js, null, `javascript: href must never be internal (${bad})`);
  }
});

test('SITE_HOSTS is the same pair whichever spelling the env var uses', () => {
  const probe = `
    import { SITE_HOSTS } from './libs/site.js';
    process.stdout.write(JSON.stringify(SITE_HOSTS));
  `;

  const pairs = ['https://ouaknine-avocats.com', 'https://www.ouaknine-avocats.com'].map(host =>
    execFileSync(process.execPath, ['--input-type=module', '-e', probe], {
      env: { ...process.env, NEXT_PUBLIC_HOST: host },
      encoding: 'utf8',
    })
  );

  assert.equal(pairs[0], pairs[1]);
});
