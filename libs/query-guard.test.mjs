import assert from 'node:assert/strict';
import test from 'node:test';

import { methodNotAllowed, unexpectedQuery } from './query-guard.mjs';

const ALLOWED = ['locale', 'path'];

test('the parameters the route asked for pass', () => {
  assert.equal(unexpectedQuery({}, ALLOWED), false);
  assert.equal(unexpectedQuery({ locale: 'en' }, ALLOWED), false);
  assert.equal(unexpectedQuery({ locale: 'fr', path: '/contact' }, ALLOWED), false);
  assert.equal(unexpectedQuery(undefined, ALLOWED), false);
});

test('an unknown parameter does not', () => {
  assert.equal(unexpectedQuery({ bust: '1' }, ALLOWED), true);
  assert.equal(unexpectedQuery({ locale: 'fr', utm_source: 'x' }, ALLOWED), true);
});

test('a repeated allowed parameter does not either', () => {
  // `?path=/contact&path=/legal` arrives as an array and passed a check on key
  // names alone, while still varying the CDN key on every distinct repeat.
  assert.equal(unexpectedQuery({ path: ['/contact', '/legal'] }, ALLOWED), true);
  assert.equal(unexpectedQuery({ locale: ['en', 'fr'] }, ALLOWED), true);
});

test('the allowlist is per route', () => {
  assert.equal(unexpectedQuery({ path: '/contact' }, ['locale']), true);
  assert.equal(unexpectedQuery({ locale: 'en' }, ['locale']), false);
});

test('only GET and HEAD reach a generated representation', () => {
  assert.equal(methodNotAllowed('GET'), false);
  assert.equal(methodNotAllowed('HEAD'), false);

  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', undefined]) {
    assert.equal(methodNotAllowed(method), true, String(method));
  }
});
