import React from 'react';
import { AuthProvider } from './AuthContext';
import { MenuProvider } from './MenuContext';
import { ReporteProvider } from './ReporteContext';

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
