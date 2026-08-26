import assert from 'node:assert/strict';
import test from 'node:test';

import { leadSentence, llmsTxt } from './llms-txt.mjs';
import { HOST } from './site-url.mjs';

// Mirrors content/footerContent.json: the dial-safe number lives at the top
// level, the displayed one inside the address block.
const CONTACT = {
  phone: '+33184162035',
  fr: {
    address: '17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35',
    email: 'cabinet@ouaknine-avocats.com',
  },
  en: {
    address: '17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35',
    email: 'cabinet@ouaknine-avocats.com',
  },
};

const EN_LABELS = {
  footerLead: 'Ouaknine Law Firm',
  summary: 'Criminal defence law firm in Paris.',
  guidance: ['Reach the firm on {phone} or at {email}.'],
  whenToUse: 'When to use this firm',
  whenToUseLead: 'The situations this firm is the right contact for.',
  whenToUseNote: 'when the matter falls in this area.',
  pages: 'Pages',
  sitemapNote: 'every URL on the site',
  englishNote: 'the same tree in French',
  otherLocaleLabel: 'Français',
};

const build = (overrides = {}) =>
  llmsTxt({
    locale: 'fr',
    labels: {
      footerLead: 'Cabinet Ouaknine',
      summary: 'Cabinet d’avocat dédié à la défense pénale.',
      guidance: ['Première consigne.', 'Joignable au {phone}, à {email}.'],
      whenToUse: 'Quand solliciter ce cabinet',
      whenToUseLead: 'Les situations pour lesquelles le cabinet est le bon interlocuteur.',
      whenToUseNote: 'lorsque la question relève de ce domaine.',
      pages: 'Pages',
      sitemapNote: 'toutes les URL du site',
      englishNote: 'la même arborescence en anglais',
      otherLocaleLabel: 'English',
    },
    contact: CONTACT,
    pages: [{ label: 'Contact', url: `${HOST}/contact`, note: 'coordonnées' }],
    fields: [
      { label: 'Droit pénal général', url: `${HOST}/expertise/droit-penal-general`, note: 'la défense pénale de droit commun' },
    ],
    otherLocale: 'en',
    ...overrides,
  });

test('the file follows the llmstxt.org order: H1, blockquote, prose, H2 lists', () => {
  const lines = build().split('\n');

  assert.equal(lines[0], '# Cabinet Ouaknine');
  assert.equal(lines[1], '');
  assert.equal(lines[2], '> Cabinet d’avocat dédié à la défense pénale.');

  const headings = lines.filter(line => line.startsWith('## '));
  assert.deepEqual(headings, [
    '## Quand solliciter ce cabinet',
    '## Pages',
    '## Optional',
  ]);
});

test('the when-to-use section names the fields and links each one', () => {
  const markdown = build();
  assert.ok(markdown.includes('Les situations pour lesquelles le cabinet est le bon interlocuteur.'));
  assert.ok(
    markdown.includes(
      `- [Droit pénal général](${HOST}/expertise/droit-penal-general): la défense pénale de droit commun`
    )
  );
});

test('every bullet under an H2 is a markdown link', () => {
  const bullets = build()
    .split('\n')
    .filter(line => line.startsWith('- '));

  assert.ok(bullets.length >= 3);
  for (const bullet of bullets) {
    assert.match(bullet, /^- \[[^\]]+\]\(https:\/\/[^)]+\)/, bullet);
  }
});

test('the contact facts and both well-known files are listed', () => {
  const markdown = build();
  assert.ok(markdown.includes('17 rue de Douai, 75009 Paris, France. +33 (0)1 84 16 20 35. cabinet@ouaknine-avocats.com'));
  assert.ok(markdown.includes(`- [sitemap.xml](${HOST}/sitemap.xml)`));
  assert.ok(markdown.includes(`- [English](${HOST}/en)`));
  assert.ok(markdown.endsWith('\n'));
});

test('a CMS outage drops the fields section rather than emitting an empty heading', () => {
  // The heading and its lead go together. Publishing "the situations this firm
  // is the right contact for" with no list under it is the empty section the
  // shared `section()` helper exists to prevent, and it reads as a broken file
  // rather than as a degraded one.
  const markdown = build({ fields: [] });

  assert.equal(markdown.includes('## Quand solliciter ce cabinet'), false);
  assert.equal(markdown.includes('Les situations pour lesquelles'), false);
  // The rest of the file still ships.
  assert.ok(markdown.includes('## Pages'));
  assert.ok(markdown.includes('## Optional'));
});

test('a field note stops at the end of a sentence, not mid-clause', () => {
  const description =
    'Le cabinet conseille, assiste et représente ses clients exposés à des ' +
    'problématiques relevant du droit pénal dit de droit commun. Dans ce cadre, ' +
    'il assure la défense des particuliers et des entreprises.';

  assert.equal(
    leadSentence(description),
    'Le cabinet conseille, assiste et représente ses clients exposés à des problématiques relevant du droit pénal dit de droit commun.'
  );
});

