/**
 * Escenarios de error y casos límite activables en caliente durante el
 * desarrollo con mocks.
 *
 * No forman parte del contrato: solo permiten forzar estados de interfaz
 * (vacío, error de servidor, sin permisos) sin tocar los handlers.
 */
export type MockScenario = 'empty' | 'error' | 'unauthorized' | null;

let current: MockScenario = null;

/**
 * Activa un escenario para las siguientes peticiones de listado.
 *
 * @param scenario - Escenario a forzar, o `null` para volver al comportamiento normal.
 */
export const setMockScenario = (scenario: MockScenario): void => {
  current = scenario;
};

/** @returns El escenario activo, o `null` si no hay ninguno. */
export const getMockScenario = (): MockScenario => current;

/** Vuelve al comportamiento normal. */
export const clearMockScenario = (): void => {
  current = null;
};
