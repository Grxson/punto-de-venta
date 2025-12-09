import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  AlertColor,
} from '@mui/material';
import { Save, X } from '@mui/icons-material';

/**
 * Diálogo genérico de formulario reutilizable
 * 
 * Reemplaza la necesidad de escribir 150+ líneas de código de diálogo
 * en cada componente. Se usa para:
 * - Crear nuevos elementos
 * - Editar elementos existentes
 * - Formularios en general
 * 
 * @example
 * <FormDialog
 *   open={formDialog.open}
 *   title={formDialog.isEditing ? 'Editar Producto' : 'Nuevo Producto'}
 *   isLoading={formDialog.isLoading}
 *   error={formDialog.error}
 *   onClose={() => formDialog.closeDialog()}
 *   onSubmit={handleSave}
 * >
 *   <TextField
 *     label="Nombre"
 *     value={nombre}
 *     onChange={(e) => setNombre(e.target.value)}
 *     fullWidth
 *   />
 *   {/* resto de campos... */}
 * </FormDialog>
 */
interface FormDialogProps {
  /** Si el diálogo está abierto */
  open: boolean;

  /** Título del diálogo */
  title: string;

  /** Si está cargando (desactiva botones y muestra spinner) */
  isLoading?: boolean;

  /** Mensaje de error a mostrar */
  error?: string | null;

  /** Callback cuando se cierra el diálogo */
  onClose: () => void;

  /** Callback cuando se envía el formulario */
  onSubmit: () => void;

  /** Contenido del formulario (TextField, Select, etc.) */
  children: React.ReactNode;

  /** Texto del botón de envío */
  submitText?: string;

  /** Texto del botón de cancelación */
  cancelText?: string;

  /** Color del botón de envío */
  submitColor?: 'primary' | 'success' | 'error' | 'warning';

  /** Si el botón de envío está deshabilitado */
  submitDisabled?: boolean;

  /** Máximo ancho del diálogo */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /** Tipo de severidad para el error alert */
  errorSeverity?: AlertColor;
}

export const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  isLoading = false,
  error = null,
  onClose,
  onSubmit,
  children,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  submitColor = 'primary',
  submitDisabled = false,
  maxWidth = 'md',
  errorSeverity = 'error',
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 2,
        }}
      >
        {error && (
          <Alert
            severity={errorSeverity}
            onClose={undefined}
            sx={{
              mb: 1,
            }}
          >
            {error}
          </Alert>
        )}
        {children}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          variant="outlined"
          startIcon={<X />}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isLoading || submitDisabled}
          variant="contained"
          color={submitColor}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
          sx={{
            minWidth: '120px',
            fontWeight: 'bold',
          }}
        >
          {isLoading ? 'Por favor espera...' : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
