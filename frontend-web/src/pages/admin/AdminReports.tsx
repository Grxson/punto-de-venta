import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  ButtonGroup,
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

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

type PeriodoFiltro = 'hoy' | 'semana' | 'mes' | 'rango';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminReports() {
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('hoy');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(new Date());
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [productosTop, setProductosTop] = useState<ProductoRendimiento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [periodo]);

  const calcularRangoFechas = (periodoSeleccionado: PeriodoFiltro) => {
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);

    switch (periodoSeleccionado) {
      case 'hoy':
        return { desde: inicio, hasta: hoy };
      case 'semana':
        inicio.setDate(inicio.getDate() - 7);
        return { desde: inicio, hasta: hoy };
      case 'mes':
        inicio.setMonth(inicio.getMonth() - 1);
        return { desde: inicio, hasta: hoy };
      case 'rango':
        return { desde: fechaInicio || inicio, hasta: fechaFin || hoy };
      default:
        return { desde: inicio, hasta: hoy };
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { desde, hasta } = calcularRangoFechas(periodo);

      // Formatear fechas para el backend (ISO 8601: yyyy-MM-ddTHH:mm:ss)
      // El backend espera formato ISO_DATE_TIME sin zona horaria
      const desdeISO = desde.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss
      const hastaISO = hasta.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss

      // Cargar resumen de ventas
      const resumenResponse = await apiService.get(
        `${API_ENDPOINTS.STATS_RANGE}?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

      if (resumenResponse.success && resumenResponse.data) {
        const data = resumenResponse.data;
        setResumen({
          fecha: data.fecha || desde.toISOString().split('T')[0],
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

  const handlePeriodoChange = (nuevoPeriodo: PeriodoFiltro) => {
    setPeriodo(nuevoPeriodo);
  };

  const handleAplicarFiltro = () => {
    if (periodo === 'rango' && (!fechaInicio || !fechaFin)) {
      setError('Selecciona ambas fechas para el rango personalizado');
      return;
    }
    loadData();
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
    name: p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre,
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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Reportes y Estadísticas</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros de Período
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mt: 2 }}>
              <ButtonGroup variant="outlined" aria-label="Filtros de período">
                <Button
                  variant={periodo === 'hoy' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodoChange('hoy')}
                >
                  Hoy
                </Button>
                <Button
                  variant={periodo === 'semana' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodoChange('semana')}
                >
                  Última Semana
                </Button>
                <Button
                  variant={periodo === 'mes' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodoChange('mes')}
                >
                  Último Mes
                </Button>
                <Button
                  variant={periodo === 'rango' ? 'contained' : 'outlined'}
                  onClick={() => handlePeriodoChange('rango')}
                >
                  Rango Personalizado
                </Button>
              </ButtonGroup>

              {periodo === 'rango' && (
                <>
                  <DatePicker
                    label="Fecha Inicio"
                    value={fechaInicio}
                    onChange={(newValue) => setFechaInicio(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="Fecha Fin"
                    value={fechaFin}
                    onChange={(newValue) => setFechaFin(newValue)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </>
              )}

              <Button variant="contained" onClick={handleAplicarFiltro} disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Aplicar Filtro'}
              </Button>
            </Box>
          </CardContent>
        </Card>

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
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosGraficaProductos}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ventas" fill="#2e7d32" name="Unidades Vendidas" />
                        <Bar dataKey="ingresos" fill="#1976d2" name="Ingresos ($)" />
                      </BarChart>
                    </ResponsiveContainer>
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
    </LocalizationProvider>
  );
}
