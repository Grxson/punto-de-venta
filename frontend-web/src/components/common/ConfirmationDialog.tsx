import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';

/**
 * Diálogo genérico de confirmación reutilizable
 * 
 * Reemplaza la necesidad de escribir 70+ líneas de código de diálogo
 * en cada componente. Se usa para:
 * - Confirmar eliminación
 * - Confirmar cancelación
 * - Confirmar cambios importantes
 * - Confirmar cualquier acción destructiva
 * 
 * @example
 * <ConfirmationDialog
 *   open={isOpen}
 *   title="Eliminar Producto"
 *   message="¿Estás seguro de que deseas eliminar 'Molletes'?"
 *   severity="error"
 *   confirmText="Eliminar"
 *   isLoading={isDeleting}
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 */
interface ConfirmationDialogProps {
  /** Si el diálogo está abierto */
  open: boolean;

  /** Título del diálogo */
  title: string;

  /** Mensaje a mostrar (puede ser string o ReactNode para más control) */
  message: string | React.ReactNode;

  /** Texto del botón de confirmación */
  confirmText?: string;

  /** Texto del botón de cancelación */
  cancelText?: string;

  /** Tipo de severidad (warning, error, info) */
  severity?: 'warning' | 'error' | 'info' | 'success';

  /** Si está cargando (desactiva botones y muestra spinner) */
  isLoading?: boolean;

  /** Callback cuando el usuario confirma */
  onConfirm: () => void;

  /** Callback cuando el usuario cancela o cierra */
  onCancel: () => void;

  /** Color del botón de confirmación */
  confirmColor?: 'error' | 'warning' | 'success' | 'info';

  /** Máximo ancho del diálogo */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Mostrar un alert como header (no recomendado junto con message) */
  showAlert?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'warning',
  isLoading = false,
  onConfirm,
  onCancel,
  confirmColor = 'error',
  maxWidth = 'sm',
  showAlert = true,
}) => {
  const severityColors = {
    warning: '#f57c00',
    error: '#d32f2f',
    info: '#1976d2',
    success: '#388e3c',
  };

  const severityIcons = {
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    success: '✅',
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: '1.25rem',
          color: severityColors[severity],
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box component="span" sx={{ fontSize: '1.5rem' }}>
          {severityIcons[severity]}
        </Box>
        {title}
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {showAlert && typeof message === 'string' ? (
          <Alert severity={severity} sx={{ mb: 0 }}>
            <Typography variant="body2">{message}</Typography>
          </Alert>
        ) : typeof message === 'string' ? (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {message}
          </Typography>
        ) : (
          <Box sx={{ mt: 1 }}>{message}</Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          startIcon={<Close />}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={confirmColor}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Check />}
          sx={{ minWidth: '120px' }}
        >
          {isLoading ? 'Por favor espera...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
