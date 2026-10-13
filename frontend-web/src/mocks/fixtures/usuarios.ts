/**
 * Usuarios de ejemplo que replican el `UsuarioDTO` del backend.
 *
 * Las contraseñas son ficticias y solo existen para que el formulario de login
 * tenga credenciales con las que trabajar en modo mock. Nunca corresponden a
 * credenciales reales.
 */
export interface MockRol {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface MockUsuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  activo: boolean;
  rol: MockRol;
  rolNombre: string;
  sucursalId: number;
  ultimoAcceso: string | null;
  createdAt: string;
  updatedAt: string;
}

const rolAdmin: MockRol = { id: 1, nombre: 'ADMIN', descripcion: 'Administrador del sistema', activo: true };
const rolGerente: MockRol = { id: 2, nombre: 'GERENTE', descripcion: 'Gerente de sucursal', activo: true };
const rolCajero: MockRol = { id: 3, nombre: 'CAJERO', descripcion: 'Cajero de punto de venta', activo: true };

export const usuariosMock: MockUsuario[] = [
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'Demo',
    email: 'ana.demo@example.com',
    username: 'admin',
    activo: true,
    rol: rolAdmin,
    rolNombre: 'ADMIN',
    sucursalId: 1,
    ultimoAcceso: '2026-01-01T10:00:00',
    createdAt: '2025-01-01T10:00:00',
    updatedAt: '2025-06-01T12:00:00',
  },
  {
    id: 2,
    nombre: 'Gerardo',
    apellido: 'Demo',
    email: 'gerardo.demo@example.com',
    username: 'gerente',
    activo: true,
    rol: rolGerente,
    rolNombre: 'GERENTE',
    sucursalId: 2,
    ultimoAcceso: '2026-01-02T09:30:00',
    createdAt: '2025-01-05T10:00:00',
    updatedAt: '2025-05-10T11:00:00',
  },
  {
    id: 3,
    nombre: 'Carla',
    apellido: 'Demo',
    email: 'carla.demo@example.com',
    username: 'cajero',
    activo: true,
    rol: rolCajero,
    rolNombre: 'CAJERO',
    sucursalId: 1,
    ultimoAcceso: '2026-01-03T08:15:00',
    createdAt: '2025-02-01T10:00:00',
    updatedAt: '2025-04-01T10:00:00',
  },
  {
    id: 4,
    nombre: 'Inés',
    apellido: 'Demo',
    email: 'ines.demo@example.com',
    username: 'inactivo',
    activo: false,
    rol: rolCajero,
    rolNombre: 'CAJERO',
    sucursalId: 1,
    ultimoAcceso: null,
    createdAt: '2025-03-01T10:00:00',
    updatedAt: '2025-03-01T10:00:00',
  },
];

/**
 * Credenciales aceptadas por el handler de login.
 * Todas son de demostración.
 */
export const credencialesMock: Record<string, string> = {
  admin: 'admin123',
  gerente: 'gerente123',
  cajero: 'cajero123',
  inactivo: 'inactivo123',
};

/**
 * Token ficticio con formato JWT (tres segmentos) para que la validación de
 * forma del cliente (`AuthContext.isTokenValid`) lo acepte.
 */
export const tokenMock =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtb2NrIiwicm9sZSI6IkFETUlOIn0.mock-signature';
