/** Bandera mutable usada como cerrojo entre varias operaciones. */
export interface MutableBoolean {
  current: boolean;
}

/**
 * Crea un envoltorio que colapsa llamadas concurrentes en una sola ejecución.
 *
 * Se usa para que varias respuestas 401 simultáneas provoke un único refresh de
 * token en lugar de N: las llamadas que llegan mientras la primera está en
 * vuelo reciben la misma promesa.
 *
 * @returns Función que recibe la operación y devuelve la promesa compartida.
 */
export const createSingleFlight = <T>() => {
  let inFlight: Promise<T> | null = null;

  return (operation: () => Promise<T>): Promise<T> => {
    if (inFlight) {
      return inFlight;
    }

    const current = operation();
    inFlight = current;

    // Solo se libera si `inFlight` sigue siendo esta promesa: así una
    // operación posterior ya iniciada no se ve liberada por error.
    const clearCurrent = () => {
      if (inFlight === current) {
        inFlight = null;
      }
    };

    current.then(clearCurrent, clearCurrent);
    return current;
  };
};

/**
 * Intenta tomar el cerrojo.
 *
 * @param lock - Bandera a marcar.
 * @returns `true` si se consiguió el cerrojo y `false` si ya estaba tomado.
 */
export const acquireLock = (lock: MutableBoolean): boolean => {
  if (lock.current) {
    return false;
  }

  lock.current = true;
  return true;
};

/**
 * Libera el cerrojo tomado con `acquireLock`.
 *
 * @param lock - Bandera a liberar.
 */
export const releaseLock = (lock: MutableBoolean): void => {
  lock.current = false;
};

/**
 * Indica si el token con el que se construyó una petición ya no es el vigente.
 *
 * Marca el caso en que otra petición renovó el token mientras esta esperaba:
 * reintentarla con el token nuevo tiene sentido, porque su 401 se debió a
 * credenciales rancias y no por sesión expirada.
 *
 * @param requestAuthorization - Cabecera `Authorization` de la petición.
 * @param currentToken - Token vigente en `localStorage`, si lo hay.
 * @returns `true` solo si ambos existen y no coinciden.
 */
export const didAuthTokenChange = (
  requestAuthorization: string | undefined,
  currentToken: string | null,
): boolean => {
  return Boolean(
    requestAuthorization &&
    currentToken &&
    requestAuthorization !== `Bearer ${currentToken}`,
  );
};
