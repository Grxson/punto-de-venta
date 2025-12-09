import { useState, useCallback } from 'react';

interface SnackbarState {
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

/**
 * Hook para manejar notificaciones (snackbar)
 * 
 * @example
 * const { snackbar, showSnackbar, hideSnackbar } = useSnackbar();
 * 
 * showSnackbar('Guardado exitosamente', 'success');
 * 
 * <Snackbar open={snackbar.open} onClose={hideSnackbar}>
 *   <Alert severity={snackbar.type}>{snackbar.message}</Alert>
 * </Snackbar>
 */
export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    type: 'info',
  });

  const showSnackbar = useCallback(
    (message: string, type: SnackbarState['type'] = 'info') => {
      setSnackbar({
        open: true,
        message,
        type,
      });
    },
    []
  );

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
  };
}
