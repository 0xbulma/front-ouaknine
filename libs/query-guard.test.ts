import { methodNotAllowed, unexpectedQuery } from './query-guard';

const ALLOWED = ['locale', 'path'];

test('the parameters the route asked for pass', () => {
  expect(unexpectedQuery({}, ALLOWED)).toBe(false);
  expect(unexpectedQuery({ locale: 'en' }, ALLOWED)).toBe(false);
  expect(unexpectedQuery({ locale: 'fr', path: '/contact' }, ALLOWED)).toBe(false);
  expect(unexpectedQuery(undefined, ALLOWED)).toBe(false);
});

test('an unknown parameter does not', () => {
  expect(unexpectedQuery({ bust: '1' }, ALLOWED)).toBe(true);
  expect(unexpectedQuery({ locale: 'fr', utm_source: 'x' }, ALLOWED)).toBe(true);
});

test('a repeated allowed parameter does not either', () => {
  // `?path=/contact&path=/legal` arrives as an array and passed a check on key
  // names alone, while still varying the CDN key on every distinct repeat.
  expect(unexpectedQuery({ path: ['/contact', '/legal'] }, ALLOWED)).toBe(true);
  expect(unexpectedQuery({ locale: ['en', 'fr'] }, ALLOWED)).toBe(true);
});

test('the allowlist is per route', () => {
  expect(unexpectedQuery({ path: '/contact' }, ['locale'])).toBe(true);
  expect(unexpectedQuery({ locale: 'en' }, ['locale'])).toBe(false);
});

test('only GET and HEAD reach a generated representation', () => {
  expect(methodNotAllowed('GET')).toBe(false);
  expect(methodNotAllowed('HEAD')).toBe(false);

  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', undefined]) {
    expect(methodNotAllowed(method), String(method)).toBe(true);
  }
});
