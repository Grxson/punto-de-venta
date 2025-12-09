import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DeleteDialog } from '../../common/dialogs';
import type { Venta } from '../../../hooks/ventas';

interface VentaDeleteDialogProps {
  open: boolean;
  venta: Venta | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Diálogo para eliminar permanentemente una venta (solo admins)
 */
export default function VentaDeleteDialog({
  open,
  venta,
  loading = false,
  onConfirm,
  onCancel,
}: VentaDeleteDialogProps) {
  if (!venta) return null;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
        Eliminar Venta #{venta.id} Permanentemente
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            ⚠️ Esta es una acción irreversible. La venta será eliminada del sistema permanentemente y
            no podrá ser recuperada. Use esta opción solo en casos excepcionales.
          </Alert>

          <Box sx={{ mb: 2, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Venta a eliminar:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>ID:</strong> {venta.id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Fecha:</strong>{' '}
              {format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Total:</strong> ${venta.total.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Items:</strong> {venta.items.length} producto(s)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Estado:</strong> {venta.estado}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Eliminando...' : 'Eliminar Permanentemente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
