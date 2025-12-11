import React, { useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { format } from 'date-fns';
import InventarioMovimientoTabla from '../../../components/reportes/InventarioMovimientoTabla';
import { useInventarioMovimiento } from '../../../hooks/useInventarioMovimiento';
import type { DateRangeValue } from '../../../types/dateRange.types';

interface InventarioMovimientoTabProps {
  dateRange: DateRangeValue;
}

/**
 * Tab para mostrar el reporte de movimiento de inventario.
 * Utiliza el rango de fechas proporcionado por el componente padre (AdminReports).
 */
export const InventarioMovimientoTab: React.FC<InventarioMovimientoTabProps> = ({ dateRange }) => {
  // Hook optimizado con caché automático
  const { reporte, cargando, error, refetch } = useInventarioMovimiento({
    fechaInicio: dateRange.desde,
    fechaFin: dateRange.hasta,
  });

  const handleRefresh = useCallback(() => {
    refetch(dateRange.desde, dateRange.hasta);
  }, [refetch, dateRange]);

  return (
    <Box>
      {/* Encabezado con botón de actualizar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Movimiento de Inventario por Producto
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={cargando}
          size="small"
        >
          Actualizar
        </Button>
      </Box>

      {/* Información del rango */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.main">
          📅 Mostrando datos de:{' '}
          <strong>{format(new Date(dateRange.desde), 'dd/MM/yyyy')}</strong> a{' '}
          <strong>{format(new Date(dateRange.hasta), 'dd/MM/yyyy')}</strong>
        </Typography>
        {reporte && (
          <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
            ✓ {reporte.diasOperacion.length} días con operación | {reporte.productos.length} productos
          </Typography>
        )}
      </Box>

      {/* Mensajes de estado */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {cargando && !reporte && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      )}

      {/* Tabla con datos */}
      {reporte && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <InventarioMovimientoTabla 
              reporte={reporte}
              cargando={cargando}
              error={error}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default InventarioMovimientoTab;
