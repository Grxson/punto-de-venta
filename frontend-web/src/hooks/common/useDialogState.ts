import { useState, useCallback } from 'react';

/**
 * Hook para manejar estado de diálogos múltiples
 * 
 * @example
 * const { dialogs, openDialog, closeDialog, toggleDialog } = useDialogState(['edit', 'delete', 'cancel']);
 * 
 * <Dialog open={dialogs.edit} onClose={() => closeDialog('edit')}>
 *   ...
 * </Dialog>
 */
export function useDialogState(dialogNames: string[]) {
  const [dialogs, setDialogs] = useState<Record<string, boolean>>(
    dialogNames.reduce((acc, name) => ({ ...acc, [name]: false }), {})
  );

  const openDialog = useCallback((name: string) => {
    setDialogs((prev) => ({ ...prev, [name]: true }));
  }, []);

  const closeDialog = useCallback((name: string) => {
    setDialogs((prev) => ({ ...prev, [name]: false }));
  }, []);

  const toggleDialog = useCallback((name: string) => {
    setDialogs((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  return {
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog,
  };
}
