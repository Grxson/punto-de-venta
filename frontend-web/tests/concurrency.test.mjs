import test from 'node:test';
import assert from 'node:assert/strict';

import {
  acquireLock,
  createSingleFlight,
  didAuthTokenChange,
  releaseLock,
} from '../src/utils/concurrency.ts';

test('single-flight comparte una operación concurrente y permite otra al terminar', async () => {
  const runSingleFlight = createSingleFlight();
  let executions = 0;
  let resolveOperation;
  const operation = () => {
    executions += 1;
    return new Promise((resolve) => {
      resolveOperation = resolve;
    });
  };

  const first = runSingleFlight(operation);
  const second = runSingleFlight(operation);

  assert.equal(executions, 1);
  resolveOperation(true);
  assert.deepEqual(await Promise.all([first, second]), [true, true]);

  const third = runSingleFlight(async () => {
    executions += 1;
    return false;
  });

  assert.equal(await third, false);
  assert.equal(executions, 2);
});

test('el lock rechaza reentradas hasta que se libera', () => {
  const lock = { current: false };

  assert.equal(acquireLock(lock), true);
  assert.equal(acquireLock(lock), false);

  releaseLock(lock);

  assert.equal(acquireLock(lock), true);
});

test('detecta un 401 tardío enviado con el token anterior', () => {
  assert.equal(didAuthTokenChange('Bearer token-anterior', 'token-nuevo'), true);
  assert.equal(didAuthTokenChange('Bearer token-nuevo', 'token-nuevo'), false);
  assert.equal(didAuthTokenChange(undefined, 'token-nuevo'), false);
});
