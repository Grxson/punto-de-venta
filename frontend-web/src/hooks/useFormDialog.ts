import { useState, useCallback } from 'react';

/**
 * Hook genérico para gestionar el estado de un diálogo de formulario
 * 
 * Soporta: crear, editar, eliminar en el mismo diálogo
 * Reduce 50+ líneas de state declarations
 * 
 * @example
 * const formDialog = useFormDialog<Producto>();
 * 
 * // Abrir para crear
 * formDialog.openDialog();
 * 
 * // Abrir para editar
 * formDialog.openDialog(productoExistente);
 * 
 * // En el JSX
 * <FormDialog
 *   open={formDialog.open}
 *   title={formDialog.data ? 'Editar' : 'Crear'}
 *   isLoading={formDialog.isLoading}
 *   error={formDialog.error}
 *   onClose={() => formDialog.closeDialog()}
 *   onSubmit={async (values) => {
 *     formDialog.setLoading(true);
 *     try {
 *       if (formDialog.data?.id) {
 *         await api.put(...);
 *       } else {
 *         await api.post(...);
 *       }
 *       formDialog.closeDialog();
 *     } catch (err) {
 *       formDialog.setError(err.message);
 *     }
 *   }}
 * />
 */
interface FormDialogState<T> {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

export const useFormDialog = <T,>(initialData?: T) => {
  const [state, setState] = useState<FormDialogState<T>>({
    open: false,
    isLoading: false,
    error: null,
    data: initialData || null,
  });

  const openDialog = useCallback((item?: T) => {
    setState(prev => ({
      ...prev,
      open: true,
      data: item || null,
      error: null, // Limpiar error cuando se abre
      isLoading: false,
    }));
  }, []);

  const closeDialog = useCallback(() => {
    if (state.isLoading) return; // No cerrar mientras está cargando
    setState(prev => ({
      ...prev,
      open: false,
      data: null,
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

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const isEditing = state.data !== null;

  return {
    open: state.open,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
    isEditing,
    openDialog,
    closeDialog,
    setLoading,
    setError,
    setData,
    resetError,
  };
};
