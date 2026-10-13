import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index.ts';
import { resetMockData } from './db.ts';
import { setMockScenario, type MockScenario } from './scenarios.ts';

/** Service Worker de MSW con todos los handlers del modo mock. */
export const worker = setupWorker(...handlers);

/** Utilidades que se exponen en la consola del navegador durante el desarrollo. */
interface MockControls {
  reset: () => void;
  scenario: (name: MockScenario) => void;
}

/**
 * Arranca la interceptación de peticiones.
 *
 * Debe llamarse (y esperarse) antes de renderizar React para que ninguna
 * petición inicial escape sin ser interceptada. Nunca se inicia en un build de
 * producción, aunque el modo mock se active por error.
 */
export async function startMockWorker(): Promise<void> {
  if (import.meta.env.PROD) {
    throw new Error('MSW no debe iniciarse en un build de producción.');
  }

  await worker.start({
    onUnhandledRequest: 'warn',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });

  const controls: MockControls = {
    reset: () => resetMockData(),
    scenario: (name) => setMockScenario(name),
  };
  (window as unknown as { __MOCKS__: MockControls }).__MOCKS__ = controls;

  console.info(
    '[mocks] MSW activo. Utilidades en consola: __MOCKS__.reset(), __MOCKS__.scenario(\'empty\'|\'error\'|\'unauthorized\')',
  );
}
