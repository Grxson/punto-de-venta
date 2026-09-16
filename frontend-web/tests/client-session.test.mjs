import test from 'node:test';
import assert from 'node:assert/strict';

import { clearClientSession } from '../src/utils/clientSession.ts';

class MemoryStorage {
  constructor(entries = {}) {
    this.entries = new Map(Object.entries(entries));
  }

  getItem(key) {
    return this.entries.get(key) ?? null;
  }

  removeItem(key) {
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}

test('el logout elimina el carrito persistido y los datos de sesión', () => {
  const local = new MemoryStorage({
    auth_token: 'token',
    auth_usuario: '{}',
    auth_sucursal: '{}',
    cart: '[{"cantidad":1}]',
    unrelated: 'keep',
  });
  const session = new MemoryStorage({ pending: 'remove' });

  clearClientSession(local, session);

  assert.equal(local.getItem('auth_token'), null);
  assert.equal(local.getItem('cart'), null);
  assert.equal(local.getItem('unrelated'), 'keep');
  assert.equal(session.getItem('pending'), null);
});
