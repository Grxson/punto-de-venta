import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Venta } from '../../../hooks/ventas';

interface VentaCancelDialogProps {
  open: boolean;
  venta: Venta | null;
  loading?: boolean;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

/**
 * Diálogo para cancelar una venta con motivo
 */
export default function VentaCancelDialog({
  open,
  venta,
  loading = false,
  onConfirm,
  onCancel,
}: VentaCancelDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setError('El motivo es obligatorio');
      return;
    }
    onConfirm(motivo);
    setMotivo('');
    setError(null);
  };

  const handleClose = () => {
    setMotivo('');
    setError(null);
    onCancel();
  };

  if (!venta) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: 'warning.main', fontWeight: 'bold' }}>
        Cancelar Venta #{venta.id}
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta acción cancelará la venta y revertirá los movimientos de inventario asociados. Esta
          acción no se puede deshacer.
        </Alert>

        {venta && (
          <Box sx={{ mb: 3 }}>
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
          </Box>
        )}

        <TextField
          fullWidth
          label="Motivo de cancelación *"
          multiline
          rows={4}
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            setError(null);
          }}
          disabled={loading}
          error={!!error}
          helperText={error}
          placeholder="Ej: Cambio de opinión del cliente, error en el pedido, etc."
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Mantener Venta
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? 'Cancelando...' : 'Cancelar Venta'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
