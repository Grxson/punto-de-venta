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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [productos, setProductos] = useState<any[]>([]);
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
        const productosData = Array.isArray(productosResponse.data) ? productosResponse.data : [];
        setProductosCount(productosData.length);
        setProductos(productosData);
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
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: 4 }}>
      {/* Header Premium */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        p: 4,
        mb: 3,
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)'
      }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          Dashboard Administrativo
        </Typography>
        {stats && (
          <Typography variant="body1" sx={{ opacity: 0.95 }}>
            📅 {format(new Date(stats.fecha), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
          </Typography>
        )}
      </Box>

      <Box sx={{ px: { xs: 2, md: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* KPI Cards - 4 en fila con estilos mejorados */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {dashboardStats.map((stat, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card
                sx={{
                  background: stat.bgColor,
                  color: 'white',
                  height: '100%',
                  minHeight: 150,
                  transition: 'all 0.3s ease',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  '&:hover': { 
                    transform: 'translateY(-8px)', 
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1.5, fontWeight: 500 }}>
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: '2rem', lineHeight: 1 }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      borderRadius: '12px',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Box sx={{ fontSize: 28 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Resumen del Día - Premium Card */}
        {stats && (
          <Card sx={{ 
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 12px 30px rgba(102, 126, 234, 0.2)',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  📊 Resumen del Día
                </Typography>
                <Chip 
                  label={format(new Date(stats.fecha), 'dd MMM', { locale: es })}
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                />
              </Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>💰 Venta Total</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      ${stats.totalVentas.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>📉 Gastos</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      ${stats.totalGastos.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>📈 Utilidad</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                      {stats.margenBruto >= 0 ? '📈' : '📉'} ${stats.margenBruto.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>💹 Margen %</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {stats.margenPorcentaje.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 2.4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, mb: 1, display: 'block' }}>🛍️ Tickets</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                      {stats.cantidadVentas}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Gráficos - 2 en fila */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Gráfico de Donut */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 450,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: '1px solid #f0f0f0'
            }}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.1rem', color: '#333' }}>
                  📊 Distribución Financiera
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
                          formatter={(value: string) => <span style={{ fontSize: '14px', fontWeight: 500 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">📭 No hay datos para mostrar</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top 5 Productos */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ 
              height: '100%', 
              minHeight: 450,
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
              borderRadius: 3,
              border: '1px solid #f0f0f0'
            }}>
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.1rem', color: '#333' }}>
                  🏆 Top 5 Productos
                </Typography>
                {topProductos.length > 0 ? (
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ height: 200, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                          <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Bar dataKey="ingreso" fill="#667eea" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                    <List sx={{ flex: 1, overflow: 'auto', mt: 2 }}>
                      {topProductos.filter(p => p && p.nombre).map((producto, index) => (
                        <ListItem 
                          key={producto.productoId} 
                          sx={{ 
                            px: 1.5, 
                            py: 1.5, 
                            borderBottom: index < topProductos.length - 1 ? '1px solid #f0f0f0' : 'none',
                            '&:hover': { backgroundColor: '#f8f9fa' }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Chip 
                              label={`#${index + 1}`} 
                              size="small" 
                              sx={{ 
                                backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.75rem'
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: '600', color: '#333' }}>
                                {producto.nombre}
                              </Typography>
                            }
                            secondary={`🛒 ${producto.unidadesVendidas || 0} vendidos`}
                            secondaryTypographyProps={{ sx: { fontSize: '0.85rem', color: '#999' } }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#667eea', minWidth: 'auto' }}>
                            ${(producto.ingresoTotal || 0).toFixed(2)}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <Typography color="text.secondary">📭 No hay productos vendidos hoy</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Productos Detallada */}
        <Card sx={{ 
          mt: 4,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          borderRadius: 3,
          border: '1px solid #f0f0f0'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 3,
              borderRadius: '12px 12px 0 0'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                📦 Productos Vendidos Hoy
              </Typography>
            </Box>
            {productos && productos.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#555', fontSize: '0.95rem' }}>Producto</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', color: '#555', fontSize: '0.95rem' }}>Cantidad</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: '#555', fontSize: '0.95rem' }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productos.map((producto, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          borderBottom: '1px solid #e0e0e0',
                          '&:hover': { backgroundColor: '#fafafa' },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ py: 2, color: '#333', fontWeight: 500 }}>
                          {producto.nombre}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2, color: '#666' }}>
                          <Chip 
                            label={`${producto.cantidad || 0} × $${producto.precioUnitario || 0}`}
                            size="small"
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              fontWeight: '600'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, color: '#667eea', fontWeight: 'bold', fontSize: '0.95rem' }}>
                          ${(producto.subtotal || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">📭 No hay productos vendidos hoy</Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Métricas Adicionales - 6 en fila */}
        {stats && stats.cantidadVentas > 0 && (
          <Card sx={{ 
            mt: 4,
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            borderRadius: 3,
            border: '1px solid #f0f0f0'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.1rem', color: '#333' }}>
                📊 Métricas Detalladas
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9ff',
                    border: '1px solid #e3e5ed',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(102, 126, 234, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 'bold', mb: 1 }}>
                      {stats.cantidadVentas}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      💳 Total Ventas
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#f8fff8',
                    border: '1px solid #e3ede3',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(46, 125, 50, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
                      ${stats.ticketPromedio.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      🎫 Ticket Promedio
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#fff8f0',
                    border: '1px solid #ede3d3',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(237, 108, 2, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ color: '#ed6c02', fontWeight: 'bold', mb: 1 }}>
                      {stats.itemsVendidos}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      🛍️ Items Vendidos
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#faf7ff',
                    border: '1px solid #ede3f5',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(156, 39, 176, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 'bold', mb: 1 }}>
                      ${stats.itemsVendidos > 0 ? (stats.totalVentas / stats.itemsVendidos).toFixed(2) : '0.00'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      💰 Promedio/Item
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#fff8f8',
                    border: '1px solid #ede3e3',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(211, 47, 47, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 1 }}>
                      ${stats.totalCostos.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      📈 Costos Productos
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <Paper sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#f0fff8',
                    border: '1px solid #d3ede8',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 16px rgba(0, 131, 143, 0.15)' }
                  }}>
                    <Typography variant="h4" sx={{ 
                      color: stats.margenBruto >= 0 ? '#00838f' : '#d32f2f', 
                      fontWeight: 'bold', 
                      mb: 1 
                    }}>
                      {stats.margenPorcentaje.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666', fontWeight: 500, display: 'block' }}>
                      📊 Margen Bruto
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
      </Box>
    );
  }
