import assert from 'node:assert/strict';
import test from 'node:test';

import {
  aboutMarkdown,
  contactMarkdown,
  expertiseFieldMarkdown,
  expertiseIndexMarkdown,
  homeMarkdown,
  iskaMarkdown,
  legalMarkdown,
  notFoundMarkdown,
  unavailableMarkdown,
} from './page-markdown.mjs';

import { HOST } from './site-url.mjs';

const paragraph = text => ({
  _type: 'block',
  _key: text.slice(0, 6),
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span', _key: 's', text, marks: [] }],
});

const ctx = (locale = 'fr') => ({
  locale,
  labels: {
    pages: 'Pages',
    footerLead: 'Cabinet Ouaknine',
    notFoundTitle: 'Page introuvable',
    notFoundBody: 'Cette URL n’existe pas sur ce site.',
    unavailableTitle: 'Site temporairement indisponible',
    unavailableBody: 'Cette page existe, mais le contenu ne peut pas être chargé.',
  },
  contact: {
    fr: {
      address: '17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35',
      email: 'cabinet@ouaknine-avocats.com',
      mobile: '+33 (0)6 29 65 35 12',
    },
    en: {
      address: '17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35',
      email: 'cabinet@ouaknine-avocats.com',
      mobile: '+33 (0)6 29 65 35 12',
    },
  },
  contactLabels: {
    addressLabel: 'Adresse',
    phoneLabel: 'Téléphone',
    mobileLabel: 'Mobile',
    emailLabel: 'Email',
  },
  pages: [
    { label: 'Contact', url: `${HOST}/contact`, note: 'coordonnées' },
    { label: 'Expertise', url: `${HOST}/expertise` },
  ],
});

const firstLine = markdown => markdown.split('\n')[0];

test('the footer spells out how to reach the firm', () => {
  // The one place outside the contact document where the address, phone and
  // email appear in every markdown page — what an agent reads when the body is
  // no use to it.
  const out = notFoundMarkdown(ctx());

  assert.ok(
    out.includes(
      'Cabinet Ouaknine, 17 rue de Douai, 75009 Paris, France. +33 (0)1 84 16 20 35. cabinet@ouaknine-avocats.com'
    ),
    out
  );
});

test('no optional field leaks the word undefined into a document', () => {
  // Every renderer guards a field the CMS may not hold — the byline, the lead,
  // the section title, the aside. `joinBlocks` keeps `_undefined_` because it
  // is a non-blank string, so an unguarded one ships.
  const documents = [
    homeMarkdown({ title1: 'T', body: [] }, ctx()),
    aboutMarkdown({ sectionTitle: 'S', body: [] }, ctx()),
    contactMarkdown({ title: 'Contact' }, ctx()),
    legalMarkdown({ title: 'Mentions' }, ctx()),
    expertiseIndexMarkdown({ title: 'E', expertiseList: [] }, ctx()),
    expertiseFieldMarkdown({ title: 'F', slug: 'f', description: [] }, ctx()),
    notFoundMarkdown(ctx()),
    unavailableMarkdown(ctx()),
  ];

  for (const document of documents) {
    assert.equal(document.includes('undefined'), false, document);
    assert.equal(document.includes('[object Object]'), false, document);
  }
});

