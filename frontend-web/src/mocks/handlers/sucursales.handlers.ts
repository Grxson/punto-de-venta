import { http, HttpResponse } from 'msw';
import { apiPath } from './apiPath.ts';
import { mockError } from '../errors.ts';
import { getMockScenario } from '../scenarios.ts';
import {
  createSucursal,
  findSucursal,
  getSucursales,
  setSucursalActivo,
  updateSucursal,
} from '../db.ts';

/** Cuerpo aceptado en el alta de una sucursal. */
interface SucursalBody {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

/**
 * Valida los campos obligatorios como lo haría `@Valid` en el backend.
 *
 * @param data - Cuerpo recibido.
 * @returns Errores por campo; objeto vacío si es válido.
 */
const validarSucursal = (data: SucursalBody | null): Record<string, string> => {
  const errores: Record<string, string> = {};
  if (!data?.nombre || !String(data.nombre).trim()) {
    errores.nombre = 'El nombre es requerido';
  }
  if (!data?.direccion || !String(data.direccion).trim()) {
    errores.direccion = 'La dirección es requerida';
  }
  return errores;
};

/** Handler del listado, con soporte de `?activo=` y de escenarios de interfaz. */
const listarSucursales = ({ request }: { request: Request }) => {
  const scenario = getMockScenario();
  if (scenario === 'error') {
    return HttpResponse.json(
      mockError(500, 'Error interno', 'No se pudieron cargar las sucursales'),
      { status: 500 },
    );
  }
  if (scenario === 'unauthorized') {
    return HttpResponse.json(
      mockError(403, 'Acceso denegado', 'No tiene permisos para realizar esta operación'),
      { status: 403 },
    );
  }
  if (scenario === 'empty') {
    return HttpResponse.json([]);
  }

  const activo = new URL(request.url).searchParams.get('activo');
  let data = getSucursales();
  if (activo === 'true') data = data.filter((s) => s.activo);
  else if (activo === 'false') data = data.filter((s) => !s.activo);

  return HttpResponse.json(data);
};

/**
 * Handlers de sucursales, alineados con `SucursalController` (`/api/sucursales`).
 *
 * Nota de contrato: el backend desactiva/reactiva con `PUT /{id}/desactivar` y
 * `PUT /{id}/reactivar`, no con `DELETE`/`POST`. Los mocks replican el backend
 * real; el servicio del frontend aún usa los verbos antiguos (ver discrepancia
 * documentada en `docs/development/frontend-contributing.md`).
 */
export const sucursalesHandlers = [
  http.get(apiPath('/sucursales/(?<id>\\d+)'), ({ params }) => {
    const sucursal = findSucursal(Number(params.id));
    if (!sucursal) {
      return HttpResponse.json(
        mockError(404, 'Recurso no encontrado', `No existe la sucursal ${params.id}`),
        { status: 404 },
      );
    }
    return HttpResponse.json(sucursal);
  }),

  http.post(apiPath('/sucursales'), async ({ request }) => {
    const body = (await request.json().catch(() => null)) as SucursalBody | null;
    const errores = validarSucursal(body);
    if (Object.keys(errores).length > 0) {
      return HttpResponse.json(
        mockError(400, 'Error de validación', 'Los datos proporcionados no son válidos', errores),
        { status: 400 },
      );
    }
    return HttpResponse.json(
      createSucursal({ nombre: body!.nombre!, direccion: body!.direccion!, telefono: body!.telefono, email: body!.email }),
      { status: 201 },
    );
  }),

  http.put(apiPath('/sucursales/(?<id>\\d+)/desactivar'), ({ params }) => {
    const actualizada = setSucursalActivo(Number(params.id), false);
    if (!actualizada) {
      return HttpResponse.json(
        mockError(404, 'Recurso no encontrado', `No existe la sucursal ${params.id}`),
        { status: 404 },
      );
    }
    return HttpResponse.json(actualizada);
  }),

  http.put(apiPath('/sucursales/(?<id>\\d+)/reactivar'), ({ params }) => {
    const actualizada = setSucursalActivo(Number(params.id), true);
    if (!actualizada) {
      return HttpResponse.json(
        mockError(404, 'Recurso no encontrado', `No existe la sucursal ${params.id}`),
        { status: 404 },
      );
    }
    return HttpResponse.json(actualizada);
  }),

  http.put(apiPath('/sucursales/(?<id>\\d+)'), async ({ request, params }) => {
    const body = (await request.json().catch(() => null)) as SucursalBody | null;
    const errores = validarSucursal(body);
    if (Object.keys(errores).length > 0) {
      return HttpResponse.json(
        mockError(400, 'Error de validación', 'Los datos proporcionados no son válidos', errores),
        { status: 400 },
      );
    }
    const actualizada = updateSucursal(Number(params.id), {
      nombre: body!.nombre,
      direccion: body!.direccion,
      telefono: body!.telefono,
      email: body!.email,
    });
    if (!actualizada) {
      return HttpResponse.json(
        mockError(404, 'Recurso no encontrado', `No existe la sucursal ${params.id}`),
        { status: 404 },
      );
    }
    return HttpResponse.json(actualizada);
  }),

  http.get(apiPath('/sucursales'), listarSucursales),
];
