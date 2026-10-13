/**
 * Forma de error que devuelve el backend (`ErrorResponse` de
 * `GlobalExceptionHandler`) y que los mocks replican para que el cliente HTTP
 * la interprete igual en ambos modos.
 */
export interface MockErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  validationErrors?: Record<string, string>;
}

/**
 * Construye un cuerpo de error compatible con el backend.
 *
 * @param status - Código HTTP.
 * @param error - Categoría corta del error (p. ej. `Error de autenticación`).
 * @param message - Detalle mostrable al usuario.
 * @param validationErrors - Errores por campo en las validaciones 400.
 * @returns El cuerpo de error listo para serializar.
 */
export const mockError = (
  status: number,
  error: string,
  message: string,
  validationErrors?: Record<string, string>,
): MockErrorBody => ({
  timestamp: new Date().toISOString(),
  status,
  error,
  message,
  ...(validationErrors ? { validationErrors } : {}),
});
