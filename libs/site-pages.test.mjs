import assert from 'node:assert/strict';
import test from 'node:test';

import { HOST } from './site-url.mjs';
import { sitePages } from './site-pages.mjs';

const labels = {
  homeNote: 'accueil',
  aboutLabel: 'Le cabinet',
  aboutNote: 'le cabinet',
  expertiseNote: 'compétences',
  contactNote: 'coordonnées',
  iskaNote: 'réseau',
  legalNote: 'mentions',
};

const nav = [
  { label: 'Le Cabinet', url: '/' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Contact', url: '/contact' },
];

const labelsWithFallbacks = {
  ...labels,
  footerLead: 'Cabinet Ouaknine',
  expertiseLabel: 'Expertise',
  contactLabel: 'Contact',
};

const args = { labels, nav, iskaTitle: 'Réseau ISKA', legalLabel: 'Mentions Légales' };

test('every public page is listed once, with a label, a note and an absolute URL', () => {
  const pages = sitePages('fr', args);

  assert.deepEqual(
    pages.map(page => page.path),
    ['/', '/about', '/expertise', '/contact', '/iska', '/legal']
  );

  for (const page of pages) {
    assert.ok(page.label, `label for ${page.path}`);
    assert.ok(page.note, `note for ${page.path}`);
    assert.ok(page.url.startsWith(HOST), page.url);
  }
});

test('the English edition carries the /en prefix on every entry', () => {
  const pages = sitePages('en', args);

  assert.equal(pages[0].url, `${HOST}/en`);
  assert.equal(pages[1].url, `${HOST}/en/about`);
  assert.equal(pages[5].url, `${HOST}/en/legal`);
});

test('nav labels are resolved by url, so reordering the nav cannot relabel a page', () => {
  const reordered = [
    { label: 'Contact', url: '/contact' },
    { label: 'Le Cabinet', url: '/' },
    { label: 'Expertise', url: '/expertise' },
  ];

  const pages = sitePages('fr', { ...args, labels: labelsWithFallbacks, nav: reordered });

  assert.equal(pages.find(page => page.path === '/').label, 'Le Cabinet');
  assert.equal(pages.find(page => page.path === '/expertise').label, 'Expertise');
  assert.equal(pages.find(page => page.path === '/contact').label, 'Contact');
});

test('a nav missing an entry falls back rather than throwing', () => {
  const pages = sitePages('fr', {
    ...args,
    labels: labelsWithFallbacks,
    nav: [{ label: 'Le Cabinet', url: '/' }],
  });

  assert.equal(pages.length, 6);
  assert.equal(pages.find(page => page.path === '/expertise').label, 'Expertise');
  assert.equal(pages.find(page => page.path === '/contact').label, 'Contact');
});

test('the real agent copy fills every label and note, in both languages', async () => {
  // Binds the fixture names above to the file the routes actually pass in: a
  // key renamed in agentContent.json would otherwise ship `undefined` into
  // llms.txt with the suite still green.
  const { default: agentContent } = await import('../content/agentContent.json', {
    with: { type: 'json' },
  });
  const { default: headerContent } = await import('../content/headerContent.json', {
    with: { type: 'json' },
  });
  const { default: footerContent } = await import('../content/footerContent.json', {
    with: { type: 'json' },
  });
  const { default: iskaContent } = await import('../content/iskaContent.json', {
    with: { type: 'json' },
  });

  for (const locale of ['fr', 'en']) {
    const pages = sitePages(locale, {
      labels: agentContent[locale],
      nav: headerContent[locale].nav,
      iskaTitle: iskaContent[locale].title,
      legalLabel: footerContent[locale].link2,
    });

    for (const page of pages) {
      assert.equal(typeof page.label, 'string', `${locale} ${page.path} label`);
      assert.ok(page.label.trim(), `${locale} ${page.path} label is empty`);
      assert.equal(typeof page.note, 'string', `${locale} ${page.path} note`);
      assert.ok(page.note.trim(), `${locale} ${page.path} note is empty`);
    }

    // Every other string the renderers read off `labels`. Renaming any of them
    // in the studio-facing JSON is a blank heading or a literal `undefined` in
    // llms.txt, and `guidance` is a 500 — none of which the page loop above
    // would notice.
    const labels = agentContent[locale];
    for (const key of [
      'summary', 'whenToUse', 'whenToUseLead', 'whenToUseNote', 'pages',
      'sitemapNote', 'englishNote', 'otherLocaleLabel', 'expertiseLabel',
      'contactLabel', 'notFoundTitle', 'notFoundBody', 'unavailableTitle',
      'unavailableBody', 'footerLead',
    ]) {
      assert.equal(typeof labels[key], 'string', `${locale} ${key}`);
      assert.ok(labels[key].trim(), `${locale} ${key} is empty`);
    }

    assert.ok(Array.isArray(labels.guidance), `${locale} guidance`);
    assert.ok(labels.guidance.length > 0, `${locale} guidance is empty`);

    // And the contact labels the contact document renders.
    const { default: contactContent } = await import('../content/contactContent.json', {
      with: { type: 'json' },
    });
    for (const key of ['addressLabel', 'phoneLabel', 'mobileLabel', 'emailLabel']) {
      assert.ok(contactContent[locale][key]?.trim(), `${locale} ${key}`);
    }

    // And the ISKA copy, which is the one page whose whole body is a content
    // file rather than the CMS.
    const { default: iska } = await import('../content/iskaContent.json', {
      with: { type: 'json' },
    });
    for (const key of ['title', 'tagline', 'networkTitle', 'bringTitle', 'skillsTitle']) {
      assert.ok(iska[locale][key]?.trim(), `${locale} iska ${key}`);
    }
    for (const key of ['network', 'bring', 'skills']) {
      assert.ok(Array.isArray(iska[locale][key]), `${locale} iska ${key}`);
      assert.ok(iska[locale][key].length > 0, `${locale} iska ${key} is empty`);
    }
  }
});
