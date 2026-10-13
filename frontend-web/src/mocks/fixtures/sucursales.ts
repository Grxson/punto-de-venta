import type { Sucursal } from '../../types/sucursal.types.ts';

/**
 * Sucursales de ejemplo, deterministas y compatibles con `SucursalDTO` del
 * backend. Cubren estados activo e inactivo para poder ejercitar los filtros.
 *
 * Los datos son ficticios: ninguna dirección, teléfono o correo corresponde a
 * un cliente real.
 */
export const sucursalesSeed: Sucursal[] = [
  {
    id: 1,
    nombre: 'Sucursal Centro',
    direccion: 'Av. Reforma 123, CDMX',
    telefono: '5551234567',
    email: 'centro@example.com',
    activo: true,
    createdAt: '2025-01-10T09:00:00',
    updatedAt: '2025-06-01T12:30:00',
  },
  {
    id: 2,
    nombre: 'Sucursal Norte',
    direccion: 'Calz. Vallejo 400, CDMX',
    telefono: '5559876543',
    email: 'norte@example.com',
    activo: true,
    createdAt: '2025-01-12T09:15:00',
    updatedAt: '2025-05-20T10:00:00',
  },
  {
    id: 3,
    nombre: 'Sucursal Sur',
    direccion: 'Av. Insurgentes 2100, CDMX',
    telefono: '5552223344',
    email: 'sur@example.com',
    activo: true,
    createdAt: '2025-02-01T08:45:00',
    updatedAt: '2025-04-15T16:20:00',
  },
  {
    id: 4,
    nombre: 'Sucursal Poniente',
    direccion: 'Blvd. Ávila Camacho 60, CDMX',
    telefono: undefined,
    email: undefined,
    activo: false,
    createdAt: '2024-11-05T11:00:00',
    updatedAt: '2025-03-02T09:10:00',
  },
  {
    id: 5,
    nombre: 'Sucursal Eventos',
    direccion: 'Parque Lincoln 1, CDMX',
    telefono: undefined,
    email: 'eventos@example.com',
    activo: false,
    createdAt: '2024-12-20T14:00:00',
    updatedAt: '2025-01-30T18:45:00',
  },
];
