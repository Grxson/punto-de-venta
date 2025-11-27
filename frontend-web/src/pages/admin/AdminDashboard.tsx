import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingCart, 
  Inventory, 
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useDashboard } from '../../contexts/DashboardContext';

interface DailyStats {
  fecha: string;
  totalVentas: number;
  totalCostos: number;
  totalGastos: number;
  margenBruto: number;
  cantidadVentas: number;
  itemsVendidos: number;
  ticketPromedio: number;
  margenPorcentaje: number;
}

interface ProductoRendimiento {
  productoId: number;
  nombre: string;
  precio?: number;
  costoEstimado?: number;
  margenUnitario?: number;
  margenPorcentaje?: number;
  unidadesVendidas: number;
  ingresoTotal: number;
  costoTotal?: number;
  margenBrutoTotal?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [productosCount, setProductosCount] = useState<number>(0);
  const [topProductos, setTopProductos] = useState<ProductoRendimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDashboard();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadDashboardData();
    }
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      if (refreshTrigger === 0) {
        setLoading(true);
      }
      setError(null);

      const statsResponse = await apiService.get(API_ENDPOINTS.STATS_DAILY);
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
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
      }

      const productosResponse = await apiService.get(API_ENDPOINTS.PRODUCTS);
      if (productosResponse.success && productosResponse.data) {
        const productos = Array.isArray(productosResponse.data) ? productosResponse.data : [];
        setProductosCount(productos.length);
      }

      const fechaHoy = new Date().toISOString().split('T')[0];
      const topProductosResponse = await apiService.get(`${API_ENDPOINTS.STATS_PRODUCTS_DAY}?fecha=${fechaHoy}&limite=5`);
      if (topProductosResponse.success && topProductosResponse.data) {
        setTopProductos(Array.isArray(topProductosResponse.data) ? topProductosResponse.data : []);
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
      bgColor: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    },
    { 
      title: 'Tickets', 
      value: stats?.cantidadVentas.toString() || '0', 
      icon: <ShoppingCart />, 
      bgColor: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
    },
    { 
      title: 'Productos', 
      value: productosCount.toString(), 
      icon: <Inventory />, 
      bgColor: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
    },
    { 
      title: 'Utilidad', 
      value: `$${stats?.margenBruto.toFixed(2) || '0.00'}`, 
      icon: <AttachMoney />, 
      bgColor: stats?.margenBruto && stats.margenBruto >= 0 
        ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
        : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
    },
  ];

  const pieData = stats ? [
    { name: 'Ventas', value: stats.totalVentas, color: '#1976d2' },
    { name: 'Gastos', value: stats.totalGastos, color: '#d32f2f' },
    { name: 'Utilidad', value: stats.margenBruto, color: stats.margenBruto >= 0 ? '#2e7d32' : '#d32f2f' },
  ].filter(item => item.value > 0) : [];

  const barData = topProductos
    .filter(p => p && p.nombre)
    .map((p) => ({
      name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
      ingreso: p.ingresoTotal || 0,
      cantidad: p.unidadesVendidas || 0,
    }));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        {stats && (
          <Typography variant="body2" color="text.secondary">
            {new Date(stats.fecha).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Cards principales - 4 en fila */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboardStats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                background: stat.bgColor,
                color: 'white',
                height: '100%',
                minHeight: 140,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '1.75rem' }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Resumen del Día */}
      {stats && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Resumen del Día
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Venta Total</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${stats.totalVentas.toFixed(2)}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Gastos Operativos</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${stats.totalGastos.toFixed(2)}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Utilidad Neta</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {stats.margenBruto >= 0 ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                  ${stats.margenBruto.toFixed(2)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>Margen %</Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{stats.margenPorcentaje.toFixed(2)}%</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Gráficos - 2 en fila */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Gráfico de Donut */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', minHeight: 450 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Distribución Financiera del Día
              </Typography>
              <Box sx={{ flex: 1, minHeight: 350 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value: string) => <span style={{ fontSize: '14px' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">No hay datos para mostrar</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Top 5 Productos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', minHeight: 450 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Top 5 Productos del Día
              </Typography>
              {topProductos.length > 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Bar dataKey="ingreso" fill="#1976d2" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  <List sx={{ flex: 1, overflow: 'auto' }}>
                    {topProductos.filter(p => p && p.nombre).map((producto, index) => (
                      <ListItem 
                        key={producto.productoId} 
                        sx={{ px: 0, py: 1, borderBottom: index < topProductos.length - 1 ? '1px solid #eee' : 'none' }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Chip label={`#${index + 1}`} size="small" color="primary" sx={{ fontWeight: 'bold', fontSize: '0.75rem' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 'medium' }}>{producto.nombre}</Typography>}
                          secondary={`${producto.unidadesVendidas || 0} vendidos`}
                        />
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                          ${(producto.ingresoTotal || 0).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <Typography color="text.secondary">No hay productos vendidos hoy</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Métricas Adicionales - 6 en fila */}
      {stats && stats.cantidadVentas > 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Métricas Adicionales
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd', height: '100%' }}>
                  <AccountBalance sx={{ color: '#1976d2', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Total Ventas</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{stats.cantidadVentas}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9', height: '100%' }}>
                  <ShoppingCart sx={{ color: '#2e7d32', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Ticket Promedio</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>${stats.ticketPromedio.toFixed(2)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0', height: '100%' }}>
                  <Inventory sx={{ color: '#ed6c02', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Items Vendidos</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ed6c02' }}>{stats.itemsVendidos}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f3e5f5', height: '100%' }}>
                  <AttachMoney sx={{ color: '#9c27b0', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Promedio/Item</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    ${stats.itemsVendidos > 0 ? (stats.totalVentas / stats.itemsVendidos).toFixed(2) : '0.00'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee', height: '100%' }}>
                  <TrendingUp sx={{ color: '#d32f2f', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Costos Productos</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>${stats.totalCostos.toFixed(2)}</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#e0f7fa', height: '100%' }}>
                  <AccountBalance sx={{ color: '#00838f', fontSize: 28, mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="block">Margen Bruto</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: stats.margenBruto >= 0 ? '#00838f' : '#d32f2f' }}>
                    {stats.margenPorcentaje.toFixed(1)}%
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
