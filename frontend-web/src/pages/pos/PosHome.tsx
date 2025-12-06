import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Collapse,
  Badge,
  Snackbar,
} from '@mui/material';
import { TextField } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Payment, ShoppingCart, ExpandMore, Add, Remove, Restaurant, LunchDining, Fastfood, BreakfastDining, CheckCircle, Refresh } from '@mui/icons-material';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useCart } from '../../contexts/CartContext';
import { websocketService } from '../../services/websocket.service';
import { userPreferencesService } from '../../services/userPreferences.service';
import { useSubcategorias } from '../../hooks/useSubcategorias';
import type { CategoriaSubcategoria } from '../../types/subcategorias.types';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoriaId: number | null;
  categoriaNombre: string | null;
  activo: boolean;
  productoBaseId?: number | null;
  nombreVariante?: string | null;
  ordenVariante?: number | null;
  variantes?: Producto[]; // Lista de variantes si este es un producto base
}

export default function PosHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, removeFromCart, updateQuantity, updateItemPrice, itemCount, total } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(() => {
    // Intentar restaurar la categoría guardada al inicializar
    // Nota: esto puede ser null si aún no se han cargado las categorías
    return userPreferencesService.getPosSelectedCategory();
  });
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState<number | null>(() => {
    // Restaurar la subcategoría guardada al montar el componente
    return userPreferencesService.getPosSubcategoryId();
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState(false);
  const [dialogoVariantes, setDialogoVariantes] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [carritoExpandido, setCarritoExpandido] = useState(true);
  // Estado local para edición inline de precio por item del carrito
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<string>('');
  const mostrarMensajeRef = useRef(false);
  const timerCompletadoRef = useRef(false);

  // Hook para cargar subcategorías de la categoría seleccionada
  const { data: subcategoriasData, isLoading: loadingSubcategorias } = useSubcategorias(
    categoriaSeleccionada || null
  );
  
  const subcategorias: CategoriaSubcategoria[] = Array.isArray(subcategoriasData?.data)
    ? subcategoriasData.data
    : [];

  // Obtiene el nombre base sin el sufijo de variante (Chico/Mediano/Grande)
  const obtenerNombreBase = (p: Producto): string => {
    if (!p?.nombreVariante) return p?.nombre ?? '';
    let nombre = (p?.nombre || '').trim();
    const sufijos = ['Chico', 'Mediano', 'Grande'];
    for (const sufijo of sufijos) {
      const re = new RegExp(`\\s+${sufijo}$`, 'i');
      if (re.test(nombre)) {
        nombre = nombre.replace(re, '').trim();
        break;
      }
    }
    return nombre;
  };

  useEffect(() => {
    // Detectar venta exitosa desde location.state o localStorage
    // SOLO ejecutar una vez al montar el componente
    if (mostrarMensajeRef.current) {
      return;
    }

    const ventaExitosaState = location.state?.ventaExitosa || localStorage.getItem('ventaExitosa') === 'true';
    
    if (ventaExitosaState) {
      mostrarMensajeRef.current = true;
      
      // Limpiar INMEDIATAMENTE
      localStorage.removeItem('ventaExitosa');
      if (location.state?.ventaExitosa) {
        window.history.replaceState({}, document.title);
      }
      
      // Mostrar el mensaje
      setVentaExitosa(true);
    }
  }, []);

  // Segundo useEffect para manejar el temporizador de ocultamiento
  useEffect(() => {
    if (!ventaExitosa) {
      timerCompletadoRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      timerCompletadoRef.current = true;
      setVentaExitosa(false);
    }, 8000);

    return () => {
      // Solo limpiar si el timer NO se completó
      if (!timerCompletadoRef.current) {
        clearTimeout(timeoutId);
      }
    };
  }, [ventaExitosa]);

  useEffect(() => {
    // Cargar datos y restaurar preferencias
    const initializeData = async () => {
      await loadData();
    };
    
    initializeData();

    // Conectar WebSocket para actualizaciones en tiempo real
    websocketService.connect();

    // Escuchar eventos de productos
    const unsubscribe = websocketService.on('productos', (message) => {
      if (message.tipo === 'PRODUCTO_CREADO' || message.tipo === 'PRODUCTO_ACTUALIZADO') {
        // Recargar productos cuando hay cambios
    loadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Determinar si la categoría seleccionada es "Desayunos" (debe estar antes de los useEffect que lo usan)
  const categoriaDesayunos = categorias.find(c => c.nombre === 'Desayunos');
  const esCategoriaDesayunos = categoriaSeleccionada === categoriaDesayunos?.id;

  // Guardar la categoría seleccionada cuando cambia
  useEffect(() => {
    // Solo guardar si las categorías ya están cargadas
    if (categorias.length > 0) {
      userPreferencesService.setPosSelectedCategory(categoriaSeleccionada);
      
      // Resetear subcategoría cuando cambia la categoría principal
      setSubcategoriaSeleccionada(null);
      userPreferencesService.setPosSubcategoryId(null);
    }
  }, [categoriaSeleccionada, categorias]);

  // Guardar la subcategoría cuando cambia
  useEffect(() => {
    if (subcategoriaSeleccionada !== null && categoriaSeleccionada !== null) {
      userPreferencesService.setPosSubcategoryId(subcategoriaSeleccionada);
    }
  }, [subcategoriaSeleccionada, categoriaSeleccionada]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías
      const categoriasResponse = await apiService.get(API_ENDPOINTS.CATEGORIES);
      if (categoriasResponse.success && categoriasResponse.data) {
        const categoriasCargadas = categoriasResponse.data;
        setCategorias(categoriasCargadas);
        
        // Siempre restaurar la categoría seleccionada guardada al cargar las categorías
        const categoriaGuardada = userPreferencesService.getPosSelectedCategory();
        if (categoriaGuardada !== null) {
          // Verificar que la categoría guardada existe en las categorías cargadas
          const categoriaExiste = categoriasCargadas.some((cat: { id: number }) => cat.id === categoriaGuardada);
          if (categoriaExiste) {
            // Restaurar la categoría (puede ser diferente a la inicializada si las categorías cambiaron)
            setCategoriaSeleccionada(categoriaGuardada);
            
            // Restaurar la subcategoría guardada si existe
            const subcategoriaGuardada = userPreferencesService.getPosSubcategoryId();
            setSubcategoriaSeleccionada(subcategoriaGuardada);
          } else {
            // Si la categoría no existe, limpiar la preferencia
            userPreferencesService.setPosSelectedCategory(null);
            userPreferencesService.setPosSubcategoryId(null);
            setCategoriaSeleccionada(null);
            setSubcategoriaSeleccionada(null);
          }
        }
      }

      // Cargar productos activos y disponibles en menú
      const productosResponse = await apiService.get(`${API_ENDPOINTS.PRODUCTS}?activo=true&enMenu=true`);
      if (productosResponse.success && productosResponse.data) {
        // Asegurar que el precio sea un número y filtrar solo activos y disponibles en menú
        const productosActivos = productosResponse.data
          .filter((p: any) => p.activo && p.disponibleEnMenu)
          .map((p: any) => ({
            ...p,
            precio: typeof p.precio === 'number' ? p.precio : parseFloat(p.precio) || 0,
          }));
        setProductos(productosActivos);
      } else {
        setError(productosResponse.error || 'Error al cargar productos');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar/refrescar el menú sin recarga de página
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setRefreshSuccess(false);
      
      // Cargar productos activos y disponibles en menú
      const productosResponse = await apiService.get(`${API_ENDPOINTS.PRODUCTS}?activo=true&enMenu=true`);
      if (productosResponse.success && productosResponse.data) {
        // Asegurar que el precio sea un número y filtrar solo activos y disponibles en menú
        const productosActivos = productosResponse.data
          .filter((p: any) => p.activo && p.disponibleEnMenu)
          .map((p: any) => ({
            ...p,
            precio: typeof p.precio === 'number' ? p.precio : parseFloat(p.precio) || 0,
          }));
        setProductos(productosActivos);
        setRefreshSuccess(true);
        
        // Mostrar mensaje de éxito durante 3 segundos
        setTimeout(() => setRefreshSuccess(false), 3000);
      } else {
        setError(productosResponse.error || 'Error al actualizar productos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el menú');
    } finally {
      setRefreshing(false);
    }
  };

  // Función para determinar la subcategoría de un producto de desayunos
  const obtenerSubcategoriaDesayuno = (nombreProducto: string): string => {
    const nombreLower = nombreProducto.toLowerCase();
    
    // Primero, intentar extraer subcategoría del prefijo [SUBCATEGORIA]
    const prefixMatch = nombreProducto.match(/^\[([^\]]+)\]/);
    if (prefixMatch) {
      const subcatDelPrefijo = prefixMatch[1].toUpperCase();
      // Normalizar a los valores válidos (en mayúsculas)
      if (['DULCES', 'LONCHES', 'SANDWICHES', 'OTROS'].includes(subcatDelPrefijo)) {
        return subcatDelPrefijo.toLowerCase();
      }
    }
    
    // Si no hay prefijo, usar detección por palabras clave
    // Dulces: molletes, waffles, mini hot cakes
    if (nombreLower.includes('mollete') || nombreLower.includes('waffle') || nombreLower.includes('hot cake')) {
      return 'dulces';
    }
    if (nombreLower.includes('lonche') && !nombreLower.includes('sandwich')) return 'lonches';
    if (nombreLower.includes('sandwich')) return 'sandwiches';
    return 'otros';
  };

  // Función para obtener el nombre limpio del producto (sin prefijo de subcategoría)
  const obtenerNombreLimpio = (nombreProducto: string): string => {
    // Remover el prefijo [SUBCATEGORIA] si existe
    return nombreProducto.replace(/^\[[^\]]+\]\s*/, '').trim();
  };

  // Función para obtener el tipo específico de producto en "Licuados y Chocomiles"
  const obtenerTipoProducto = (producto: Producto): string => {
    // Si no es de la categoría "Licuados y Chocomiles", retornar el nombre de la categoría normal
    if (producto.categoriaNombre !== 'Licuados y Chocomiles') {
      return producto.categoriaNombre || 'Sin categoría';
    }
    
    // Si es de "Licuados y Chocomiles", determinar si es "Licuado" o "Chocomilk"
    const nombreLower = producto.nombre.toLowerCase();
    
    // Lista de nombres de licuados (sin prefijo "Licuado de")
    const licuados = ['fresa', 'plátano', 'platano', 'manzana', 'papaya', 'frutas', 'cereales'];
    
    // Si el nombre contiene "chocomilk", es un chocomilk
    if (nombreLower.includes('chocomilk')) {
      return 'Chocomilk';
    }
    
    // Si el nombre está en la lista de licuados, es un licuado
    if (licuados.some(licuado => nombreLower === licuado || nombreLower.includes(licuado))) {
      return 'Licuado';
    }
    
    // Por defecto, retornar el nombre de la categoría
    return producto.categoriaNombre || 'Sin categoría';
  };

  // Función para obtener la subcategoría de un producto basada en su nombre
  const obtenerSubcategoriaDeProducto = (nombreProducto: string, subcategoriasDisponibles: CategoriaSubcategoria[]): number | null => {
    if (!nombreProducto || subcategoriasDisponibles.length === 0) return null;
    
    const nombreLower = nombreProducto.toLowerCase();
    
    // Primero, intentar extraer subcategoría del prefijo [SUBCATEGORIA]
    const prefixMatch = nombreProducto.match(/^\[([^\]]+)\]/);
    if (prefixMatch) {
      const subcatDelPrefijo = prefixMatch[1].toLowerCase();
      // Buscar la subcategoría que coincida con el prefijo
      const subcatEncontrada = subcategoriasDisponibles.find(
        s => s.nombre.toLowerCase() === subcatDelPrefijo
      );
      if (subcatEncontrada) {
        return subcatEncontrada.id || null;
      }
    }
    
    // Si no hay prefijo, usar detección por palabras clave
    for (const subcat of subcategoriasDisponibles) {
      const subcatNameLower = subcat.nombre.toLowerCase();
      if (nombreLower.includes(subcatNameLower)) {
        return subcat.id || null;
      }
    }
    
    return null;
  };

  // Filtrar productos
  let productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.categoriaId === categoriaSeleccionada)
    : productos;

  // Si hay una subcategoría seleccionada, filtrar por subcategoría
  if (subcategoriaSeleccionada !== null) {
    productosFiltrados = productosFiltrados.filter(p => {
      const subcatDelProducto = obtenerSubcategoriaDeProducto(p.nombre, subcategorias);
      return subcatDelProducto === subcategoriaSeleccionada;
    });
  }

  const handleProductoClick = (producto: Producto) => {
    // Si el producto tiene variantes, mostrar diálogo de selección
    if (producto.variantes && producto.variantes.length > 0) {
      setProductoSeleccionado(producto);
      setDialogoVariantes(true);
    } else {
      // Si no tiene variantes, agregar directamente al carrito
      addToCart(producto);
    }
  };

  const handleSeleccionarVariante = (variante: Producto) => {
    addToCart(variante);
    setDialogoVariantes(false);
    setProductoSeleccionado(null);
  };

  const handleAgregarProductoBase = () => {
    if (productoSeleccionado) {
      addToCart(productoSeleccionado);
      setDialogoVariantes(false);
      setProductoSeleccionado(null);
    }
  };

  const handleCarritoClick = () => {
    // Ir directamente a pago desde el carrito flotante
      navigate('/pos/payment');
  };

  const handleCerrarVentaExitosa = () => {
    setVentaExitosa(false);
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
      {/* Encabezado con título */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ m: 0 }}>
          Seleccionar Productos
        </Typography>
      </Box>

      {/* Notificación de actualización exitosa */}
      {refreshSuccess && (
        <Alert
          severity="success"
          onClose={() => setRefreshSuccess(false)}
          sx={{
            mb: 2,
            animation: 'slideDown 0.3s ease-out',
            '@keyframes slideDown': {
              '0%': {
                transform: 'translateY(-100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateY(0)',
                opacity: 1,
              },
            },
          }}
        >
          ✅ Menú actualizado correctamente
        </Alert>
      )}

      {/* Notificación de venta exitosa - Fija y muy visible */}
      {ventaExitosa && (
        <Alert
          severity="success"
          onClose={handleCerrarVentaExitosa}
          icon={<CheckCircle sx={{ fontSize: 32 }} />}
          sx={{
            mb: 3,
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: '#4caf50',
            color: 'white',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
            borderRadius: 2,
            padding: '16px 24px',
            animation: 'slideDown 0.5s ease-out',
            '@keyframes slideDown': {
              '0%': {
                transform: 'translateY(-100%)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateY(0)',
                opacity: 1,
              },
            },
            '& .MuiAlert-icon': {
              fontSize: '32px',
              color: 'white',
            },
            '& .MuiAlert-message': {
              fontSize: '20px',
              fontWeight: 700,
              color: 'white',
            },
            '& .MuiAlert-action': {
              color: 'white',
            },
          }}
        >
          ✅ ¡PAGO PROCESADO EXITOSAMENTE! 🎉
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros por categoría */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: subcategorias.length > 0 ? 2 : 0 }}>
        <Button
          variant={categoriaSeleccionada === null ? 'contained' : 'outlined'}
            onClick={() => {
              setCategoriaSeleccionada(null);
              setSubcategoriaSeleccionada(null);
            }}
          sx={{ minHeight: '48px' }}
        >
          Todas
        </Button>
        {categorias.map(cat => (
          <Button
            key={cat.id}
            variant={categoriaSeleccionada === cat.id ? 'contained' : 'outlined'}
              onClick={() => {
                setCategoriaSeleccionada(cat.id);
                if (cat.nombre !== 'Desayunos') {
                  setSubcategoriaSeleccionada(null);
                }
              }}
            sx={{ minHeight: '48px' }}
          >
            {cat.nombre}
          </Button>
        ))}
        </Box>

        {/* Subcategorías de la categoría seleccionada */}
        {subcategorias.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, p: 1.5, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
            {/* Botón para mostrar todas */}
            <Button
              variant={subcategoriaSeleccionada === null ? 'contained' : 'outlined'}
              onClick={() => setSubcategoriaSeleccionada(null)}
              size="small"
              sx={{ 
                minHeight: '36px',
                textTransform: 'none',
              }}
              startIcon={<Restaurant />}
            >
              TODAS
            </Button>
            
            {/* Botones para cada subcategoría */}
            {loadingSubcategorias ? (
              <CircularProgress size={24} />
            ) : (
              subcategorias.map(subcat => (
                <Button
                  key={subcat.id}
                  variant={subcategoriaSeleccionada === subcat.id ? 'contained' : 'outlined'}
                  onClick={() => setSubcategoriaSeleccionada(subcat.id)}
                  size="small"
                  sx={{ 
                    minHeight: '36px',
                    textTransform: 'none',
                  }}
                >
                  {subcat.nombre.toUpperCase()}
                </Button>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Grid de productos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
            xl: 'repeat(6, 1fr)',
          },
          gap: 2,
          pb: cart.length > 0 ? (carritoExpandido ? '320px' : '80px') : 2, // Espacio para el carrito
        }}
      >
        {productosFiltrados.map(producto => (
          <Card
            key={producto.id}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.02)',
                boxShadow: 8,
                zIndex: 1,
              },
            }}
            onClick={() => handleProductoClick(producto)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="h6" component="div" sx={{ 
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}>
                {obtenerNombreLimpio(producto.nombre)}
              </Typography>
              {!(producto.variantes && producto.variantes.length > 0) && (
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mt: 2 }}>
                  ${producto.precio.toFixed(2)}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Botón flotante de actualizar en la esquina inferior izquierda */}
      <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 900 }}>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Refresh sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />}
          sx={{
            textTransform: 'none',
            whiteSpace: 'nowrap',
            boxShadow: 3,
          }}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Box>

      {/* Resumen del carrito flotante */}
      {cart.length > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 1,
          }}
        >
          {/* Botón minimizado */}
          {!carritoExpandido && (
            <Badge 
              badgeContent={itemCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 1,
                  },
                  '50%': {
                    opacity: 0.7,
                  },
                },
              }}
            >
              <IconButton
                onClick={() => setCarritoExpandido(true)}
                sx={{
                  backgroundColor: 'primary.main',
            color: 'white',
                  width: 64,
                  height: 64,
                  boxShadow: 6,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.1)',
                    boxShadow: 8,
                  },
                }}
              >
                <ShoppingCart sx={{ fontSize: 28 }} />
              </IconButton>
            </Badge>
          )}

          {/* Carrito expandido */}
          <Collapse in={carritoExpandido} orientation="vertical">
            <Card
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                minWidth: '320px',
                maxWidth: '400px',
                maxHeight: '70vh',
                boxShadow: 12,
                display: 'flex',
                flexDirection: 'column',
          }}
        >
              <CardContent sx={{ flex: 1, overflow: 'auto', pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Carrito ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setCarritoExpandido(false)}
                    sx={{ color: 'white' }}
                  >
                    <ExpandMore />
                  </IconButton>
                </Box>
                
                {/* Lista de items del carrito */}
                <List sx={{ mb: 2, maxHeight: '300px', overflow: 'auto' }}>
                  {cart.map((item, index) => (
                    <ListItem
                      key={`${item.producto.id}-${index}`}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 1,
                        mb: 1,
                        py: 1,
                        flexDirection: 'column',
                        alignItems: 'stretch',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.producto.nombreVariante
                          ? `${obtenerNombreLimpio(obtenerNombreBase(item.producto))} - ${item.producto.nombreVariante}`
                          : obtenerNombreLimpio(item.producto.nombre)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.cantidad > 1) {
                                updateQuantity(item.producto.id, item.cantidad - 1);
                              } else {
                                removeFromCart(item.producto.id);
                              }
                            }}
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              width: 28,
                              height: 28,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              },
                            }}
                          >
                            <Remove sx={{ fontSize: 18 }} />
                          </IconButton>
                          <Typography variant="body2" component="span" sx={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>
                            {item.cantidad}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(item.producto.id, item.cantidad + 1);
                            }}
                            sx={{ 
                              color: 'white',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              width: 28,
                              height: 28,
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              },
                            }}
                          >
                            <Add sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                        {/* Precio total editable (afecta solo esta venta) */}
                        {editingPriceId === item.producto.id ? (
                          <TextField
                            size="small"
                            type="number"
                            autoFocus
                            value={editingPriceValue}
                            onChange={(e) => setEditingPriceValue(e.target.value)}
                            onBlur={() => {
                              const totalVal = parseFloat(editingPriceValue);
                              // Dividir el total entre la cantidad para obtener el precio unitario
                              const unitPrice = item.cantidad > 0 ? totalVal / item.cantidad : totalVal;
                              if (!isNaN(unitPrice) && unitPrice >= 0) {
                                updateItemPrice(item.producto.id, unitPrice);
                              }
                              setEditingPriceId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const totalVal = parseFloat(editingPriceValue);
                                const unitPrice = item.cantidad > 0 ? totalVal / item.cantidad : totalVal;
                                if (!isNaN(unitPrice) && unitPrice >= 0) {
                                  updateItemPrice(item.producto.id, unitPrice);
                                }
                                setEditingPriceId(null);
                              } else if (e.key === 'Escape') {
                                setEditingPriceId(null);
                              }
                            }}
                            inputProps={{min: '0' }}
                            sx={{ width: 100, '& input': { textAlign: 'right' } }}
                          />
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Chip
                              label={`$${((item.overridePrice ?? item.producto.precio) * item.cantidad).toFixed(2)}`}
                              onClick={() => {
                                setEditingPriceId(item.producto.id);
                                // Guardar el precio total (cantidad × unitario) para editar, sin decimales innecesarios
                                const totalPrice = (item.overridePrice ?? item.producto.precio) * item.cantidad;
                                setEditingPriceValue(String(totalPrice));
                              }}
                              sx={{
                                fontWeight: 700,
                                backgroundColor: 'rgba(255, 255, 255, 0)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '20px',
                                padding: '6px 10px',
                                height: 'auto',
                                mb: 0.5,
                                '& .MuiChip-label': {
                                  paddingLeft: 0,
                                  paddingRight: 0,
                                },
                              }}
                            />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '11px' }}>
                              ${(item.overridePrice ?? item.producto.precio).toFixed(2)} c/u
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0)', my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total:
          </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${total.toFixed(2)}
          </Typography>
                </Box>
                
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleCarritoClick}
                  sx={{ 
                    minHeight: '48px',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    boxShadow: 4,
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  startIcon={<Payment />}
          >
                  Ir a Pagar
          </Button>
              </CardContent>
            </Card>
          </Collapse>
        </Box>
      )}

      {/* Diálogo para seleccionar variantes */}
      <Dialog
        open={dialogoVariantes}
        onClose={() => {
          setDialogoVariantes(false);
          setProductoSeleccionado(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Seleccionar {productoSeleccionado?.nombre}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Este producto tiene diferentes tamaños/presentaciones disponibles. Selecciona una opción:
          </Typography>
          <List>
            {productoSeleccionado?.variantes?.map((variante, index) => (
              <div key={variante.id}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleSeleccionarVariante(variante)}>
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
                      secondary={variante.nombreVariante || variante.nombre}
                    />
                  </ListItemButton>
                </ListItem>
                {index < (productoSeleccionado?.variantes?.length || 0) - 1 && <Divider />}
              </div>
            ))}
          </List>
          {productoSeleccionado && productoSeleccionado.precio > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAgregarProductoBase}
                sx={{ minHeight: '48px' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography variant="body1">
                    {productoSeleccionado.nombre} (Precio base)
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    ${productoSeleccionado.precio.toFixed(2)}
                  </Typography>
                </Box>
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDialogoVariantes(false);
              setProductoSeleccionado(null);
            }}
          >
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

