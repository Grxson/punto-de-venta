import { useState, useCallback } from 'react';

/**
 * Hook para gestionar el estado de un diálogo de confirmación
 * 
 * Elimina la necesidad de escribir 40+ líneas de state declarations
 * para manejar: open, isLoading, error
 * 
 * @example
 * const confirmDialog = useConfirmDialog();
 * 
 * // En el JSX
 * <ConfirmationDialog
 *   open={confirmDialog.open}
 *   title="Confirmar"
 *   message="¿Estás seguro?"
 *   isLoading={confirmDialog.isLoading}
 *   onConfirm={async () => {
 *     confirmDialog.setLoading(true);
 *     try {
 *       await api.delete(...);
 *       confirmDialog.closeDialog();
 *     } catch (err) {
 *       confirmDialog.setError(err.message);
 *     }
 *   }}
 *   onCancel={() => confirmDialog.closeDialog()}
 * />
 */
interface ConfirmDialogState {
  open: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useConfirmDialog = () => {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    isLoading: false,
    error: null,
  });

  const openDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      open: true,
      error: null, // Limpiar error cuando se abre
    }));
  }, []);

  const closeDialog = useCallback(() => {
    if (state.isLoading) return; // No cerrar mientras está cargando
    setState(prev => ({
      ...prev,
      open: false,
      isLoading: false,
      error: null,
    }));
  }, [state.isLoading]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    open: state.open,
    isLoading: state.isLoading,
    error: state.error,
    openDialog,
    closeDialog,
    setLoading,
    setError,
    resetError,
  };
};
