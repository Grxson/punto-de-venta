import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { server } from '../src/mocks/node.ts';
import { resetMockData } from '../src/mocks/db.ts';
import { setMockScenario } from '../src/mocks/scenarios.ts';

/**
 * Pruebas de los handlers de MSW.
 *
 * Verifican que las respuestas simuladas respetan los contratos del backend,
 * que los errores se manejan y que una petición no simulada NO se reenvía a la
 * red: `onUnhandledRequest: 'error'` convierte esa fuga en un fallo del test.
 */
const BASE = 'http://localhost/api';

before(() => server.listen({ onUnhandledRequest: 'error' }));
after(() => server.close());
beforeEach(() => resetMockData());

test('el login válido devuelve token JWT y el usuario ADMIN', async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.usuario.username, 'admin');
  assert.equal(body.usuario.rolNombre, 'ADMIN');
  assert.equal(body.usuario.rol.nombre, 'ADMIN');
  assert.equal(body.token.split('.').length, 3);
});

test('el login con credenciales inválidas responde 401 con mensaje legible', async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'incorrecta' }),
  });

  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.message, 'Credenciales inválidas');
  assert.equal(body.status, 401);
});

test('el login de un usuario inactivo responde 403', async () => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'inactivo', password: 'inactivo123' }),
  });

  assert.equal(res.status, 403);
});

test('el listado de sucursales filtra por activo', async () => {
  const todas = await (await fetch(`${BASE}/sucursales`)).json();
  assert.equal(todas.length, 5);

  const activas = await (await fetch(`${BASE}/sucursales?activo=true`)).json();
  assert.equal(activas.length, 3);
  assert.ok(activas.every((s) => s.activo === true));

  const inactivas = await (await fetch(`${BASE}/sucursales?activo=false`)).json();
  assert.equal(inactivas.length, 2);
});

test('el escenario "empty" devuelve una lista vacía', async () => {
  setMockScenario('empty');
  const res = await fetch(`${BASE}/sucursales`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test('el escenario "error" devuelve 500 con cuerpo de error del backend', async () => {
  setMockScenario('error');
  const res = await fetch(`${BASE}/sucursales`);
  assert.equal(res.status, 500);
  const body = await res.json();
  assert.equal(body.status, 500);
  assert.ok(body.message);
});

test('crear una sucursal sin nombre ni dirección responde 400 con validaciones', async () => {
  const res = await fetch(`${BASE}/sucursales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: '', direccion: '  ' }),
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.ok(body.validationErrors.nombre);
  assert.ok(body.validationErrors.direccion);
});

test('crear, desactivar y reactivar una sucursal altera el estado simulado', async () => {
  const creada = await (
    await fetch(`${BASE}/sucursales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Sucursal Nueva', direccion: 'Calle 1' }),
    })
  ).json();
  assert.ok(creada.id > 5);
  assert.equal(creada.activo, true);

  const desactivada = await (
    await fetch(`${BASE}/sucursales/${creada.id}/desactivar`, { method: 'PUT' })
  ).json();
  assert.equal(desactivada.activo, false);

  const reactivada = await (
    await fetch(`${BASE}/sucursales/${creada.id}/reactivar`, { method: 'PUT' })
  ).json();
  assert.equal(reactivada.activo, true);

  resetMockData();
  const trasReset = await (await fetch(`${BASE}/sucursales`)).json();
  assert.equal(trasReset.length, 5);
});

test('una ruta no simulada no se reenvía a la red', async () => {
  await assert.rejects(
    fetch(`${BASE}/ruta-sin-handler`),
    'una petición sin handler debe fallar en vez de salir a la red',
  );
});
