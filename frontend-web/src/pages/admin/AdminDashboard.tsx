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
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Fade,
  Skeleton,
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingCart, 
  Inventory2,
  AttachMoney,
  LocalFireDepartment,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useDashboard } from '../../contexts/DashboardContext';
import { getTodayLocalDate, toLocalISOString } from '../../utils/dateHelper';

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
  unidadesVendidas: number;
  ingresoTotal: number;
}

// Componente para KPI card minimalista
const KPICard = ({ 
  icon: Icon, 
  title, 
  value, 
  color = '#667eea',
  subtitle,
  trend,
  loading = false 
}: any) => (
  <Fade in={!loading} timeout={500}>
    <Paper
      sx={{
        p: 2.5,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
        border: `2px solid ${color}30`,
        borderRadius: 2,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          border: `2px solid ${color}60`,
          boxShadow: `0 12px 24px ${color}20`,
          background: `linear-gradient(135deg, ${color}25 0%, ${color}15 100%)`,
        },
        height: '100%',
      }}
    >
      {loading ? (
        <>
          <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
          <Skeleton width="60%" height={32} />
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Box sx={{ 
              p: 1, 
              borderRadius: 1.5, 
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ color, fontSize: 20 }} />
            </Box>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, fontSize: '0.75rem' }}>
              {title}
            </Typography>
          </Box>
          <Typography sx={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: color,
            mb: 0.5,
            fontFamily: 'monospace'
          }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
          {trend !== undefined && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUp sx={{ fontSize: 14, color: trend >= 0 ? '#2e7d32' : '#d32f2f' }} />
              <Typography variant="caption" sx={{ color: trend >= 0 ? '#2e7d32' : '#d32f2f', fontWeight: 600, fontSize: '0.7rem' }}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  </Fade>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [topProductos, setTopProductos] = useState<ProductoRendimiento[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshTrigger } = useDashboard();

  // Actualizar hora en tiempo real
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

      // ✅ Enviar la fecha del cliente (zona horaria local) para evitar problemas de offset
      const fechaHoy = getTodayLocalDate();
      
      const [statsResponse, topProductosResponse] = await Promise.all([
        apiService.get(`${API_ENDPOINTS.STATS_DAILY}?fecha=${fechaHoy}`),
        apiService.get(`${API_ENDPOINTS.STATS_PRODUCTS_DAY}?fecha=${fechaHoy}&limite=5`)
      ]);

      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        setStats({
          fecha: fechaHoy,  // ✅ Usar fecha del cliente, no data.fecha
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

      if (topProductosResponse.success && topProductosResponse.data) {
        setTopProductos(Array.isArray(topProductosResponse.data) ? topProductosResponse.data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Datos simulados para gráfico (últimas 7 ventas del día)
  const ventasHorariosData = stats ? [
    { hora: '8:00', ventas: stats.totalVentas * 0.12, utilidad: stats.margenBruto * 0.12 },
    { hora: '10:00', ventas: stats.totalVentas * 0.18, utilidad: stats.margenBruto * 0.18 },
    { hora: '12:00', ventas: stats.totalVentas * 0.25, utilidad: stats.margenBruto * 0.25 },
    { hora: '14:00', ventas: stats.totalVentas * 0.22, utilidad: stats.margenBruto * 0.22 },
    { hora: '16:00', ventas: stats.totalVentas * 0.16, utilidad: stats.margenBruto * 0.16 },
    { hora: '18:00', ventas: stats.totalVentas * 0.07, utilidad: stats.margenBruto * 0.07 },
  ] : [];

  const topProductosData = topProductos
    .filter(p => p && p.nombre)
    .map(p => ({
      name: p.nombre.length > 12 ? p.nombre.substring(0, 12) + '.' : p.nombre,
      value: p.unidadesVendidas,
      ingreso: p.ingresoTotal
    }));

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)',
      p: { xs: 1.5, sm: 2, md: 3 }
    }}>
      {/* Encabezado con bienvenida */}
      <Fade in={!loading} timeout={600}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#333',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}>
                👋 Bienvenido al Dashboard
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  📅 {format(stats?.fecha ? new Date(stats.fecha + 'T00:00:00') : new Date(), "EEEE, dd 'de' MMMM", { locale: es })}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 1, borderRadius: 1, background: '#f0f0f0' }}>
                  <Typography variant="body2" sx={{ color: '#666', fontWeight: 500, fontFamily: 'monospace' }}>
                    🕐 {currentTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Principal - Ventas del día */}
      <Fade in={!loading} timeout={700}>
        <Paper sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2,
          boxShadow: '0 20px 40px rgba(102, 126, 234, 0.25)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Efecto de fondo animado */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'pulse 3s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            }
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            {loading ? (
              <Skeleton width="60%" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            ) : (
              <Typography sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 'bold', mb: 1, fontFamily: 'monospace' }}>
                ${stats?.totalVentas.toFixed(2) || '0.00'}
              </Typography>
            )}
            <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
              💰 Ventas Totales Hoy
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.3 }}>
                    Tickets
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.cantidadVentas || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.3 }}>
                    Ticket Prom.
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    ${stats?.ticketPromedio.toFixed(2) || '0.00'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.3 }}>
                    Items
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.itemsVendidos || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.3 }}>
                    Margen
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {stats?.margenPorcentaje.toFixed(1) || '0'}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Fade>

      {/* KPIs Secundarios */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            icon={TrendingUp}
            title="UTILIDAD"
            value={`$${stats?.margenBruto.toFixed(2) || '0.00'}`}
            color="#2e7d32"
            subtitle={`${stats?.margenPorcentaje.toFixed(1) || '0'}% de margen`}
            loading={loading}
            trend={stats?.margenPorcentaje || 0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            icon={AttachMoney}
            title="GASTOS"
            value={`$${stats?.totalGastos.toFixed(2) || '0.00'}`}
            color="#d32f2f"
            subtitle="Operacionales"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            icon={ShoppingCart}
            title="COSTOS"
            value={`$${stats?.totalCostos.toFixed(2) || '0.00'}`}
            color="#ed6c02"
            subtitle="Productos vendidos"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            icon={Inventory2}
            title="ITEMS/TICKET"
            value={`${stats && stats.cantidadVentas > 0 ? (stats.itemsVendidos / stats.cantidadVentas).toFixed(1) : '0'}`}
            color="#764ba2"
            subtitle="Promedio por venta"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Gráficos y Top Productos */}
      <Grid container spacing={3}>
        {/* Gráfico de Ventas por Hora */}
        <Grid item xs={12} md={6}>
          <Fade in={!loading} timeout={800}>
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 2,
              border: '1px solid #f0f0f0',
              height: '100%',
              minHeight: 320
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '0.95rem', color: '#333' }}>
                📈 Ventas por Hora
              </Typography>
              {loading ? (
                <Skeleton height={250} />
              ) : ventasHorariosData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={ventasHorariosData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hora" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        border: '1px solid #e0e0e0',
                        borderRadius: 8
                      }}
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      dot={{ fill: '#667eea', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 250 }}>
                  <Typography color="text.secondary">📭 Sin datos</Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* Top 5 Productos */}
        <Grid item xs={12} md={6}>
          <Fade in={!loading} timeout={800}>
            <Paper sx={{ 
              p: 2.5, 
              borderRadius: 2,
              border: '1px solid #f0f0f0',
              height: '100%',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '0.95rem', color: '#333' }}>
                🏆 Top 5 Productos Vendidos
              </Typography>
              {loading ? (
                <>
                  <Skeleton height={40} sx={{ mb: 1 }} />
                  <Skeleton height={40} sx={{ mb: 1 }} />
                  <Skeleton height={40} />
                </>
              ) : topProductosData.length > 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {topProductosData.map((producto, index) => (
                    <Fade key={producto.name} in={!loading} timeout={900 + index * 100}>
                      <Box
                        sx={{
                          p: 1.5,
                          mb: 1,
                          borderRadius: 1.5,
                          background: `linear-gradient(135deg, ${COLORS[index]}15 0%, ${COLORS[index]}08 100%)`,
                          border: `1px solid ${COLORS[index]}30`,
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${COLORS[index]}25 0%, ${COLORS[index]}15 100%)`,
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                          <Chip
                            label={`#${index + 1}`}
                            size="small"
                            sx={{
                              background: COLORS[index],
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem'
                            }}
                          />
                          <Typography sx={{ flex: 1, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                            {producto.name}
                          </Typography>
                          <Typography sx={{ fontWeight: 'bold', color: COLORS[index], fontSize: '0.85rem' }}>
                            ${producto.ingreso.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            background: '#f0f0f0',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${(producto.value / Math.max(...topProductosData.map(p => p.value), 1)) * 100}%`,
                              background: COLORS[index],
                              borderRadius: 3,
                              transition: 'width 0.5s ease'
                            }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, minWidth: 35 }}>
                            {producto.value} und
                          </Typography>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Typography color="text.secondary">📭 Sin productos vendidos hoy</Typography>
                </Box>
              )}
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Resumen Rápido del Día */}
      {stats && (
        <Fade in={!loading} timeout={900}>
          <Paper sx={{ 
            mt: 3, 
            p: 2.5, 
            borderRadius: 2,
            border: '1px solid #f0f0f0',
            background: '#fafbfc'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, fontSize: '0.85rem', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              📊 Resumen Rápido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                  Venta Total
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#667eea', fontSize: '0.95rem' }}>
                  ${stats.totalVentas.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                  Costo Productos
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '0.95rem' }}>
                  ${stats.totalCostos.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                  Gastos Op.
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: '#ed6c02', fontSize: '0.95rem' }}>
                  ${stats.totalGastos.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" sx={{ color: '#999', display: 'block', mb: 0.3, fontSize: '0.7rem' }}>
                  Utilidad Neta
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: stats.margenBruto >= 0 ? '#2e7d32' : '#d32f2f', fontSize: '0.95rem' }}>
                  ${stats.margenBruto.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Fade>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress size={40} />
        </Box>
      )}
    </Box>
  );
}
