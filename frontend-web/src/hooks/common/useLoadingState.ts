import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

/**
 * Hook para manejar múltiples estados de carga
 * 
 * @example
 * const { isLoading, setLoading, startLoading, stopLoading } = useLoadingState();
 * 
 * // Iniciar carga
 * startLoading('guardarVenta');
 * 
 * // Detener carga
 * stopLoading('guardarVenta');
 * 
 * // Verificar si está cargando
 * if (isLoading('guardarVenta')) { ... }
 */
export function useLoadingState(initial?: LoadingState) {
  const [loadingState, setLoadingState] = useState<LoadingState>(initial || {});

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isLoading = useCallback(
    (key: string) => loadingState[key] || false,
    [loadingState]
  );

  const anyLoading = Object.values(loadingState).some((v) => v);

  return {
    loadingState,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    anyLoading,
  };
}
