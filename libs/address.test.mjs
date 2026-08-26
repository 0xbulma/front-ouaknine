import assert from 'node:assert/strict';
import test from 'node:test';

import { splitAddress } from './address.mjs';

test('the address block splits into street and displayed phone', () => {
  assert.deepEqual(
    splitAddress('17 rue de Douai, 75009 Paris, France\nTél. : +33 (0)1 84 16 20 35'),
    { street: '17 rue de Douai, 75009 Paris, France', phone: '+33 (0)1 84 16 20 35' }
  );
  assert.deepEqual(
    splitAddress('17 rue de Douai, 75009 Paris, France\nTel: +33 (0)1 84 16 20 35'),
    { street: '17 rue de Douai, 75009 Paris, France', phone: '+33 (0)1 84 16 20 35' }
  );
});

test('missing and single-line input', () => {
  assert.deepEqual(splitAddress(undefined), { street: '', phone: '' });
  assert.deepEqual(splitAddress('17 rue de Douai'), { street: '17 rue de Douai', phone: '' });
});
