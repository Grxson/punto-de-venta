import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'info' | 'warning' | 'error' | 'success';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo genérico de confirmación reutilizable
 * 
 * @example
 * <ConfirmDialog
 *   open={showDialog}
 *   title="Eliminar usuario"
 *   message="¿Estás seguro de que deseas eliminar a Juan?"
 *   variant="error"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const severityMap = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'success',
  } as const;

  const buttonVariantMap = {
    info: 'primary',
    warning: 'warning',
    error: 'error',
    success: 'success',
  } as const;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity={severityMap[variant]}>{message}</Alert>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={buttonVariantMap[variant]}
          disabled={loading}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
