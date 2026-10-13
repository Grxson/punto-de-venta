import React from 'react';
import { AuthProvider } from './AuthContext';
import { MenuProvider } from './MenuContext';
import { ReporteProvider } from './ReporteContext';

/**
 * Agregador de los proveedores de contexto de la aplicación.
 *
 * El orden es significativo: `AuthProvider` envuelve a los demás porque
 * `MenuProvider` y `ReporteProvider` consumen `useAuth` (sucursal y rol) para
 * decidir qué datos cargar.
 *
 * @param props.children Subárbol que hereda todo el estado global.
 * @returns Los tres proveedores anidados alrededor de `children`.
 */
export function AppContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MenuProvider>
        <ReporteProvider>
          {children}
        </ReporteProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
