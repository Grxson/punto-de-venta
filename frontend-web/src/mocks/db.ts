import type { CrearSucursalRequest, EditarSucursalRequest, Sucursal } from '../types/sucursal.types.ts';
import { sucursalesSeed } from './fixtures/sucursales.ts';
import { clearMockScenario } from './scenarios.ts';

/**
 * Estado simulado en memoria para las operaciones de escritura.
 *
 * Es un único array mutable que se reinicia con `resetMockData()`; no pretende
 * ser una base de datos, solo hacer que crear/editar/desactivar tengan un
 * efecto observable durante la sesión de desarrollo.
 */
let sucursales: Sucursal[] = structuredClone(sucursalesSeed);
let nextId = sucursales.reduce((max, s) => Math.max(max, s.id), 0) + 1;

/** @returns Copia de la lista de sucursales simulada. */
export const getSucursales = (): Sucursal[] => sucursales;

/** @returns La sucursal con ese id, o `undefined`. */
export const findSucursal = (id: number): Sucursal | undefined =>
  sucursales.find((s) => s.id === id);

/**
 * Crea una sucursal activa con un id nuevo.
 *
 * @param data - Datos validados por el handler.
 * @returns La sucursal creada.
 */
export const createSucursal = (data: CrearSucursalRequest): Sucursal => {
  const now = new Date().toISOString();
  const sucursal: Sucursal = {
    id: nextId++,
    nombre: data.nombre,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    activo: true,
    createdAt: now,
    updatedAt: now,
  };
  sucursales = [...sucursales, sucursal];
  return sucursal;
};

/**
 * Actualiza una sucursal existente.
 *
 * @param id - Id de la sucursal.
 * @param data - Campos a sobrescribir.
 * @returns La sucursal actualizada, o `undefined` si no existe.
 */
export const updateSucursal = (
  id: number,
  data: EditarSucursalRequest,
): Sucursal | undefined => {
  const actual = findSucursal(id);
  if (!actual) return undefined;
  const actualizada: Sucursal = {
    ...actual,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  sucursales = sucursales.map((s) => (s.id === id ? actualizada : s));
  return actualizada;
};

/**
 * Cambia el estado lógico de una sucursal.
 *
 * @param id - Id de la sucursal.
 * @param activo - Nuevo estado.
 * @returns La sucursal actualizada, o `undefined` si no existe.
 */
export const setSucursalActivo = (id: number, activo: boolean): Sucursal | undefined => {
  const actual = findSucursal(id);
  if (!actual) return undefined;
  const actualizada: Sucursal = { ...actual, activo, updatedAt: new Date().toISOString() };
  sucursales = sucursales.map((s) => (s.id === id ? actualizada : s));
  return actualizada;
};

/**
 * Restablece los datos iniciales y limpia el escenario activo.
 * Expuesto en `window.__MOCKS__.reset()` durante el desarrollo.
 */
export const resetMockData = (): void => {
  sucursales = structuredClone(sucursalesSeed);
  nextId = sucursales.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  clearMockScenario();
};
