import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import type { DateRangeValue } from '../../types/dateRange.types';

interface ResumenVentas {
  fecha: string;
  totalVentas: number;
  totalCostos: number;
  margenBruto: number;
  cantidadVentas: number;
  itemsVendidos: number;
  ticketPromedio: number;
  margenPorcentaje: number;
}

interface ProductoRendimiento {
  productoId: number;
  nombre: string;
  precio: number;
  costoEstimado: number;
  margenUnitario: number;
  margenPorcentaje: number;
  unidadesVendidas: number;
  ingresoTotal: number;
  costoTotal: number;
  margenBrutoTotal: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminReports() {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [productosTop, setProductosTop] = useState<ProductoRendimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!dateRange.desde || !dateRange.hasta) {
        setError('Selecciona un rango de fechas válido');
        return;
      }

      // Crear fechas en zona horaria local
      const desde = new Date(dateRange.desde + 'T00:00:00');
      const hasta = new Date(dateRange.hasta + 'T23:59:59');

      // Formatear fechas para el backend (ISO 8601: yyyy-MM-ddTHH:mm:ss)
      const desdeISO = desde.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss
      const hastaISO = hasta.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss

      console.log('Cargando reportes para rango:', {
        desde: desdeISO,
        hasta: hastaISO
      });

