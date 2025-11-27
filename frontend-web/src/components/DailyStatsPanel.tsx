import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, ExpandMore } from '@mui/icons-material';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { websocketService } from '../services/websocket.service';

interface DailyStats {
  fecha: string;
  totalVentas: number;
  totalCostos: number;
  totalGastos?: number; // Gastos operativos (separado de costos de productos)
  margenBruto: number;
  cantidadVentas: number;
  itemsVendidos: number;
  ticketPromedio: number;
  margenPorcentaje: number;
}

export default function DailyStatsPanel() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    
    // Escuchar eventos WebSocket para actualización inmediata
    const unsubscribeEstadisticas = websocketService.on('estadisticas', (message) => {
      if (message.tipo === 'ESTADISTICAS_ACTUALIZADAS') {
        loadStats(); // Actualizar inmediatamente
      }
    });
    
    const unsubscribeVentas = websocketService.on('ventas', (message) => {
      if (message.tipo === 'VENTA_CREADA') {
        loadStats(); // Actualizar inmediatamente
      }
    });
    
    // Actualizar cada 30 segundos como fallback
    const interval = setInterval(loadStats, 30000);
    
    return () => {
      unsubscribeEstadisticas();
      unsubscribeVentas();
      clearInterval(interval);
    };
  }, []);

  const loadStats = async () => {
    try {
      setError(null);
      const response = await apiService.get(API_ENDPOINTS.STATS_DAILY);
      if (response.success && response.data) {
        const data = response.data;
        setStats({
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          totalVentas: parseFloat(data.totalVentas) || 0,
          totalCostos: parseFloat(data.totalCostos) || 0,
          totalGastos: parseFloat(data.totalGastos) || 0,
          margenBruto: parseFloat(data.margenBruto) || 0,
          cantidadVentas: data.cantidadVentas || 0,
          itemsVendidos: data.itemsVendidos || 0,
          ticketPromedio: parseFloat(data.ticketPromedio) || 0,
          margenPorcentaje: parseFloat(data.margenPorcentaje) || 0,
        });
      } else {
        setError('Error al cargar estadísticas');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const utilidad = stats ? stats.totalVentas - stats.totalCostos : 0;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 1000,
        minWidth: '280px',
        maxWidth: '320px',
      }}
    >
      <Card
        sx={{
          backgroundColor: 'background.paper',
          boxShadow: 4,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderBottom: expanded ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ ml: 1 }}>
            Resumen del Día
          </Typography>
          <Box>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ mr: 0.5 }}
            >
              <ExpandMore
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                }}
              />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <CardContent sx={{ pt: 2, pb: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Typography variant="body2" color="error" align="center">
                {error}
              </Typography>
            ) : stats ? (
              <Box>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Venta
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ${stats.totalVentas.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Gastos
                    </Typography>
                    <Typography variant="h6" color="error" fontWeight="bold">
                      ${(stats.totalGastos || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {utilidad >= 0 ? (
                        <TrendingUp sx={{ color: 'success.main', fontSize: 18 }} />
                      ) : (
                        <TrendingDown sx={{ color: 'error.main', fontSize: 18 }} />
                      )}
                      <Typography variant="body2" fontWeight="bold" color="text.secondary">
                        Utilidad
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color={utilidad >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      ${utilidad.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="caption">
                    {stats.cantidadVentas} ventas
                  </Typography>
                  <Typography variant="caption">
                    Ticket: ${stats.ticketPromedio.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center">
                No hay datos disponibles
              </Typography>
            )}
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
}

