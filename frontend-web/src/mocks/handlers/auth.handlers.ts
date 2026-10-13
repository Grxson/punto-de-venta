import { http, HttpResponse } from 'msw';
import { apiPath } from './apiPath.ts';
import { mockError } from '../errors.ts';
import { credencialesMock, tokenMock, usuariosMock } from '../fixtures/usuarios.ts';

/** Cuerpo esperado en el login. */
interface LoginBody {
  username?: string;
  password?: string;
}

/**
 * Handlers de autenticación, alineados con `/api/auth/*` del backend.
 *
 * - `POST /api/auth/login` → 200 `{ token, usuario, mensaje }` o 401/403.
 * - `POST /api/auth/logout` → 200 `{ mensaje }`.
 * - `POST /api/auth/refresh-token` → 200 `{ token, usuario, mensaje }`.
 * - `GET /api/version` → 200 con datos de versión de ejemplo.
 */
export const authHandlers = [
  http.post(apiPath('/auth/login'), async ({ request }) => {
    const body = (await request.json().catch(() => null)) as LoginBody | null;

    if (!body?.username || !body?.password) {
      return HttpResponse.json(
        mockError(400, 'Error de validación', 'Los datos proporcionados no son válidos', {
          username: 'El username es requerido',
          password: 'La contraseña es requerida',
        }),
        { status: 400 },
      );
    }

    const usuario = usuariosMock.find((u) => u.username === body.username);
    if (!usuario || credencialesMock[body.username] !== body.password) {
      return HttpResponse.json(
        mockError(401, 'Error de autenticación', 'Credenciales inválidas'),
        { status: 401 },
      );
    }

    if (!usuario.activo) {
      return HttpResponse.json(
        mockError(403, 'Acceso denegado', 'El usuario está inactivo'),
        { status: 403 },
      );
    }

    return HttpResponse.json({
      token: tokenMock,
      usuario: { ...usuario, ultimoAcceso: new Date().toISOString() },
      mensaje: 'Inicio de sesión correcto',
    });
  }),

  http.post(apiPath('/auth/logout'), () =>
    HttpResponse.json({ mensaje: 'Sesión cerrada correctamente' }),
  ),

  http.post(apiPath('/auth/refresh-token'), () =>
    HttpResponse.json({
      token: tokenMock,
      usuario: usuariosMock[0],
      mensaje: 'Token renovado',
    }),
  ),

  http.get(apiPath('/version'), () =>
    HttpResponse.json({ version: 'mock-1.0.0', nombre: 'Punto de Venta', entorno: 'mock' }),
  ),
];
