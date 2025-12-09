import React, { useState, useCallback } from 'react';
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
import { getTodayLocalDate, getDateWithOffset } from '../../../utils/dateHelper';
import DateRangeFilter from '../../../components/common/DateRangeFilter';
import InventarioMovimientoTabla from '../../../components/reportes/InventarioMovimientoTabla';
import { useInventarioMovimiento } from '../../../hooks/useInventarioMovimiento';
import type { DateRangeValue } from '../../../types/dateRange.types';

/**
 * Tab para mostrar el reporte de movimiento de inventario.
 * Ejemplo de integración del nuevo componente optimizado.
 */
export const InventarioMovimientoTab: React.FC = () => {
  const todayLocal = getTodayLocalDate();
  const sevenDaysAgo = getDateWithOffset(-6); // Última semana
  
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: sevenDaysAgo,
    hasta: todayLocal,
  });

  // Hook optimizado con caché automático
  const { reporte, cargando, error, refetch } = useInventarioMovimiento({
    fechaInicio: dateRange.desde,
    fechaFin: dateRange.hasta,
  });

  const handleDateRangeChange = useCallback((newRange: DateRangeValue) => {
    setDateRange(newRange);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch(dateRange.desde, dateRange.hasta);
  }, [refetch, dateRange]);

  return (
    <Box>
      {/* Encabezado con filtro de fechas */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Movimiento de Inventario por Producto
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={cargando}
        >
          Actualizar
        </Button>
      </Box>

      {/* Filtro de fechas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <DateRangeFilter 
            onChange={handleDateRangeChange} 
            initialRange={dateRange}
            label="Seleccionar rango de fechas"
          />
          
          {/* Información del rango */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
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
        </CardContent>
      </Card>

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

      {/* Info de optimización */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          ✨ Este reporte está optimizado para respuestas rápidas:
          <ul>
            <li>Solo muestra días donde hubo operación (sin columnas vacías)</li>
            <li>Datos cacheados automáticamente por sucursal y rango</li>
            <li>Renderizado eficiente con React.memo</li>
            <li>Una sola query al backend con eager loading</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
};

export default InventarioMovimientoTab;
