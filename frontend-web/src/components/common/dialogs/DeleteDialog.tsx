import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';

interface DeleteDialogProps {
  open: boolean;
  title: string;
  itemName: string;
  description?: string;
  requireConfirmationText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo especializado para eliminación con confirmación de texto
 * 
 * @example
 * <DeleteDialog
 *   open={showDialog}
 *   title="Eliminar producto"
 *   itemName="Molletes"
 *   description="Esta acción no se puede deshacer"
 *   requireConfirmationText="ELIMINAR"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 */
export default function DeleteDialog({
  open,
  title,
  itemName,
  description,
  requireConfirmationText,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const isConfirmed = !requireConfirmationText || confirmText === requireConfirmationText;

  const handleClose = () => {
    setConfirmText('');
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
    setConfirmText('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {description || 'Esta acción no se puede deshacer'}
          </Alert>

          <Box sx={{ mb: 2 }}>
            <strong>Elemento a eliminar:</strong> {itemName}
          </Box>

          {requireConfirmationText && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label={`Escribe "${requireConfirmationText}" para confirmar`}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={loading}
                placeholder={requireConfirmationText}
              />
              <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                Esta es una acción irreversible
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!isConfirmed || loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
