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
import { TrendingUp, TrendingDown, ExpandMore, NorthWest } from '@mui/icons-material';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import apiService from '../services/api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { websocketService } from '../services/websocket.service';
import { getTodayLocalDate, toLocalISOString } from '../utils/dateHelper';

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

interface DesglosePago {
  metodoPago: string;
  total: number;
}

export default function DailyStatsPanel() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [desglosePagos, setDesglosePagos] = useState<DesglosePago[]>([]);
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

      // ✅ Enviar la fecha del cliente para evitar problemas de zona horaria
      const fechaHoy = getTodayLocalDate();

      // Cargar estadísticas del día
      const response = await apiService.get(`${API_ENDPOINTS.STATS_DAILY}?fecha=${fechaHoy}`);
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
        console.warn('[DailyStatsPanel] Stats response sin success o data:', response);
      }

      // ✅ CORRECCIÓN: Usar toLocalISOString para evitar conversión a UTC
      const hoy = new Date();
      const inicioDiaLocal = startOfDay(hoy); // Inicio del día en zona horaria local (00:00:00)
      const finDiaLocal = endOfDay(hoy);     // Fin del día en zona horaria local (23:59:59)
      
      // ✅ Convertir a formato local ISO SIN conversión a UTC
      const fechaStr = getTodayLocalDate(); // "2025-12-19"
      const inicioDiaISO = toLocalISOString(fechaStr, '00:00:00');
      const finDiaISO = toLocalISOString(fechaStr, '23:59:59');

      console.log('[DailyStatsPanel] Dates correctas (zone local):', { 
        inicioDiaISO, 
        finDiaISO,
        horaLocalInicio: format(inicioDiaLocal, 'HH:mm:ss'),
        horaLocalFin: format(finDiaLocal, 'HH:mm:ss'),
      });

      const desgloseResponse = await apiService.get(
        `${API_ENDPOINTS.SALES}/resumen/metodos-pago?desde=${inicioDiaISO}&hasta=${finDiaISO}`
      );

      console.log('[DailyStatsPanel] Respuesta desglose:', desgloseResponse);

      if (desgloseResponse.success && Array.isArray(desgloseResponse.data)) {
        const datosValidos = desgloseResponse.data
          .filter((item: any) => {
            // Validar que item tenga estructuras esperadas
            const tieneMetodoPago = item && typeof item.metodoPago === 'string' && item.metodoPago.trim();
            const tieneTotal = item && (typeof item.total === 'number' || typeof item.total === 'string');
            return tieneMetodoPago && tieneTotal;
          })
          .map((item: any) => {
            const total = typeof item.total === 'string' ? parseFloat(item.total) : Number(item.total);
            return {
              metodoPago: item.metodoPago.trim(),
              total: isNaN(total) ? 0 : total,
            };
          });

        console.log('[DailyStatsPanel] Desglose procesado:', datosValidos);
        setDesglosePagos(datosValidos);

        if (datosValidos.length === 0 && Array.isArray(desgloseResponse.data) && desgloseResponse.data.length > 0) {
          console.warn('[DailyStatsPanel] Desglose recibido pero sin datos válidos:', desgloseResponse.data);
        }
      } else if (!desgloseResponse.success) {
        console.warn('[DailyStatsPanel] Desglose response sin success:', desgloseResponse);
        setDesglosePagos([]);
      } else if (!Array.isArray(desgloseResponse.data)) {
        console.error('[DailyStatsPanel] Desglose data no es array:', typeof desgloseResponse.data, desgloseResponse.data);
        setDesglosePagos([]);
      }

      if (!response.success) {
        setError('Error al cargar estadísticas');
      }
    } catch (err: any) {
      console.error('[DailyStatsPanel] Error en loadStats:', err);
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Neto = Efectivo - Gastos
  const efectivoTotal = desglosePagos.find((p) => p.metodoPago?.toLowerCase() === 'efectivo')?.total ?? 0;
  const neto = efectivoTotal - (stats ? (stats.totalGastos || 0) : 0);

  // Ordenar métodos de pago: Transferencia, Tarjeta, Efectivo (y luego cualquiera extra)
  const ordenMetodos = ['Transferencia', 'Tarjeta', 'Efectivo'];
  const desgloseOrdenado = desglosePagos && desglosePagos.length > 0
    ? [...desglosePagos].sort((a, b) => {
        const ai = ordenMetodos.indexOf(a.metodoPago);
        const bi = ordenMetodos.indexOf(b.metodoPago);
        const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
        const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
        return av === bv ? a.metodoPago.localeCompare(b.metodoPago) : av - bv;
      })
    : [];

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
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ ml: 1 }}>
              Resumen del Día
            </Typography>
            {stats && (
              <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
                {format(new Date(), "EEEE dd 'de' MMMM", { locale: es })}
              </Typography>
            )}
          </Box>
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

                  {/* Desglose de métodos de pago */}
                  {desgloseOrdenado.length > 0 && (
                    <Box
                      sx={{
                        ml: 2,
                        mb: 1,
                        p: 1,
                        backgroundColor: 'action.hover',
                        borderRadius: 1,
                      }}
                    >
                      {desgloseOrdenado.map((desglose) => (
                        <Box
                          key={desglose.metodoPago}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            mb: 0.5,
                            '&:last-child': { mb: 0 },
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {desglose.metodoPago}
                          </Typography>
                          <Typography variant="caption" color="text.primary" fontWeight="medium">
                            ${desglose.total.toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

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
                      {neto >= 0 ? (
                        <TrendingUp sx={{ color: 'success.main', fontSize: 18 }} />
                      ) : (
                        <TrendingDown sx={{ color: 'error.main', fontSize: 18 }} />
                      )}
                      <Typography variant="body2" fontWeight="bold" color="text.secondary">
                        Neto
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color={neto >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      ${neto.toFixed(2)}
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

