import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  Divider,
  Snackbar,
  ClickAwayListener,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Cancel, Refresh, Edit, Add, Delete, Remove, ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useAuth } from '../../contexts/AuthContext';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import type { DateRangeValue } from '../../types/dateRange.types';

interface VentaItem {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  costoEstimado?: number;
  nota?: string;
}

interface Pago {
  id: number;
  metodoPagoId: number;
  metodoPagoNombre: string;
  monto: number;
  referencia?: string;
  fecha: string;
}

interface Venta {
  id: number;
  sucursalId?: number;
  sucursalNombre?: string;
  fecha: string;
  subtotal: number;
  total: number;
  impuestos: number;
  descuento: number;
  canal: string;
  estado: string;
  nota?: string;
  usuarioId?: number;
  usuarioNombre?: string;
  items: VentaItem[];
  pagos: Pago[];
}

export default function AdminSales() {
  const { usuario } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState<number | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  
  // Estado para el filtro de fechas
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    desde: new Date().toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0],
  });
  
  // Estado para el paginador de días
  const [diaSeleccionado, setDiaSeleccionado] = useState<number>(0); // 0 = hoy, -1 = ayer, -2 = hace 2 días, etc.
  
  // Estado para el diálogo de cancelación
  const [dialogoCancelacion, setDialogoCancelacion] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [errorMotivo, setErrorMotivo] = useState<string | null>(null);
  
  // Estado para el diálogo de eliminación permanente
  const [dialogoEliminacion, setDialogoEliminacion] = useState(false);
  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);
  const [eliminando, setEliminando] = useState(false);
  
  // Estado para el diálogo de edición
  const [dialogoEdicion, setDialogoEdicion] = useState(false);
  const [itemsEditados, setItemsEditados] = useState<VentaItem[]>([]);
  const [pagosEditados, setPagosEditados] = useState<Pago[]>([]);
  const [notaEditada, setNotaEditada] = useState('');
  const [fechaEditada, setFechaEditada] = useState<string>('');
  const [editandoFecha, setEditandoFecha] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [metodosPago, setMetodosPago] = useState<any[]>([]);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; tipo: 'info' | 'warning' | 'success' }>({
    open: false,
    message: '',
    tipo: 'info',
  });
  const [tooltipOpen, setTooltipOpen] = useState<{ [key: number]: boolean }>({});
  const tooltipRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const [dialogoVariantes, setDialogoVariantes] = useState(false);
  const [productoSeleccionadoParaVariante, setProductoSeleccionadoParaVariante] = useState<any | null>(null);
  const [indiceItemParaVariante, setIndiceItemParaVariante] = useState<number | null>(null);

  useEffect(() => {
    loadVentas();
  }, []);

  // Auto-actualizar el monto del último pago cuando cambia el total de la venta
  useEffect(() => {
    if (!dialogoEdicion || pagosEditados.length === 0 || itemsEditados.length === 0) {
      return;
    }

    const totalVenta = itemsEditados.reduce((sum, item) => sum + item.subtotal, 0);
    const totalPagosActuales = pagosEditados.reduce((sum, p) => sum + p.monto, 0);
    const diferencia = totalVenta - totalPagosActuales;
    
    // Solo actualizar si hay una diferencia significativa
    if (Math.abs(diferencia) > 0.01) {
      const ultimoPagoIndex = pagosEditados.length - 1;
      const nuevoMonto = Math.max(0, pagosEditados[ultimoPagoIndex].monto + diferencia);
      
      // Actualizar solo si el monto cambió significativamente
      if (Math.abs(pagosEditados[ultimoPagoIndex].monto - nuevoMonto) > 0.01) {
        setPagosEditados(prevPagos => {
          const nuevosPagos = [...prevPagos];
          nuevosPagos[ultimoPagoIndex] = {
            ...nuevosPagos[ultimoPagoIndex],
            monto: nuevoMonto,
          };
          return nuevosPagos;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsEditados.map(i => `${i.productoId}-${i.cantidad}-${i.subtotal}`).join(',')]); // Solo cuando cambian los items

  const loadVentas = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(API_ENDPOINTS.SALES);
      if (response.success && response.data) {
        setVentas(response.data);
      } else {
        setError(response.error || 'Error al cargar ventas');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas por rango de fechas
  const ventasFiltradas = useMemo(() => {
    if (!dateRange.desde || !dateRange.hasta) return ventas;
    
    // Crear fechas en zona horaria local
    const desde = new Date(dateRange.desde + 'T00:00:00');
    const hasta = new Date(dateRange.hasta + 'T23:59:59');
    
    console.log('Filtro de ventas:', {
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      totalVentas: ventas.length,
      ventasEjemplo: ventas.slice(0, 3).map(v => ({ id: v.id, fecha: v.fecha }))
    });
    
    const filtradas = ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      const cumpleFiltro = fechaVenta >= desde && fechaVenta <= hasta;
      
      if (ventas.length <= 5) { // Solo log si hay pocas ventas para no saturar
        console.log('Venta', venta.id, {
          fechaVenta: fechaVenta.toISOString(),
          desde: desde.toISOString(),
          hasta: hasta.toISOString(),
          cumpleFiltro
        });
      }
      
      return cumpleFiltro;
    });
    
    console.log('Ventas filtradas:', filtradas.length);
    return filtradas;
  }, [ventas, dateRange]);

  const handleDateRangeChange = (range: DateRangeValue) => {
    setDateRange(range);
  };

  const handleCambiarDia = (dias: number) => {
    // Calcular la nueva fecha
    const hoy = new Date();
    const nuevaFecha = new Date(hoy);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    
    // Convertir a formato YYYY-MM-DD
    const fechaFormato = nuevaFecha.toISOString().split('T')[0];
    
    // Actualizar el estado y el rango de fechas
    setDiaSeleccionado(dias);
    setDateRange({
      desde: fechaFormato,
      hasta: fechaFormato,
    });
  };

  const handleAbrirDialogoCancelacion = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setMotivoCancelacion('');
    setErrorMotivo(null);
    setDialogoCancelacion(true);
  };

  const handleCerrarDialogoCancelacion = () => {
    setDialogoCancelacion(false);
    setVentaSeleccionada(null);
    setMotivoCancelacion('');
    setErrorMotivo(null);
  };

  const handleCancelarVenta = async () => {
    if (!ventaSeleccionada) return;

    // Validar motivo
    if (!motivoCancelacion.trim()) {
      setErrorMotivo('El motivo de cancelación es obligatorio');
      return;
    }

    try {
      setCancelando(ventaSeleccionada.id);
      setErrorMotivo(null);

      // Usar PUT con query parameter en la URL
      const url = `${API_ENDPOINTS.SALES}/${ventaSeleccionada.id}/cancelar?motivo=${encodeURIComponent(motivoCancelacion.trim())}`;
      const response = await apiService.put(url);

      if (response.success) {
        setSnackbar({
          open: true,
          message: `✓ Venta #${ventaSeleccionada.id} cancelada exitosamente`,
          tipo: 'success',
        });
        handleCerrarDialogoCancelacion();
        await loadVentas(); // Recargar lista
      } else {
        setErrorMotivo(response.error || 'Error al cancelar la venta');
      }
    } catch (err: any) {
      setErrorMotivo(err.message || 'Error de conexión al cancelar la venta');
    } finally {
      setCancelando(null);
    }
  };

  const handleAbrirDialogoEliminacion = (venta: Venta) => {
    setVentaAEliminar(venta);
    setDialogoEliminacion(true);
  };

  const handleCerrarDialogoEliminacion = () => {
    if (!eliminando) {
      setDialogoEliminacion(false);
      setVentaAEliminar(null);
    }
  };

  const handleEliminarVenta = async () => {
    if (!ventaAEliminar) return;

    try {
      setEliminando(true);

      const url = `${API_ENDPOINTS.SALES}/${ventaAEliminar.id}`;
      const response = await apiService.delete(url);

      if (response.success) {
        setSnackbar({
          open: true,
          message: `✓ Venta #${ventaAEliminar.id} eliminada permanentemente`,
          tipo: 'success',
        });
        handleCerrarDialogoEliminacion();
        await loadVentas(); // Recargar lista
      } else {
        setSnackbar({
          open: true,
          message: `✗ Error al eliminar: ${response.error || 'Error desconocido'}`,
          tipo: 'warning',
        });
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: `✗ Error de conexión al eliminar la venta: ${err.message}`,
        tipo: 'warning',
      });
    } finally {
      setEliminando(false);
    }
  };

  const puedeCancelar = (venta: Venta) => {
    // Debe estar autenticado
    if (!usuario) {
      return false;
    }
    
    // No se puede cancelar si ya está cancelada
    if (venta.estado === 'CANCELADA') {
      return false;
    }

    // Los administradores pueden cancelar cualquier venta sin restricción de tiempo
    if (usuario.rol === 'ADMIN') {
      return true;
    }

    // Para otros roles, validar restricción temporal (últimas 24 horas)
    const fechaVenta = new Date(venta.fecha);
    const ahora = new Date();
    const horasDiferencia = (ahora.getTime() - fechaVenta.getTime()) / (1000 * 60 * 60);
    
    return horasDiferencia <= 24;
  };

  const puedeEditar = (venta: Venta) => {
    // Mismas condiciones que cancelar
    return puedeCancelar(venta);
  };

  const handleAbrirDialogoEdicion = async (venta: Venta) => {
    setVentaSeleccionada(venta);
    setItemsEditados([...venta.items]);
    setPagosEditados([...venta.pagos]);
    setNotaEditada(venta.nota || '');
    setFechaEditada(venta.fecha);
    setErrorEdicion(null);
    
    // Cargar productos y métodos de pago
    try {
      const [productosRes, metodosRes] = await Promise.all([
        apiService.get(API_ENDPOINTS.PRODUCTS),
        apiService.get(API_ENDPOINTS.PAYMENT_METHODS_ACTIVOS),
      ]);
      
      if (productosRes.success && productosRes.data) {
        // Cargar variantes para cada producto base
        const productosConVariantes = await Promise.all(
          productosRes.data.map(async (producto: any) => {
            if (!producto.productoBaseId && producto.activo) {
              // Es un producto base, cargar sus variantes
              try {
                const variantesRes = await apiService.get(`${API_ENDPOINTS.PRODUCTS}/${producto.id}/variantes`);
                if (variantesRes.success && variantesRes.data) {
                  return { ...producto, variantes: variantesRes.data };
                }
              } catch (err) {
                console.error(`Error al cargar variantes de producto ${producto.id}:`, err);
              }
            }
            return producto;
          })
        );
        
        // Agregar productos de la venta que no estén en la lista (por si son variantes o productos eliminados)
        // const productosIdsEnVenta = new Set(venta.items.map(item => item.productoId)); // No usado
        const productosIdsDisponibles = new Set(productosConVariantes.map(p => p.id));
        const productosFaltantes = venta.items
          .filter(item => !productosIdsDisponibles.has(item.productoId))
          .map(item => {
            // Crear un objeto producto básico para los productos que no están en la lista
            return {
              id: item.productoId,
              nombre: item.productoNombre,
              precio: item.precioUnitario,
              activo: true,
              productoBaseId: null,
              nombreVariante: null,
              ordenVariante: null,
            };
          });
        
        setProductos([...productosConVariantes, ...productosFaltantes]);
      }
      if (metodosRes.success && metodosRes.data) {
        setMetodosPago(metodosRes.data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
    
    setDialogoEdicion(true);
  };

  const handleCerrarDialogoEdicion = () => {
    setDialogoEdicion(false);
    setVentaSeleccionada(null);
    setItemsEditados([]);
    setPagosEditados([]);
    setNotaEditada('');
    setFechaEditada('');
    setEditandoFecha(false);
    setErrorEdicion(null);
  };

  const handleAgregarItem = () => {
    if (productos.length === 0) return;
    
    // Buscar el primer producto base activo
    const productoBase = productos.find(p => !p.productoBaseId && p.activo);
    if (!productoBase) return;
    
    // Si tiene variantes, mostrar diálogo de selección
    if (productoBase.variantes && productoBase.variantes.length > 0) {
      setProductoSeleccionadoParaVariante(productoBase);
      setIndiceItemParaVariante(null); // null significa que es un nuevo item
      setDialogoVariantes(true);
    } else {
      // Si no tiene variantes, agregar directamente
      // Construir nombre completo: si es variante, incluir nombre base + variante
      let nombreCompleto = productoBase.nombre;
      if (productoBase.productoBaseId) {
        const productoBasePadre = productos.find(p => p.id === productoBase.productoBaseId);
        if (productoBasePadre) {
          nombreCompleto = `${productoBasePadre.nombre} - ${productoBase.nombreVariante || productoBase.nombre}`;
        }
      }
      
      const nuevoItem: VentaItem = {
        id: 0,
        productoId: productoBase.id,
        productoNombre: nombreCompleto,
        cantidad: 1,
        precioUnitario: productoBase.precio,
        subtotal: productoBase.precio,
      };
      setItemsEditados([...itemsEditados, nuevoItem]);
      setSnackbar({
        open: true,
        message: `✓ Producto "${nombreCompleto}" agregado`,
        tipo: 'success',
      });
    }
  };

  const handleEliminarItem = (index: number) => {
    const itemAEliminar = itemsEditados[index];
    const montoARegresar = itemAEliminar.subtotal;
    
    // Calcular el total actual de pagos
    const totalPagos = pagosEditados.reduce((sum, p) => sum + p.monto, 0);
    const nuevoTotalVenta = calcularTotal() - montoARegresar;
    
    // Si los pagos exceden el nuevo total, mostrar advertencia
    if (totalPagos > nuevoTotalVenta) {
      const exceso = totalPagos - nuevoTotalVenta;
      setSnackbar({
        open: true,
        message: `⚠️ Producto eliminado. Debe regresar $${montoARegresar.toFixed(2)} al cliente. Los pagos actuales exceden el nuevo total en $${exceso.toFixed(2)}.`,
        tipo: 'warning',
      });
    } else {
      setSnackbar({
        open: true,
        message: `✓ Producto eliminado. Debe regresar $${montoARegresar.toFixed(2)} al cliente.`,
        tipo: 'info',
      });
    }
    
    setItemsEditados(itemsEditados.filter((_, i) => i !== index));
  };

  const handleActualizarItem = (index: number, campo: string, valor: any) => {
    if (campo === 'productoId') {
      const producto = productos.find(p => p.id === valor);
      if (producto) {
        // Si el producto tiene variantes, mostrar diálogo de selección
        if (producto.variantes && producto.variantes.length > 0) {
          setProductoSeleccionadoParaVariante(producto);
          setIndiceItemParaVariante(index);
          setDialogoVariantes(true);
        } else {
          // Si no tiene variantes, actualizar directamente
          // Construir nombre completo: si es variante, incluir nombre base + variante
          let nombreCompleto = producto.nombre;
          if (producto.productoBaseId) {
            const productoBase = productos.find(p => p.id === producto.productoBaseId);
            if (productoBase) {
              nombreCompleto = `${productoBase.nombre} - ${producto.nombreVariante || producto.nombre}`;
            }
          }
          
          const nuevosItems = [...itemsEditados];
          nuevosItems[index] = {
            ...nuevosItems[index],
            productoId: producto.id,
            productoNombre: nombreCompleto,
            precioUnitario: producto.precio,
            subtotal: producto.precio * nuevosItems[index].cantidad,
          };
          setItemsEditados(nuevosItems);
          setSnackbar({
            open: true,
            message: `✓ Producto cambiado a "${nombreCompleto}"`,
            tipo: 'success',
          });
        }
      }
    } else if (campo === 'cantidad') {
      const cantidad = parseInt(valor) || 1;
      const nuevosItems = [...itemsEditados];
      nuevosItems[index] = {
        ...nuevosItems[index],
        cantidad,
        subtotal: nuevosItems[index].precioUnitario * cantidad,
      };
      setItemsEditados(nuevosItems);
    }
  };

  const handleSeleccionarVariante = (variante: any) => {
    // Asegurar que la variante esté en la lista de productos disponibles
    const varianteExiste = productos.some(p => p.id === variante.id);
    if (!varianteExiste) {
      // Agregar la variante a la lista de productos
      setProductos(prev => [...prev, {
        ...variante,
        nombre: `${productoSeleccionadoParaVariante?.nombre} - ${variante.nombreVariante || variante.nombre}`,
      }]);
    }
    
    if (indiceItemParaVariante === null) {
      // Es un nuevo item
      const nuevoItem: VentaItem = {
        id: 0,
        productoId: variante.id,
        productoNombre: `${productoSeleccionadoParaVariante?.nombre} - ${variante.nombreVariante || variante.nombre}`,
        cantidad: 1,
        precioUnitario: variante.precio,
        subtotal: variante.precio,
      };
      setItemsEditados([...itemsEditados, nuevoItem]);
      setSnackbar({
        open: true,
        message: `✓ Producto "${productoSeleccionadoParaVariante?.nombre} - ${variante.nombreVariante || variante.nombre}" agregado`,
        tipo: 'success',
      });
    } else {
      // Es edición de un item existente
      const nuevosItems = [...itemsEditados];
      nuevosItems[indiceItemParaVariante] = {
        ...nuevosItems[indiceItemParaVariante],
        productoId: variante.id,
        productoNombre: `${productoSeleccionadoParaVariante?.nombre} - ${variante.nombreVariante || variante.nombre}`,
        precioUnitario: variante.precio,
        subtotal: variante.precio * nuevosItems[indiceItemParaVariante].cantidad,
      };
      setItemsEditados(nuevosItems);
      setSnackbar({
        open: true,
        message: `✓ Producto cambiado a "${productoSeleccionadoParaVariante?.nombre} - ${variante.nombreVariante || variante.nombre}"`,
        tipo: 'success',
      });
    }
    
    setDialogoVariantes(false);
    setProductoSeleccionadoParaVariante(null);
    setIndiceItemParaVariante(null);
  };

  const handleAgregarProductoBase = () => {
    if (!productoSeleccionadoParaVariante) return;
    
    if (indiceItemParaVariante === null) {
      // Es un nuevo item
      const nuevoItem: VentaItem = {
        id: 0,
        productoId: productoSeleccionadoParaVariante.id,
        productoNombre: productoSeleccionadoParaVariante.nombre,
        cantidad: 1,
        precioUnitario: productoSeleccionadoParaVariante.precio,
        subtotal: productoSeleccionadoParaVariante.precio,
      };
      setItemsEditados([...itemsEditados, nuevoItem]);
      setSnackbar({
        open: true,
        message: `✓ Producto "${productoSeleccionadoParaVariante.nombre}" agregado`,
        tipo: 'success',
      });
    } else {
      // Es edición de un item existente
      const nuevosItems = [...itemsEditados];
      nuevosItems[indiceItemParaVariante] = {
        ...nuevosItems[indiceItemParaVariante],
        productoId: productoSeleccionadoParaVariante.id,
        productoNombre: productoSeleccionadoParaVariante.nombre,
        precioUnitario: productoSeleccionadoParaVariante.precio,
        subtotal: productoSeleccionadoParaVariante.precio * nuevosItems[indiceItemParaVariante].cantidad,
      };
      setItemsEditados(nuevosItems);
      setSnackbar({
        open: true,
        message: `✓ Producto cambiado a "${productoSeleccionadoParaVariante.nombre}"`,
        tipo: 'success',
      });
    }
    
    setDialogoVariantes(false);
    setProductoSeleccionadoParaVariante(null);
    setIndiceItemParaVariante(null);
  };

  // Función no usada - comentada completamente
  // const handleAgregarPago = () => {
  //   if (metodosPago.length === 0) return;
  //   const totalVenta = calcularTotal();
  //   const totalPagos = pagosEditados.reduce((sum, p) => sum + p.monto, 0);
  //   const restante = Math.max(0, totalVenta - totalPagos);
  //   
  //   const nuevoPago: Pago = {
  //     id: 0,
  //     metodoPagoId: metodosPago[0].id,
  //     metodoPagoNombre: metodosPago[0].nombre,
  //     monto: restante > 0 ? restante : 0,
  //     referencia: '',
  //     fecha: new Date().toISOString(),
  //   };
  //   setPagosEditados([...pagosEditados, nuevoPago]);
  //   setSnackbar({
  //     open: true,
  //     message: `✓ Pago agregado ($${nuevoPago.monto.toFixed(2)})`,
  //     tipo: 'success',
  //   });
  // };

  const handleEliminarPago = (index: number) => {
    const pagoEliminado = pagosEditados[index];
    setPagosEditados(pagosEditados.filter((_, i) => i !== index));
    setSnackbar({
      open: true,
      message: `✓ Pago de ${pagoEliminado.metodoPagoNombre} ($${pagoEliminado.monto.toFixed(2)}) eliminado`,
      tipo: 'info',
    });
  };

  const handleActualizarPago = (index: number, campo: string, valor: any) => {
    const nuevosPagos = [...pagosEditados];
    if (campo === 'metodoPagoId') {
      const metodo = metodosPago.find(m => m.id === valor);
      if (metodo) {
        nuevosPagos[index] = {
          ...nuevosPagos[index],
          metodoPagoId: metodo.id,
          metodoPagoNombre: metodo.nombre,
        };
      }
    } else {
      nuevosPagos[index] = {
        ...nuevosPagos[index],
        [campo]: campo === 'monto' ? parseFloat(valor) || 0 : valor,
      };
    }
    setPagosEditados(nuevosPagos);
  };

  const calcularTotal = () => {
    return itemsEditados.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleGuardarEdicion = async () => {
    if (!ventaSeleccionada) return;

    try {
      setEditando(ventaSeleccionada.id);
      setErrorEdicion(null);

      // Verificar si solo cambió la fecha (sin editar items/pagos/nota)
      const soloFechaCambio = 
        JSON.stringify(itemsEditados) === JSON.stringify(ventaSeleccionada.items) &&
        JSON.stringify(pagosEditados) === JSON.stringify(ventaSeleccionada.pagos) &&
        notaEditada === (ventaSeleccionada.nota || '');

      if (soloFechaCambio && fechaEditada !== ventaSeleccionada.fecha) {
        // Solo actualizar la fecha usando el endpoint específico
        // Convertir la fecha al formato YYYY-MM-DDTHH:mm:ss (sin la Z)
        const fecha = new Date(fechaEditada);
        const fechaLocal = fecha.toISOString().replace('Z', '').slice(0, 19);
        const fechaResponse = await apiService.put(
          `${API_ENDPOINTS.SALES}/${ventaSeleccionada.id}/fecha?fecha=${encodeURIComponent(fechaLocal)}`
        );
        
        if (fechaResponse.success) {
          setSnackbar({
            open: true,
            message: `✓ Fecha de venta #${ventaSeleccionada.id} actualizada exitosamente`,
            tipo: 'success',
          });
          handleCerrarDialogoEdicion();
          await loadVentas();
        } else {
          setErrorEdicion(fechaResponse.error || 'Error al actualizar la fecha');
        }
      } else {
        // Se editaron items, pagos o nota: requiere validación completa
        if (itemsEditados.length === 0) {
          setErrorEdicion('La venta debe tener al menos un item');
          return;
        }

        if (pagosEditados.length === 0) {
          setErrorEdicion('La venta debe tener al menos un pago');
          return;
        }

        const totalVenta = calcularTotal();
        const totalPagos = pagosEditados.reduce((sum, pago) => sum + pago.monto, 0);

        if (totalPagos < totalVenta) {
          setErrorEdicion(`El total de pagos ($${totalPagos.toFixed(2)}) no cubre el total de la venta ($${totalVenta.toFixed(2)})`);
          return;
        }

        const request = {
          sucursalId: ventaSeleccionada.sucursalId,
          items: itemsEditados.map(item => ({
            productoId: item.productoId,
            productoNombre: item.productoNombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            nota: item.nota,
          })),
          pagos: pagosEditados.map(pago => ({
            metodoPagoId: pago.metodoPagoId,
            monto: pago.monto,
            referencia: pago.referencia || null,
          })),
          nota: notaEditada,
          canal: ventaSeleccionada.canal,
          fecha: fechaEditada !== ventaSeleccionada.fecha ? new Date(fechaEditada).toISOString() : null,
        };

        const response = await apiService.put(`${API_ENDPOINTS.SALES}/${ventaSeleccionada.id}`, request);

        if (response.success) {
          setSnackbar({
            open: true,
            message: `✓ Venta #${ventaSeleccionada.id} actualizada exitosamente`,
            tipo: 'success',
          });
          handleCerrarDialogoEdicion();
          await loadVentas();
        } else {
          setErrorEdicion(response.error || 'Error al actualizar la venta');
        }
      }
    } catch (err: any) {
      setErrorEdicion(err.message || 'Error de conexión al actualizar la venta');
    } finally {
      setEditando(null);
    }
  };

  const getEstadoColor = (estado: string): 'success' | 'error' | 'warning' | 'default' => {
    if (estado === 'PAGADA') return 'success';
    if (estado === 'CANCELADA') return 'error';
    if (estado === 'PENDIENTE') return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Ventas</Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadVentas}
          sx={{ minHeight: '48px' }}
        >
          Actualizar
        </Button>
      </Box>

      {/* Filtro de fechas + Paginador de Días */}
      {/* Filtro de fechas y paginador de días dentro del mismo recuadro */}
      <DateRangeFilter 
        onChange={handleDateRangeChange} 
        initialRange={dateRange}
        label="Filtrar ventas por fecha"
      >
        {/* Paginador de Días */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'flex-end', mt: { xs: 2, md: 0 } }}>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => handleCambiarDia(diaSeleccionado - 1)}
            startIcon={<ChevronLeft />}
          >
            Atrás
          </Button>
          <Typography variant="body2" sx={{ minWidth: '120px', textAlign: 'center', fontWeight: 500 }}>
            {diaSeleccionado === 0 ? (
              'Hoy'
            ) : (
              `Hace ${Math.abs(diaSeleccionado)} día${Math.abs(diaSeleccionado) > 1 ? 's' : ''}`
            )}
          </Typography>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => handleCambiarDia(diaSeleccionado + 1)}
            disabled={diaSeleccionado >= 0}
            endIcon={<ChevronRight />}
          >
            Adelante
          </Button>
        </Box>
      </DateRangeFilter>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Resumen de resultados */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {ventasFiltradas.length} de {ventas.length} ventas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: ${ventasFiltradas.reduce((sum, v) => sum + v.total, 0).toFixed(2)}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Método Pago</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No hay ventas en el rango de fechas seleccionado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              ventasFiltradas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell>#{venta.id}</TableCell>
                  <TableCell>
                    {format(new Date(venta.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      ${venta.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={venta.estado}
                      color={getEstadoColor(venta.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ maxWidth: 250 }}>
                      {venta.items.length === 1 ? (
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {venta.items[0].cantidad}x {venta.items[0].productoNombre}
                        </Typography>
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            {venta.items.length} productos:
                          </Typography>
                          {venta.items.slice(0, 2).map((item, index) => (
                            <Typography key={index} variant="caption" display="block" color="text.secondary">
                              {item.cantidad}x {item.productoNombre}
                            </Typography>
                          ))}
                          {venta.items.length > 2 && (
                            <>
                              <Typography 
                                ref={(el) => { 
                                  if (el) {
                                    tooltipRefs.current[venta.id] = el;
                                  } else {
                                    delete tooltipRefs.current[venta.id];
                                  }
                                }}
                                variant="caption" 
                                color="primary" 
                                onClick={() => setTooltipOpen(prev => ({ ...prev, [venta.id]: !prev[venta.id] }))}
                                sx={{ 
                                  fontStyle: 'italic', 
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  '&:hover': { color: 'primary.dark' }
                                }}
                              >
                                +{venta.items.length - 2} más... (ver todos)
                              </Typography>
                              {tooltipOpen[venta.id] && tooltipRefs.current[venta.id] && (
                                <Popper
                                  open={true}
                                  anchorEl={tooltipRefs.current[venta.id]}
                                  placement="right-start"
                                  sx={{ zIndex: 1300 }}
                                  disablePortal={false}
                                  modifiers={[
                                    {
                                      name: 'preventOverflow',
                                      enabled: true,
                                      options: {
                                        altAxis: true,
                                        altBoundary: true,
                                        tether: true,
                                        rootBoundary: 'document',
                                      },
                                    },
                                  ]}
                                >
                                  <ClickAwayListener onClickAway={() => setTooltipOpen(prev => ({ ...prev, [venta.id]: false }))}>
                                    <Paper
                                      elevation={8}
                                      sx={{
                                        p: 2,
                                        maxWidth: 300,
                                        ml: 1
                                      }}
                                    >
                                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                        Todos los productos:
                                      </Typography>
                                      {venta.items.map((item, index) => (
                                        <Typography key={index} variant="body2" display="block" sx={{ mb: 0.5 }}>
                                          {item.cantidad}x {item.productoNombre} - ${(item.precioUnitario * item.cantidad).toFixed(2)}
                                        </Typography>
                                      ))}
                                    </Paper>
                                  </ClickAwayListener>
                                </Popper>
                              )}
                            </>
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {venta.pagos.map(p => p.metodoPagoNombre).join(', ')}
                  </TableCell>
                  <TableCell>{venta.usuarioNombre || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {puedeEditar(venta) && (
                        <IconButton
                          color="primary"
                          onClick={() => handleAbrirDialogoEdicion(venta)}
                          size="small"
                          title="Editar venta"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {puedeCancelar(venta) && (
                        <IconButton
                          color="error"
                          onClick={() => handleAbrirDialogoCancelacion(venta)}
                          size="small"
                          title="Cancelar venta"
                        >
                          <Cancel />
                        </IconButton>
                      )}
                      {usuario?.rol === 'ADMIN' && venta.estado !== 'CANCELADA' && (
                        <IconButton
                          color="error"
                          onClick={() => handleAbrirDialogoEliminacion(venta)}
                          size="small"
                          title="Eliminar venta permanentemente (ADMIN)"
                          sx={{
                            backgroundColor: 'error.main',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de cancelación */}
      <Dialog
        open={dialogoCancelacion}
        onClose={handleCerrarDialogoCancelacion}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancelar Venta #{ventaSeleccionada?.id}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta acción cancelará la venta y revertirá los movimientos de inventario asociados.
            Esta acción no se puede deshacer.
          </Alert>

          {ventaSeleccionada && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha:</strong> {format(new Date(ventaSeleccionada.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Total:</strong> ${ventaSeleccionada.total.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Items:</strong> {ventaSeleccionada.items.length} producto(s)
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label="Motivo de cancelación *"
            multiline
            rows={4}
            value={motivoCancelacion}
            onChange={(e) => {
              setMotivoCancelacion(e.target.value);
              setErrorMotivo(null);
            }}
            error={!!errorMotivo}
            helperText={errorMotivo || 'Describe el motivo por el cual se cancela esta venta'}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarDialogoCancelacion} disabled={cancelando !== null}>
            Cancelar
          </Button>
          <Button
            onClick={handleCancelarVenta}
            variant="contained"
            color="error"
            disabled={cancelando !== null || !motivoCancelacion.trim()}
            startIcon={<Cancel />}
          >
            {cancelando !== null ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición - Simplificado y táctil-friendly */}
      <Dialog
        open={dialogoEdicion}
        onClose={handleCerrarDialogoEdicion}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography component="div" variant="h5" fontWeight="bold">
            Editar Venta #{ventaSeleccionada?.id}
          </Typography>
          {editandoFecha ? (
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <DatePicker
                  value={new Date(fechaEditada)}
                  onChange={(date) => {
                    if (date) {
                      setFechaEditada(date.toISOString());
                    }
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <Button size="small" variant="contained" onClick={() => setEditandoFecha(false)}>
                  Listo
                </Button>
                <Button size="small" onClick={() => {
                  setFechaEditada(ventaSeleccionada?.fecha || '');
                  setEditandoFecha(false);
                }}>
                  Cancelar
                </Button>
              </Box>
            </LocalizationProvider>
          ) : (
            <Typography
              component="div"
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setEditandoFecha(true)}
            >
              📅 {fechaEditada && format(new Date(fechaEditada), "dd/MM/yyyy HH:mm", { locale: es })}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          {errorEdicion && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorEdicion(null)}>
              {errorEdicion}
            </Alert>
          )}

          {/* Items - Diseño simple tipo carrito */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Productos
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            {itemsEditados.map((item, index) => {
              // const producto = productos.find(p => p.id === item.productoId); // No usado
              return (
                <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <Select
                            value={item.productoId}
                            onChange={(e) => handleActualizarItem(index, 'productoId', e.target.value)}
                            displayEmpty
                            renderValue={(selected) => {
                              if (!selected) return 'Seleccionar producto';
                              const prodEncontrado = productos.find(p => p.id === selected);
                              if (prodEncontrado) {
                                const nombreCompleto = prodEncontrado.productoBaseId 
                                  ? `${productos.find(p => p.id === prodEncontrado.productoBaseId)?.nombre || ''} - ${prodEncontrado.nombreVariante || prodEncontrado.nombre}`
                                  : prodEncontrado.nombre;
                                return nombreCompleto;
                              }
                              // Si no se encuentra, usar el nombre guardado en el item
                              return item.productoNombre || 'Producto desconocido';
                            }}
                            sx={{ minHeight: '56px', fontSize: '16px' }}
                          >
                            {/* Mostrar solo productos base y variantes individuales */}
                            {productos
                              .filter((prod) => !prod.productoBaseId || prod.activo) // Solo productos base o variantes activas
                              .map((prod) => {
                                // Si es una variante, mostrar el nombre completo
                                const nombreCompleto = prod.productoBaseId 
                                  ? `${productos.find(p => p.id === prod.productoBaseId)?.nombre || ''} - ${prod.nombreVariante || prod.nombre}`
                                  : prod.nombre;
                                
                                return (
                                  <MenuItem key={prod.id} value={prod.id} sx={{ minHeight: '48px' }}>
                                    <Box>
                                      <Typography variant="body1" fontWeight="medium">
                                        {nombreCompleto}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography component="span" variant="body2" color="text.secondary">
                                          ${prod.precio.toFixed(2)}
                                        </Typography>
                                        {prod.variantes && prod.variantes.length > 0 && (
                                          <Chip 
                                            label={`${prod.variantes.length} variantes`} 
                                            size="small" 
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </MenuItem>
                                );
                              })}
                            {/* Si el producto actual no está en la lista, agregarlo como opción */}
                            {(() => {
                              const productosDisponibles = productos.filter((prod) => !prod.productoBaseId || prod.activo);
                              const existe = productosDisponibles.some(p => p.id === item.productoId);
                              if (!existe && item.productoId) {
                                return (
                                  <MenuItem key={item.productoId} value={item.productoId} sx={{ minHeight: '48px' }}>
                                    <Box>
                                      <Typography variant="body1" fontWeight="medium">
                                        {item.productoNombre}
                                      </Typography>
                                      <Typography component="span" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                        ${item.precioUnitario.toFixed(2)}
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                );
                              }
                              return null;
                            })()}
                          </Select>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body1" sx={{ minWidth: '80px' }}>
                            Cantidad:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <IconButton
                              onClick={() => handleActualizarItem(index, 'cantidad', Math.max(1, item.cantidad - 1))}
                              sx={{ minWidth: '48px', minHeight: '48px' }}
                              color="primary"
                            >
                              <Remove />
                            </IconButton>
                            <Typography variant="h6" sx={{ minWidth: '50px', textAlign: 'center', fontSize: '20px' }}>
                              {item.cantidad}
                            </Typography>
                            <IconButton
                              onClick={() => handleActualizarItem(index, 'cantidad', item.cantidad + 1)}
                              sx={{ minWidth: '48px', minHeight: '48px' }}
                              color="primary"
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                      
                      <IconButton
                        color="error"
                        onClick={() => handleEliminarItem(index)}
                        sx={{ minWidth: '48px', minHeight: '48px', ml: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Subtotal:
                      </Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${item.subtotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAgregarItem}
              disabled={productos.length === 0}
              fullWidth
              sx={{ minHeight: '56px', fontSize: '16px', fontWeight: 'bold' }}
            >
              Agregar Producto
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Pagos - Diseño minimalista y rápido */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Pagos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendiente: ${Math.max(0, calcularTotal() - pagosEditados.reduce((sum, p) => sum + p.monto, 0)).toFixed(2)}
              </Typography>
            </Box>

            {/* Lista de pagos existentes - Compacta */}
            {pagosEditados.map((pago, index) => {
              const metodo = metodosPago.find(m => m.id === pago.metodoPagoId);
              // const totalPagos = pagosEditados.reduce((sum, p) => sum + p.monto, 0); // No usado aquí
              // const restante = calcularTotal() - totalPagos; // No usado aquí
              
              return (
                <Card key={index} variant="outlined" sx={{ mb: 1.5, borderRadius: 2 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Selector de método de pago - Compacto */}
                        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                          <Select
                            value={pago.metodoPagoId}
                            onChange={(e) => handleActualizarPago(index, 'metodoPagoId', e.target.value)}
                            sx={{
                              minHeight: '44px',
                              fontSize: '15px',
                              fontWeight: 'bold',
                            }}
                          >
                            {metodosPago.map((met) => (
                              <MenuItem key={met.id} value={met.id} sx={{ minHeight: '44px' }}>
                                {met.nombre}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        {/* Campo de monto - Grande y visible con botón de auto-completar */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ minWidth: '50px' }}>
                            Monto:
                          </Typography>
                          <TextField
                            type="number"
                            value={pago.monto}
                            onChange={(e) => {
                              const nuevoMonto = parseFloat(e.target.value) || 0;
                              handleActualizarPago(index, 'monto', nuevoMonto);
                            }}
                            inputProps={{ step: '0.01', min: '0' }}
                            sx={{
                              flex: 1,
                              '& .MuiInputBase-root': {
                                minHeight: '52px',
                                fontSize: '20px',
                                fontWeight: 'bold',
                              },
                              '& .MuiOutlinedInput-input': {
                                textAlign: 'right',
                                padding: '14px',
                              },
                            }}
                            placeholder="0.00"
                          />
                          <Typography variant="h6" color="text.secondary" sx={{ minWidth: '20px' }}>
                            $
                          </Typography>
                        </Box>
                        
                        {/* Campo de referencia - Solo si es necesario */}
                        {metodo?.requiereReferencia && (
                          <TextField
                            placeholder="Referencia"
                            value={pago.referencia || ''}
                            onChange={(e) => handleActualizarPago(index, 'referencia', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ mt: 1, '& .MuiInputBase-root': { minHeight: '40px' } }}
                          />
                        )}
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleEliminarPago(index)}
                        sx={{ minWidth: '48px', minHeight: '48px', mt: 0.5 }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}

            {/* Botones rápidos para agregar pagos comunes */}
            {pagosEditados.length === 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                  gap: 1.5,
                  mb: 2,
                }}
              >
                {metodosPago.slice(0, 6).map((metodo) => (
                  <Button
                    key={metodo.id}
                    variant="outlined"
                    onClick={() => {
                      const totalVenta = calcularTotal();
                      const nuevoPago: Pago = {
                        id: 0,
                        metodoPagoId: metodo.id,
                        metodoPagoNombre: metodo.nombre,
                        monto: totalVenta, // Auto-completar con el total pendiente
                        referencia: '',
                        fecha: new Date().toISOString(),
                      };
                      setPagosEditados([...pagosEditados, nuevoPago]);
                      setSnackbar({
                        open: true,
                        message: `✓ Pago de ${metodo.nombre} agregado ($${totalVenta.toFixed(2)})`,
                        tipo: 'success',
                      });
                    }}
                    sx={{
                      minHeight: '64px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                      },
                    }}
                  >
                    {metodo.nombre}
                  </Button>
                ))}
              </Box>
            )}

            {/* Botón para agregar otro pago si ya hay pagos */}
            {pagosEditados.length > 0 && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  const totalVenta = calcularTotal();
                  const totalPagos = pagosEditados.reduce((sum, p) => sum + p.monto, 0);
                  const restante = Math.max(0, totalVenta - totalPagos);
                  
                  const nuevoPago: Pago = {
                    id: 0,
                    metodoPagoId: metodosPago[0]?.id || 0,
                    metodoPagoNombre: metodosPago[0]?.nombre || '',
                    monto: restante > 0 ? restante : 0, // Auto-completar con el restante
                    referencia: '',
                    fecha: new Date().toISOString(),
                  };
                  setPagosEditados([...pagosEditados, nuevoPago]);
                  setSnackbar({
                    open: true,
                    message: `✓ Pago adicional agregado ($${restante.toFixed(2)})`,
                    tipo: 'success',
                  });
                }}
                fullWidth
                sx={{ minHeight: '56px', fontSize: '16px', fontWeight: 'bold' }}
              >
                Agregar Otro Pago
              </Button>
            )}
          </Box>

          {/* Resumen total - Mejorado */}
          <Card sx={{ backgroundColor: 'primary.main', color: 'white', mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Total Venta:</Typography>
                <Typography variant="h5" fontWeight="bold">
                  ${calcularTotal().toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Total Pagos:</Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${pagosEditados.reduce((sum, p) => sum + p.monto, 0).toFixed(2)}
                </Typography>
              </Box>
              {(() => {
                const totalVenta = calcularTotal();
                const totalPagos = pagosEditados.reduce((sum, p) => sum + p.monto, 0);
                const diferencia = totalPagos - totalVenta;
                
                if (diferencia < 0) {
                  return (
                    <Alert severity="warning" sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      Faltan ${Math.abs(diferencia).toFixed(2)}
                    </Alert>
                  );
                } else if (diferencia > 0) {
                  return (
                    <Alert severity="success" sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      Cambio: ${diferencia.toFixed(2)}
                    </Alert>
                  );
                } else {
                  return (
                    <Alert severity="success" sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                      ✓ Pago completo
                    </Alert>
                  );
                }
              })()}
            </CardContent>
          </Card>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2, gap: 2 }}>
          <Button
            onClick={handleCerrarDialogoEdicion}
            disabled={editando !== null}
            variant="outlined"
            sx={{ minHeight: '56px', fontSize: '16px', fontWeight: 'bold', flex: 1 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarEdicion}
            variant="contained"
            color="primary"
            disabled={editando !== null || itemsEditados.length === 0 || pagosEditados.length === 0}
            startIcon={<Edit />}
            sx={{ minHeight: '56px', fontSize: '16px', fontWeight: 'bold', flex: 1 }}
          >
            {editando !== null ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para seleccionar variantes */}
      <Dialog
        open={dialogoVariantes}
        onClose={() => {
          setDialogoVariantes(false);
          setProductoSeleccionadoParaVariante(null);
          setIndiceItemParaVariante(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Seleccionar Variante de {productoSeleccionadoParaVariante?.nombre}
        </DialogTitle>
        <DialogContent>
          <List>
            {productoSeleccionadoParaVariante?.variantes?.map((variante: any, index: number) => (
              <div key={variante.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleSeleccionarVariante(variante)}
                    sx={{ minHeight: '64px' }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">
                            {variante.nombreVariante || variante.nombre}
                          </Typography>
                          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                            ${variante.precio.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                      secondary={variante.descripcion}
                    />
                  </ListItemButton>
                </ListItem>
                {index < (productoSeleccionadoParaVariante?.variantes?.length || 0) - 1 && <Divider />}
              </div>
            ))}
          </List>
          {productoSeleccionadoParaVariante && productoSeleccionadoParaVariante.precio > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAgregarProductoBase}
                sx={{ minHeight: '56px', fontSize: '16px', fontWeight: 'bold' }}
              >
                {productoSeleccionadoParaVariante.nombre} - ${productoSeleccionadoParaVariante.precio.toFixed(2)}
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDialogoVariantes(false);
              setProductoSeleccionadoParaVariante(null);
              setIndiceItemParaVariante(null);
            }}
            sx={{ minHeight: '48px' }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de eliminación permanente (ADMIN) */}
      <Dialog
        open={dialogoEliminacion}
        onClose={handleCerrarDialogoEliminacion}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          ⚠️ ELIMINAR VENTA PERMANENTEMENTE
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                ⚠️ ESTA ACCIÓN ES IRREVERSIBLE ⚠️
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Esta operación eliminará PERMANENTEMENTE la venta y todos sus datos asociados:
              </Typography>
              <ul style={{ marginTop: '8px', marginBottom: '8px', marginLeft: '20px' }}>
                <li>Registro de la venta</li>
                <li>Todos los items vendidos</li>
                <li>Todos los pagos registrados</li>
                <li>Movimientos de inventario</li>
              </ul>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Esta acción NO se puede deshacer. Los datos se perderán para siempre.
              </Typography>
            </Box>
          </Alert>

          {ventaAEliminar && (
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ mb: 1, color: 'error.main' }}>
                Venta #{ventaAEliminar.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Fecha:</strong> {format(new Date(ventaAEliminar.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Total:</strong> ${ventaAEliminar.total.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Items:</strong> {ventaAEliminar.items.length} producto(s)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Estado:</strong> {ventaAEliminar.estado}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCerrarDialogoEliminacion}
            disabled={eliminando}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminarVenta}
            variant="contained"
            color="error"
            disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={20} /> : <Delete />}
            sx={{ fontWeight: 'bold' }}
          >
            {eliminando ? 'Eliminando...' : 'Confirmar Eliminación Permanente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.tipo}
          sx={{ width: '100%', fontSize: '15px' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
