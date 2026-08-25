// The CMS keeps the French and English fields of expertise as unrelated
// documents — an item carries no language of its own and no reference to its
// translation — and the two lists are not even in the same order, so the
// pairing between them lives here. It is keyed by slug because the language
// picker sits in the header and has nothing but the URL to work from.
//
// A pair that falls out of date — a field renamed in the studio, which changes
// its slug — sends the language switch to the index rather than to a URL that
// does not exist. The durable fix is a translation reference on the document.
const EXPERTISE_PAIRS = [
  ['droit-penal-general', 'criminal-law'],
  ['droit-penal-des-affaires', 'white-collar-crime'],
  ['enquetes-internes', 'internal-investigations'],
  ['cyber-criminalite', 'cyber-crime'],
  [
    'defense-des-ressortissants-americains-et-des-etrangers-anglophones',
    'defense-of-american-citizens-and-foreigners',
  ],
  ['droit-de-la-presse', 'press-and-media-law'],
  ['droit-penal-du-travail', 'criminal-employment-law'],
  [
    'droit-penal-de-la-concurrence-et-de-la-consommation',
    'competition-criminal-law-and-consumer-affairs',
  ],
  ['droit-penal-de-la-sante', 'criminal-law-and-public-health'],
  ['droit-penal-international', 'international-criminal-law'],
];

export default EXPERTISE_PAIRS;
