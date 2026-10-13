import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/**
 * Estado global de refresco del dashboard.
 *
 * Se expone un contador y no datos del dashboard para que cualquier sección
 * pueda pedir una recarga sin conocer qué consultas están suscritas.
 */
interface DashboardContextType {
  /** Contador que se incrementa en cada petición de refresco; útil como dependencia de efectos. */
  refreshTrigger: number;
  /** Incrementa `refreshTrigger` para forzar la recarga de los datos del dashboard. */
  triggerRefresh: () => void;
}

/**
 * Contexto de refresco del dashboard. Se crea como `undefined` para detectar usos fuera del proveedor.
 */
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

/**
 * Proveedor del disparador de refresco del dashboard.
 *
 * @param props.children - Árbol de componentes que recibe el contexto.
 */
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []); // Sin dependencias: se mantiene estable entre renders

  return (
    <DashboardContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

/**
 * Hook de acceso al disparador de refresco del dashboard.
 *
 * @returns El contador `refreshTrigger` y la acción `triggerRefresh`.
 * @throws Error Si se usa fuera de {@link DashboardProvider}.
 */
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