test('leadSentence drops an ellipsis left by an upstream cut', () => {
  assert.equal(leadSentence('Une phrase entière. Une autre…'), 'Une phrase entière.');
  assert.equal(leadSentence('Sans ponctuation finale…'), 'Sans ponctuation finale');
});

test('leadSentence falls back to a word cut for one very long sentence', () => {
  // The fixture must not be word-aligned on the limit, or a raw slice would
  // pass this too and a description could publish a chopped word.
  const long = `${'a'.repeat(120)} ${'b'.repeat(200)}.`;
  const cut = leadSentence(long);

  assert.ok(cut.endsWith('…'));
  assert.ok(cut.length <= 262, cut.length);
  // Cut on the word boundary, so the long second word is dropped whole rather
  // than sliced mid-way.
  assert.equal(cut, `${'a'.repeat(120)}…`);
});

test('leadSentence on missing or empty input', () => {
  assert.equal(leadSentence(undefined), '');
  assert.equal(leadSentence('   '), '');
});

test('every URL in the file is published under one host', () => {
  // The sitemap link and the other-language link once came from two different
  // sources, so a configured host applied to one of them and not the other.
  const urls = build().match(/\((https?:\/\/[^)]+)\)/g) ?? [];

  assert.ok(urls.length >= 3, `expected several links, got ${urls.length}`);
  for (const url of urls) {
    assert.ok(url.startsWith(`(${HOST}`), url);
  }
});

test('the guidance names the firm from the contact store, never a retyped literal', () => {
  const file = build();

  // The E.164 form, not the displayed `(0)`: the line tells an assistant which
  // number to hand out, and `+33 (0)1 …` does not dial from abroad.
  assert.ok(file.includes('Joignable au +33184162035, à cabinet@ouaknine-avocats.com.'), file);
  assert.equal(file.includes('Joignable au +33 (0)'), false);
  // The human-readable address line keeps the displayed form.
  assert.ok(file.includes('France. +33 (0)1 84 16 20 35. cabinet@'), file);
  assert.equal(file.includes('{phone}'), false);
  assert.equal(file.includes('{email}'), false);
});

test('the English edition is a full file, not the French one relabelled', () => {
  const file = build({ locale: 'en', otherLocale: 'fr', labels: EN_LABELS });

  assert.equal(file.split('\n')[0], '# Ouaknine Law Firm');
  assert.ok(file.includes('## When to use this firm'), file);
  assert.ok(file.includes('Reach the firm on +33184162035 or at cabinet@ouaknine-avocats.com.'), file);
  assert.ok(file.includes(`- [Français](${HOST}/)`), file);
  assert.equal(file.includes('Cabinet Ouaknine'), false);
});

test('leadSentence reads through abbreviations, initials and decimals', () => {
  assert.equal(
    leadSentence('Le cabinet intervient au titre de l art. 132-1 du code pénal. Puis autre chose.'),
    'Le cabinet intervient au titre de l art. 132-1 du code pénal.'
  );
  assert.equal(
    leadSentence('Défense de M. Dupont devant la cour. Ensuite rien.'),
    'Défense de M. Dupont devant la cour.'
  );
  assert.equal(
    leadSentence('Un délai de 3.5 ans est prévu. Ensuite rien.'),
    'Un délai de 3.5 ans est prévu.'
  );
  // A bare initial is not in the abbreviation set, so this is the only vector
  // that exercises the single-uppercase guard.
  assert.equal(
    leadSentence('Défense de A. Ouaknine devant la cour. Ensuite rien.'),
    'Défense de A. Ouaknine devant la cour.'
  );
  // An abbreviation followed by a capital is the only input that distinguishes
  // the ABBREVIATIONS set from the rules around it: without the set, the cut
  // lands on the abbreviation's own period.
  assert.equal(
    leadSentence('Le cabinet intervient au titre de l art. Une exception existe. Puis fin.'),
    'Le cabinet intervient au titre de l art. Une exception existe.'
  );
  assert.equal(
    leadSentence('Voir cf. Les autres cas. Puis fin.'),
    'Voir cf. Les autres cas.'
  );
  // Only the following-capital rule rejects these: a period followed by a
  // lower-case word or a digit is mid-sentence, whatever precedes it.
  assert.equal(
    leadSentence('Il intervient au pénal. voir aussi le civil.'),
    'Il intervient au pénal. voir aussi le civil.'
  );
  assert.equal(
    leadSentence('Un délai de trois ans. 132-1 du code pénal.'),
    'Un délai de trois ans. 132-1 du code pénal.'
  );
  // A quoted or bracketed opening still starts a sentence.
  assert.equal(
    leadSentence('Le cabinet plaide. « Une citation » suit.'),
    'Le cabinet plaide.'
  );
  // `!` and `?` end a sentence without any of the period rules applying.
  assert.equal(
    leadSentence('Vous êtes convoqué ? Le cabinet intervient.'),
    'Vous êtes convoqué ?'
  );
  assert.equal(
    leadSentence('Agissez vite ! Le délai court.'),
    'Agissez vite !'
  );
});
