import test from 'node:test';
import assert from 'node:assert/strict';

import { toWebSocketEndpoint } from '../src/utils/websocketUrl.ts';

test('deriva el endpoint SockJS del backend configurado', () => {
  assert.equal(
    toWebSocketEndpoint('https://backend-production-4bc3.up.railway.app/api'),
    'https://backend-production-4bc3.up.railway.app/ws',
  );
});
