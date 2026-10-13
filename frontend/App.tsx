import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppContextProvider } from './src/contexts/AppContextProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * Componente raíz de la aplicación.
 *
 * Define el orden de los proveedores de contexto: `SafeAreaProvider` va por
 * fuera porque el resto de la app depende de las métricas de área segura
 * (barra de estado, notch) para posicionar el contenido.
 *
 * @returns El árbol de proveedores con el `RootNavigator` como contenido.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <RootNavigator />
      </AppContextProvider>
    </SafeAreaProvider>
  );
}