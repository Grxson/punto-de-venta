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
  Tabs,
  Tab,
  Button,
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
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import type { DateRangeValue } from '../../types/dateRange.types';
import { getTodayLocalDate, getDateWithOffset, toLocalISOString } from '../../utils/dateHelper';
import { limpiarNombreProducto, truncarTexto } from '../../utils/stringFormatters';
import type { ResumenVentas, ProductoRendimiento, VentaDetalle, GastoDetallado } from './types/reportTypes';
import { GeneralCutTab } from './components';
import { InventarioMovimientoTab } from './tabs/InventarioMovimientoTab';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminReports() {
  const todayLocal = getTodayLocalDate();
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: todayLocal,
    hasta: todayLocal,
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState(0); // Offset de días desde hoy
  const [resumen, setResumen] = useState<ResumenVentas | null>(null);
  const [productosTop, setProductosTop] = useState<ProductoRendimiento[]>([]);
  const [ventas, setVentas] = useState<VentaDetalle[]>([]);
  const [gastosDia, setGastosDia] = useState<number>(0); // Gastos del día seleccionado
  const [gastosDetallados, setGastosDetallados] = useState<GastoDetallado[]>([]); // ✨ Nuevo: gastos por categoría
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCambiarDia = (direccion: 'anterior' | 'siguiente') => {
    const nuevoDia = direccion === 'anterior' ? diaSeleccionado - 1 : diaSeleccionado + 1;
    const fechaFormato = getDateWithOffset(nuevoDia);
    setDiaSeleccionado(nuevoDia);
    setDateRange({
      desde: fechaFormato,
      hasta: fechaFormato,
    });
  };

  useEffect(() => {
    loadData();
  }, [dateRange, diaSeleccionado]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!dateRange.desde || !dateRange.hasta) {
        setError('Selecciona un rango de fechas válido');
        return;
      }

      // ✅ CRÍTICO: Convertir fechas a formato local (NO UTC)
      // El backend espera: yyyy-MM-ddTHH:mm:ss en zona horaria LOCAL
      // NO usar toISOString() que convierte a UTC y causa offset de 1 día
      const desdeISO = toLocalISOString(dateRange.desde, '00:00:00');
      const hastaISO = toLocalISOString(dateRange.hasta, '23:59:59');

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
          totalGastos: parseFloat(data.totalGastos) || 0,
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
          nombre: limpiarNombreProducto(p.nombre),
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

      // Cargar ventas detalladas para corte de caja
      const ventasResponse = await apiService.get(
        `${API_ENDPOINTS.SALES}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

      if (ventasResponse.success && ventasResponse.data) {
        setVentas(ventasResponse.data);
      }

      // ✅ Los gastos ya vienen en el resumen desde el backend
      // No es necesario cargar gastos por separado
      if (resumenResponse.success && resumenResponse.data) {
        setGastosDia(parseFloat(resumenResponse.data.totalGastos) || 0);
      }

      // ✨ Cargar gastos detallados para mostrar en GeneralCutTab
      const gastosResponse = await apiService.get(
        `${API_ENDPOINTS.GASTOS}/rango?desde=${encodeURIComponent(desdeISO)}&hasta=${encodeURIComponent(hastaISO)}`
      );

      if (gastosResponse.success && gastosResponse.data) {
        // Convertir GastoDTO a GastoDetallado con estructura esperada
        const gastosFormateados = gastosResponse.data.map((gasto: any) => ({
          id: gasto.id,
          monto: parseFloat(gasto.monto) || 0,
          categoriaGastoNombre: gasto.categoriaGastoNombre || 'Sin categoría',
          proveedorNombre: gasto.proveedorNombre || 'Sin proveedor',
          nota: gasto.nota || '',
          fecha: gasto.fecha,
        }));
        setGastosDetallados(gastosFormateados);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
    setDiaSeleccionado(0); // Resetear el día cuando cambia manualmente el rango
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

  const datosGraficaProductos = productosTop.slice(0, 5).map((p) => {
    const nombreLimpio = limpiarNombreProducto(p.nombre);
    return {
      name: nombreLimpio, // Nombre completo para tooltip
      nameShort: truncarTexto(nombreLimpio, 20), // Nombre corto para eje X
      ventas: p.unidadesVendidas,
      ingresos: p.ingresoTotal,
    };
  });

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
          <Button 
            variant="contained" 
            size="small"
            onClick={() => loadData()}
          >
            🔄 Refrescar
          </Button>
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
        >
          {/* Paginador de días */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => handleCambiarDia('anterior')}
            >
              ← Atrás
            </Button>
            <Typography variant="body2" sx={{ minWidth: '100px', textAlign: 'center' }}>
              {diaSeleccionado === 0 ? 'Hoy' : `Hace ${Math.abs(diaSeleccionado)} día${Math.abs(diaSeleccionado) > 1 ? 's' : ''}`}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              disabled={diaSeleccionado === 0}
              onClick={() => handleCambiarDia('siguiente')}
              title={diaSeleccionado === 0 ? "No puedes ir adelante de hoy" : "Ir al día siguiente"}
            >
              Adelante →
            </Button>
          </Box>
        </DateRangeFilter>

        {/* Resumen del período */}
        {resumen && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Resumen del Período Seleccionado</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {format(parse(dateRange.desde, 'yyyy-MM-dd', new Date()), "EEEE dd 'de' MMMM", { locale: es })} - {format(parse(dateRange.hasta, 'yyyy-MM-dd', new Date()), "EEEE dd 'de' MMMM", { locale: es })}
                </Typography>
              </Box>
              <Typography variant="body1">
                Total de ventas: {resumen.cantidadVentas} | Ingresos: ${resumen.totalVentas.toFixed(2)} | Items vendidos: {resumen.itemsVendidos}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Sistema de Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="reportes tabs">
            <Tab label="📊 Dashboard General" />
            <Tab label="📋 Corte Por Producto" />
            <Tab label="📅 Corte General" />
            <Tab label="📦 Movimiento de Inventario" />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : resumen ? (
          <>
            {/* Tab 0: Dashboard General */}
            {currentTab === 0 && (
              <Box>
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
                      ${(resumen?.totalGastos || 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Utilidad Neta
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        color: ((resumen?.totalVentas || 0) - (resumen?.totalGastos || 0)) >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      ${((resumen?.totalVentas || 0) - (resumen?.totalGastos || 0)).toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${(((resumen?.totalVentas || 0) - (resumen?.totalGastos || 0)) / (resumen?.totalVentas || 1) * 100).toFixed(2)}%`}
                      size="small"
                      color={((resumen?.totalVentas || 0) - (resumen?.totalGastos || 0)) >= 0 ? 'success' : 'error'}
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
                                <TableCell>{limpiarNombreProducto(producto.nombre)}</TableCell>
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
                                <TableCell>{limpiarNombreProducto(producto.nombre)}</TableCell>
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
              </Box>
            )}

            {/* Tab 1: Corte de Caja */}
            {currentTab === 1 && (
              <Box>
                <Card sx={{ maxWidth: '900px', mx: 'auto' }}>
                  <CardContent sx={{ p: 3 }}>
                    {ventas.length === 0 ? (
                      <Alert severity="info">
                        No hay ventas registradas en este período
                      </Alert>
                    ) : (
                      <>
                        {/* Header */}
                        <Box sx={{ mb: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                            📋 Corte Por Producto
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {format(parse(dateRange.desde, 'yyyy-MM-dd', new Date()), "'del' dd 'de' MMMM ", { locale: es })} - {format(parse(dateRange.hasta, 'yyyy-MM-dd', new Date()), "'al' dd 'de' MMMM ", { locale: es })}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {ventas.length} ventas
                            </Typography>
                          </Box>
                        </Box>
                          {/* Fila de Total de Ventas */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 0.75,
                              px: 1.5,
                              borderBottom: 1,
                              borderColor: 'grey.200',
                              backgroundColor: '#e8f5e9',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                              Venta Total
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                              ${ventas.filter(v => v.estado !== 'cancelada').reduce((sum, v) => sum + v.total, 0).toFixed(2)}
                            </Typography>
                          </Box>
                        {/* Tabla de métodos de pago */}
                        <Box sx={{ mb: 3 }}>
                          {(() => {
                            const metodosPago = ventas.filter(v => v.estado !== 'cancelada').reduce((acc, venta) => {
                              venta.pagos.forEach((pago) => {
                                const metodo = pago.metodoPagoNombre;
                                acc[metodo] = (acc[metodo] || 0) + pago.monto;
                              });
                              return acc;
                            }, {} as Record<string, number>);

                            return Object.entries(metodosPago).map(([metodo, monto]) => (
                              <Box
                                key={metodo}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  py: 0.75,
                                  px: 1.5,
                                  borderBottom: 1,
                                  borderColor: 'grey.200',
                                }}
                              >
                                <Typography variant="body2">{metodo}</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  ${monto.toFixed(2)}
                                </Typography>
                              </Box>
                            ));
                          })()}

                          {/* Fila de Gastos */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 0.75,
                              px: 1.5,
                              borderBottom: 1,
                              borderColor: 'grey.200',
                              backgroundColor: '#fff3cd',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#856404' }}>
                              Gastos
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
                              ${gastosDia.toFixed(2)}
                            </Typography>
                          </Box>
                          {/* Fila de Resultado Neto */}
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 0.75,
                              px: 1.5,
                              borderBottom: 1,
                              borderColor: 'grey.200',
                              backgroundColor: '#f3e5f5',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#6a1b9a' }}>
                              Neto
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#6a1b9a' }}>
                              {(() => {
                                // Extraer efectivo de los métodos de pago
                                const metodosPago = ventas.reduce((acc, venta) => {
                                  venta.pagos.forEach((pago) => {
                                    const metodo = pago.metodoPagoNombre;
                                    acc[metodo] = (acc[metodo] || 0) + pago.monto;
                                  });
                                  return acc;
                                }, {} as Record<string, number>);
                                const efectivo = metodosPago['Efectivo'] || 0;
                                const neto = efectivo - gastosDia;
                                return `$${neto.toFixed(2)}`;
                              })()}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Tabla de productos */}
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 600, py: 1 }}>Producto</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, py: 1 }}>Cant.</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, py: 1 }}>Precio Unit.</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600, py: 1 }}>Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(() => {
                                const productosAgrupados = ventas.reduce((acc, venta) => {
                                  venta.items.forEach((item) => {
                                    const key = limpiarNombreProducto(item.productoNombre);
                                    if (!acc[key]) {
                                      acc[key] = {
                                        nombre: key,
                                        cantidad: 0,
                                        total: 0,
                                        precioUnitario: item.precioUnitario,
                                      };
                                    }
                                    acc[key].cantidad += item.cantidad;
                                    acc[key].total += item.subtotal;
                                  });
                                  return acc;
                                }, {} as Record<string, { nombre: string; cantidad: number; total: number; precioUnitario: number }>);

                                return Object.values(productosAgrupados)
                                  .sort((a, b) => b.total - a.total)
                                  .map((producto, idx) => (
                                    <TableRow key={idx} hover>
                                      <TableCell sx={{ py: 1 }}>{producto.nombre}</TableCell>
                                      <TableCell align="center" sx={{ py: 1 }}>{producto.cantidad}</TableCell>
                                      <TableCell align="right" sx={{ py: 1 }}>
                                        ${producto.precioUnitario.toFixed(2)}
                                      </TableCell>
                                      <TableCell align="right" sx={{ py: 1, fontWeight: 600 }}>
                                        ${producto.total.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  ));
                              })()}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Tab 2: Corte General */}
            {currentTab === 2 && (
              <GeneralCutTab 
                ventas={ventas} 
                gastosDia={gastosDia}
                gastosDetallados={gastosDetallados}
                dateRange={dateRange} 
              />
            )}

            {/* Tab 3: Movimiento de Inventario */}
            {currentTab === 3 && (
              <InventarioMovimientoTab dateRange={dateRange} />
            )}
          </>
        ) : (
          <Alert severity="info">No hay datos disponibles para el período seleccionado</Alert>
        )}
      </Box>
  );
}