      // Cargar resumen de ventas
      const resumenResponse = await apiService.get(
        `${API_ENDPOINTS.STATS_SALES_RANGE}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

      if (resumenResponse.success && resumenResponse.data) {
        const data = resumenResponse.data;
        setResumen({
          fecha: data.fecha || dateRange.desde,
          totalVentas: parseFloat(data.totalVentas) || 0,
          totalCostos: parseFloat(data.totalCostos) || 0,
          margenBruto: parseFloat(data.margenBruto) || 0,
          cantidadVentas: data.cantidadVentas || 0,
          itemsVendidos: data.itemsVendidos || 0,
          ticketPromedio: parseFloat(data.ticketPromedio) || 0,
          margenPorcentaje: parseFloat(data.margenPorcentaje) || 0,
        });
      }

      // Cargar productos más vendidos
      const productosResponse = await apiService.get(
        `${API_ENDPOINTS.STATS_PRODUCTS_RANGE}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}&limite=10`
      );

      if (productosResponse.success && productosResponse.data) {
        const productos = productosResponse.data.map((p: any) => ({
          productoId: p.productoId,
          nombre: p.nombre,
          precio: parseFloat(p.precio) || 0,
          costoEstimado: parseFloat(p.costoEstimado) || 0,
          margenUnitario: parseFloat(p.margenUnitario) || 0,
          margenPorcentaje: parseFloat(p.margenPorcentaje) || 0,
          unidadesVendidas: p.unidadesVendidas || 0,
          ingresoTotal: parseFloat(p.ingresoTotal) || 0,
          costoTotal: parseFloat(p.costoTotal) || 0,
          margenBrutoTotal: parseFloat(p.margenBrutoTotal) || 0,
        }));
        setProductosTop(productos);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  // Datos para gráficas
  const datosGraficaVentas = resumen
    ? [
        {
          name: 'Ventas',
          valor: resumen.totalVentas,
        },
        {
          name: 'Gastos',
          valor: resumen.totalCostos,
        },
        {
          name: 'Utilidad',
          valor: resumen.margenBruto,
        },
      ]
    : [];

  const datosGraficaProductos = productosTop.slice(0, 5).map((p) => ({
    name: p.nombre, // Nombre completo para tooltip
    nameShort: p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre, // Nombre corto para eje X
    ventas: p.unidadesVendidas,
    ingresos: p.ingresoTotal,
  }));

  const datosGraficaPie = productosTop.slice(0, 6).map((p) => ({
    name: p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre,
    value: p.ingresoTotal,
  }));

  // Productos más y menos vendidos
  const productosMasVendidos = [...productosTop]
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
    .slice(0, 10);

  const productosMenosVendidos = [...productosTop]
    .sort((a, b) => a.unidadesVendidas - b.unidadesVendidas)
    .slice(0, 10);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Reportes y Estadísticas</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtro de rango de fechas */}
        <DateRangeFilter 
          onChange={handleDateRangeChange} 
          initialRange={dateRange}
          label="Período de análisis"
        />

        {/* Resumen del período */}
        {resumen && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen del Período Seleccionado
              </Typography>
              <Typography variant="body1">
                Período: {new Date(dateRange.desde).toLocaleDateString('es-ES')} - {new Date(dateRange.hasta).toLocaleDateString('es-ES')}
              </Typography>
              <Typography variant="body1">
                Total de ventas: {resumen.cantidadVentas} | Ingresos: ${resumen.totalVentas.toFixed(2)} | Items vendidos: {resumen.itemsVendidos}
              </Typography>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : resumen ? (
          <>
            {/* Métricas principales */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Venta Total
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ${resumen.totalVentas.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Gastos
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      ${resumen.totalCostos.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Utilidad
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: resumen.margenBruto >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      ${resumen.margenBruto.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${resumen.margenPorcentaje.toFixed(2)}%`}
                      size="small"
                      color={resumen.margenPorcentaje >= 0 ? 'success' : 'error'}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Tickets
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {resumen.cantidadVentas}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Promedio: ${resumen.ticketPromedio.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Gráficas */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 3,
                mb: 3,
              }}
            >
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Ventas vs Gastos vs Utilidad
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosGraficaVentas}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="valor" fill="#1976d2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top 5 Productos por Ingresos
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={datosGraficaPie}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {datosGraficaPie.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Top 5 Productos por Unidades Vendidas
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 400, sm: 450, md: 500, lg: 550 },
                        minHeight: 400,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={datosGraficaProductos}
                          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="nameShort"
                            angle={-45}
                            textAnchor="end"
                            height={140}
                            interval={0}
                            tick={{ fontSize: 12 }}
                            label={{
                              value: 'Productos',
                              position: 'insideBottom',
                              offset: -5,
                              style: { textAnchor: 'middle', fontSize: 14 },
                            }}
                          />
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#2e7d32"
                            label={{
                              value: 'Unidades Vendidas',
                              angle: -90,
                              position: 'insideLeft',
                              style: { textAnchor: 'middle', fontSize: 12 },
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#1976d2"
                            label={{
                              value: 'Ingresos ($)',
                              angle: 90,
                              position: 'insideRight',
                              style: { textAnchor: 'middle', fontSize: 12 },
                            }}
                          />
                          <Tooltip
                            formatter={(value: number, name: string) => {
                              if (name === 'ventas') {
                                return [`${value} unidades`, 'Unidades Vendidas'];
                              }
                              return [`$${value.toFixed(2)}`, 'Ingresos'];
                            }}
                            labelFormatter={(label) => {
                              const fullName = datosGraficaProductos.find((d) => d.nameShort === label)?.name;
                              return fullName || label;
                            }}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.98)',
                              border: '1px solid #ccc',
                              borderRadius: '6px',
                              padding: '10px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => {
                              if (value === 'ventas') return 'Unidades Vendidas';
                              if (value === 'ingresos') return 'Ingresos ($)';
                              return value;
                            }}
                          />
                          <Bar
                            yAxisId="left"
                            dataKey="ventas"
                            fill="#2e7d32"
                            name="Unidades Vendidas"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            yAxisId="right"
                            dataKey="ingresos"
                            fill="#1976d2"
                            name="Ingresos ($)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Tablas de productos */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'repeat(2, 1fr)',
                },
                gap: 3,
              }}
            >
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Productos Más Vendidos
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="right">Unidades</TableCell>
                            <TableCell align="right">Ingresos</TableCell>
                            <TableCell align="right">Utilidad</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {productosMasVendidos.length > 0 ? (
                            productosMasVendidos.map((producto) => (
                              <TableRow key={producto.productoId}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell align="right">{producto.unidadesVendidas}</TableCell>
                                <TableCell align="right">${producto.ingresoTotal.toFixed(2)}</TableCell>
                                <TableCell align="right" sx={{ color: producto.margenBrutoTotal >= 0 ? 'success.main' : 'error.main' }}>
                                  ${producto.margenBrutoTotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>

              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Productos Menos Vendidos
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="right">Unidades</TableCell>
                            <TableCell align="right">Ingresos</TableCell>
                            <TableCell align="right">Utilidad</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {productosMenosVendidos.length > 0 ? (
                            productosMenosVendidos.map((producto) => (
                              <TableRow key={producto.productoId}>
                                <TableCell>{producto.nombre}</TableCell>
                                <TableCell align="right">{producto.unidadesVendidas}</TableCell>
                                <TableCell align="right">${producto.ingresoTotal.toFixed(2)}</TableCell>
                                <TableCell align="right" sx={{ color: producto.margenBrutoTotal >= 0 ? 'success.main' : 'error.main' }}>
                                  ${producto.margenBrutoTotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center">
                                No hay datos disponibles
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </>
        ) : (
          <Alert severity="info">No hay datos disponibles para el período seleccionado</Alert>
        )}
      </Box>
  );
}
