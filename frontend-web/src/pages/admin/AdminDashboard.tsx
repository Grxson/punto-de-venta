import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { TrendingUp, ShoppingCart, Inventory, AccountBalance } from '@mui/icons-material';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useDashboard } from '../../contexts/DashboardContext';

interface DailyStats {
  fecha: string;
  totalVentas: number;
  totalCostos: number;
  totalGastos: number; // Gastos operativos (no incluye costos de productos)
  margenBruto: number;
  cantidadVentas: number;
  itemsVendidos: number;
  ticketPromedio: number;
  margenPorcentaje: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [productosCount, setProductosCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDashboard();

  // Cargar datos iniciales al montar
  useEffect(() => {
    loadDashboardData();
  }, []); // Solo al montar

  // Escuchar cambios en refreshTrigger para recargar datos automáticamente
  useEffect(() => {
    if (refreshTrigger > 0) {
      requestAnimationFrame(() => {
        loadDashboardData();
      });
    }
  }, [refreshTrigger]); // Se ejecuta cuando refreshTrigger cambia

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas del día
      const statsResponse = await apiService.get(API_ENDPOINTS.STATS_DAILY);
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        const nuevosStats = {
          fecha: data.fecha || new Date().toISOString().split('T')[0],
          totalVentas: parseFloat(data.totalVentas) || 0,
          totalCostos: parseFloat(data.totalCostos) || 0,
          totalGastos: parseFloat(data.totalGastos) || 0,
          margenBruto: parseFloat(data.margenBruto) || 0,
          cantidadVentas: data.cantidadVentas || 0,
          itemsVendidos: data.itemsVendidos || 0,
          ticketPromedio: parseFloat(data.ticketPromedio) || 0,
          margenPorcentaje: parseFloat(data.margenPorcentaje) || 0,
        };
        setStats(nuevosStats);
      }

      // Cargar cantidad de productos
      const productosResponse = await apiService.get(API_ENDPOINTS.PRODUCTS);
      if (productosResponse.success && productosResponse.data) {
        const productos = Array.isArray(productosResponse.data) ? productosResponse.data : [];
        setProductosCount(productos.length);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { 
      title: 'Ventas Hoy', 
      value: `$${stats?.totalVentas.toFixed(2) || '0.00'}`, 
      icon: <TrendingUp />, 
      color: '#1976d2' 
    },
    { 
      title: 'Tickets', 
      value: stats?.cantidadVentas.toString() || '0', 
      icon: <ShoppingCart />, 
      color: '#2e7d32' 
    },
    { 
      title: 'Productos', 
      value: productosCount.toString(), 
      icon: <Inventory />, 
      color: '#ed6c02' 
    },
    { 
      title: 'Inventario', 
      value: `$${stats?.totalCostos.toFixed(2) || '0.00'}`, 
      icon: <AccountBalance />, 
      color: '#9c27b0' 
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mt: 2,
        }}
      >
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Box sx={{ color: stat.color, fontSize: '3rem' }}>
                  {stat.icon}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Información adicional - Resumen del Día */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resumen del Día
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Venta
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  ${stats?.totalVentas.toFixed(2) || '0.00'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Gastos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${(stats?.totalGastos || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Utilidad
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: (stats?.margenBruto || 0) >= 0 ? 'success.main' : 'error.main' }}>
                  ${stats?.margenBruto.toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Box>
            {stats && stats.cantidadVentas > 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats.cantidadVentas} ventas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ticket: ${stats.ticketPromedio.toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Items Vendidos
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {stats.itemsVendidos}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Margen
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: stats.margenPorcentaje >= 0 ? 'success.main' : 'error.main' }}>
                    {stats.margenPorcentaje.toFixed(2)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