test('every document opens with an H1 and closes with the recovery footer', () => {
  const documents = [
    homeMarkdown({ title1: 'Défense pénale', body: [paragraph('Le cabinet.')] }, ctx()),
    aboutMarkdown({ sectionTitle: 'Alice Ouaknine', body: [paragraph('Bio.')] }, ctx()),
    contactMarkdown({ title: 'Contact' }, ctx()),
    legalMarkdown({ title: 'Mentions', block: [paragraph('Texte.')] }, ctx()),
    notFoundMarkdown(ctx()),
  ];

  for (const document of documents) {
    assert.match(firstLine(document), /^# \S/);
    assert.ok(document.includes(`${HOST}/llms.txt`));
    assert.ok(document.includes(`${HOST}/sitemap.xml`));
    assert.ok(document.includes('## Pages'));
    assert.ok(document.endsWith('\n'));
  }
});

test('the home document carries the byline, the firm text and the source URL', () => {
  const markdown = homeMarkdown(
    {
      title1: 'Défense pénale ',
      title2: 'Barreaux de Paris et de Californie',
      descriptionseo: 'Avocate aux barreaux de Paris et de Californie.',
      sectionTitle: 'Alice Ouaknine',
      body: [paragraph('Le cabinet est dédié à la défense pénale.')],
    },
    ctx()
  );

  assert.equal(firstLine(markdown), '# Défense pénale');
  assert.ok(markdown.includes('> Avocate aux barreaux de Paris et de Californie.'));
  assert.ok(markdown.includes('_Barreaux de Paris et de Californie_'));
  assert.ok(markdown.includes('## Alice Ouaknine'));
  assert.ok(markdown.includes(`Source: ${HOST}/`));
});

test('the contact document lists every way to reach the firm', () => {
  const markdown = contactMarkdown({ title: 'Contacter le Cabinet' }, ctx());

  assert.ok(markdown.includes('- Adresse: 17 rue de Douai, 75009 Paris, France'));
  assert.ok(markdown.includes('- Téléphone: +33 (0)1 84 16 20 35'));
  assert.ok(markdown.includes('- Mobile: +33 (0)6 29 65 35 12'));
  assert.ok(markdown.includes('- Email: cabinet@ouaknine-avocats.com'));
});

test('the expertise index links every field at its own URL', () => {
  const markdown = expertiseIndexMarkdown(
    {
      title: 'Champs de compétence',
      expertiseList: [
        { title: 'Droit pénal général', slug: 'droit-penal-general' },
        { title: 'Cyber-criminalité', slug: 'cyber-criminalite' },
      ],
    },
    ctx()
  );

  assert.ok(markdown.includes(`- [Droit pénal général](${HOST}/expertise/droit-penal-general)`));
  assert.ok(markdown.includes(`- [Cyber-criminalité](${HOST}/expertise/cyber-criminalite)`));
});

test('a document with no lead publishes no blockquote', () => {
  // `expertiseFieldMarkdown` never passes one, and contact/legal pass a CMS
  // field that may be absent — unguarded, every field document would open with
  // a literal `> undefined`.
  const field = expertiseFieldMarkdown(
    { title: 'Droit pénal général', slug: 'droit-penal-general', description: [] },
    ctx()
  );
  assert.equal(field.split('\n').some(line => line.startsWith('> ')), false, field);

  const contact = contactMarkdown({ title: 'Contact' }, ctx());
  assert.equal(contact.split('\n').some(line => line.startsWith('> ')), false, contact);
});

test('an expertise field renders its description and its aside', () => {
  const markdown = expertiseFieldMarkdown(
    {
      title: 'White-collar crime',
      slug: 'white-collar-crime',
      description: [paragraph('The firm has extensive expertise.')],
      titleSpe: 'Expertise',
      right: [{ ...paragraph('fraud'), listItem: 'bullet', level: 1 }],
    },
    ctx('en')
  );

  assert.equal(firstLine(markdown), '# White-collar crime');
  assert.ok(markdown.includes('## Expertise'));
  assert.ok(markdown.includes('- fraud'));
  assert.ok(markdown.includes(`Source: ${HOST}/en/expertise/white-collar-crime`));
});

test('an expertise field with no aside omits the heading', () => {
  const markdown = expertiseFieldMarkdown(
    { title: 'Cyber', slug: 'cyber', description: [paragraph('Texte.')] },
    ctx()
  );
  assert.equal(markdown.includes('## undefined'), false);
});

test('the ISKA document comes straight from the content file', () => {
  const markdown = iskaMarkdown(
    {
      title: 'Réseau ISKA',
      tagline: 'Un réseau d’avocats indépendants.',
      networkTitle: 'Le réseau',
      network: ['Implanté au cœur de Paris.', 'Ses avocats plaident partout.'],
      bringTitle: 'Ce que le réseau apporte',
      bring: ['Le cabinet reste indépendant.', 'Une seule interlocutrice.'],
      skillsTitle: 'Les compétences du réseau',
      skills: ['Droit pénal', 'Droit du travail'],
    },
    ctx()
  );

  assert.equal(firstLine(markdown), '# Réseau ISKA');
  assert.ok(markdown.includes('> Un réseau d’avocats indépendants.'));
  assert.ok(markdown.includes('## Les compétences du réseau'));
  assert.ok(markdown.includes('- Droit pénal\n- Droit du travail'));
  // The content file ships several paragraphs per section; they stay separate
  // paragraphs rather than being glued into one.
  assert.ok(
    markdown.includes('Implanté au cœur de Paris.\n\nSes avocats plaident partout.'),
    markdown
  );
  assert.ok(
    markdown.includes('Le cabinet reste indépendant.\n\nUne seule interlocutrice.'),
    markdown
  );
});

test('the 404 document names the site map and the agent guide', () => {
  const markdown = notFoundMarkdown(ctx());

  assert.equal(firstLine(markdown), '# Page introuvable');
  assert.ok(markdown.includes(`${HOST}/sitemap.xml`));
  assert.ok(markdown.includes(`${HOST}/llms.txt`));
  assert.ok(markdown.includes(`- [Contact](${HOST}/contact): coordonnées`));
  // Nothing to cite: a 404 has no source URL of its own.
  assert.equal(markdown.includes('Source:'), false);
});

test('a link with no note renders without a trailing colon', () => {
  assert.ok(notFoundMarkdown(ctx()).includes(`- [Expertise](${HOST}/expertise)\n`));
});

test('the unavailable document is not the 404 document', () => {
  // The 503 and the 404 must never converge: a body reading "this URL does not
  // exist" beside a status meaning "try again later" is what makes an agent
  // drop a live URL during an outage.
  const context = ctx();
  const out = unavailableMarkdown(context);

  assert.ok(out.startsWith(`# ${context.labels.unavailableTitle}`), out);
  assert.ok(out.includes(`> ${context.labels.unavailableBody}`), out);
  assert.ok(out.includes(`## ${context.labels.pages}`), out);
  assert.equal(out.includes(context.labels.notFoundTitle), false);
  assert.equal(out.includes(context.labels.notFoundBody), false);
});

test('the English edition links the English llms.txt', () => {
  // The sitemap is one file for both languages; llms.txt is not.
  const out = notFoundMarkdown(ctx('en'));

  assert.ok(out.includes(`${HOST}/en/llms.txt`), out);
  assert.equal(out.includes(`${HOST}/llms.txt`), false);
  assert.ok(out.includes(`${HOST}/sitemap.xml`), out);
});

test('the about document summarises its own section, not the home page', () => {
  // `/about` renders the firm section of the home document; leading with the
  // home page's `descriptionseo` made its summary a copy of `/index.md`'s,
  // while the HTML page derived a different one from the same body.
  const home = {
    title1: 'Alice Ouaknine',
    title2: 'Barreaux de Paris et de Californie',
    descriptionseo: 'La page d’accueil du cabinet.',
    sectionTitle: 'Le cabinet',
    body: [paragraph('Le cabinet est dédié à la défense pénale.')],
  };

  const about = aboutMarkdown(home, { ...ctx(), lead: 'Le cabinet est dédié à la défense pénale.' });

  assert.ok(about.includes('> Le cabinet est dédié à la défense pénale.'), about);
  assert.equal(about.includes('La page d’accueil du cabinet.'), false, about);
});
