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
import { useNavigate, useLocation } from 'react-router-dom';
import { Payment, ShoppingCart, ExpandMore, Add, Remove, Restaurant, LunchDining, Fastfood, BreakfastDining, CheckCircle } from '@mui/icons-material';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useCart } from '../../contexts/CartContext';
import { websocketService } from '../../services/websocket.service';
import { userPreferencesService } from '../../services/userPreferences.service';

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
  const { cart, addToCart, removeFromCart, updateQuantity, itemCount, total } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(() => {
    // Intentar restaurar la categoría guardada al inicializar
    // Nota: esto puede ser null si aún no se han cargado las categorías
    return userPreferencesService.getPosSelectedCategory();
  });
  const [subcategoriaDesayunos, setSubcategoriaDesayunos] = useState<string | null>(() => {
    // Restaurar la subcategoría guardada al montar el componente
    return userPreferencesService.getPosDesayunosSubcategory();
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ventaExitosa, setVentaExitosa] = useState(false);
  const [dialogoVariantes, setDialogoVariantes] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [carritoExpandido, setCarritoExpandido] = useState(true);
  const mostrarMensajeRef = useRef(false);
  const timerCompletadoRef = useRef(false);

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
      
      // Resetear subcategoría cuando cambia la categoría principal (solo si no es Desayunos)
      if (categoriaSeleccionada !== null) {
        const categoriaNombre = categorias.find(c => c.id === categoriaSeleccionada)?.nombre;
        if (categoriaNombre !== 'Desayunos') {
          setSubcategoriaDesayunos(null);
          userPreferencesService.setPosDesayunosSubcategory(null);
        }
      } else {
        setSubcategoriaDesayunos(null);
        userPreferencesService.setPosDesayunosSubcategory(null);
      }
    }
  }, [categoriaSeleccionada, categorias]);

  // Guardar la subcategoría de Desayunos cuando cambia
  useEffect(() => {
    // Solo guardar si estamos en Desayunos y las categorías están cargadas
    if (esCategoriaDesayunos && categorias.length > 0) {
      userPreferencesService.setPosDesayunosSubcategory(subcategoriaDesayunos);
    }
  }, [subcategoriaDesayunos, esCategoriaDesayunos, categorias]);

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
            
            // Si la categoría guardada es Desayunos, restaurar también la subcategoría
            const categoriaDesayunos = categoriasCargadas.find((cat: { id: number; nombre: string }) => cat.nombre === 'Desayunos');
            if (categoriaGuardada === categoriaDesayunos?.id) {
              const subcategoriaGuardada = userPreferencesService.getPosDesayunosSubcategory();
              // Restaurar la subcategoría guardada (puede ser null si estaba en "TODOS")
              setSubcategoriaDesayunos(subcategoriaGuardada);
            } else {
              // Si no es Desayunos, asegurarse de limpiar la subcategoría
              setSubcategoriaDesayunos(null);
            }
          } else {
            // Si la categoría no existe, limpiar la preferencia
            userPreferencesService.setPosSelectedCategory(null);
            userPreferencesService.setPosDesayunosSubcategory(null);
            setCategoriaSeleccionada(null);
            setSubcategoriaDesayunos(null);
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

  // Función para determinar la subcategoría de un producto de desayunos
  const obtenerSubcategoriaDesayuno = (nombreProducto: string): string => {
    const nombreLower = nombreProducto.toLowerCase();
    
    // Primero, intentar extraer subcategoría del prefijo [SUBCATEGORIA]
    const prefixMatch = nombreProducto.match(/^\[([^\]]+)\]/);
    if (prefixMatch) {
      const subcatDelPrefijo = prefixMatch[1].toLowerCase();
      // Normalizar a los valores válidos
      if (['dulces', 'lonches', 'sandwiches', 'otros'].includes(subcatDelPrefijo)) {
        return subcatDelPrefijo;
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

  // Filtrar productos
  let productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.categoriaId === categoriaSeleccionada)
    : productos;

  // Si estamos en Desayunos y hay una subcategoría seleccionada, filtrar por subcategoría
  if (esCategoriaDesayunos && subcategoriaDesayunos) {
    productosFiltrados = productosFiltrados.filter(p => {
      const subcat = obtenerSubcategoriaDesayuno(p.nombre);
      return subcat === subcategoriaDesayunos;
    });
  }

  // Subcategorías de Desayunos
  const subcategoriasDesayunos = [
    { id: 'todos', label: 'TODOS', icon: <Restaurant /> },
    { id: 'dulces', label: 'DULCES', icon: <BreakfastDining /> },
    { id: 'lonches', label: 'LONCHES', icon: <LunchDining /> },
    { id: 'sandwiches', label: 'SANDWICHES', icon: <Fastfood /> },
    { id: 'otros', label: 'PLATOS PRINCIPALES', icon: <Restaurant /> },
  ];

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
      <Typography variant="h4" gutterBottom>
        Seleccionar Productos
      </Typography>

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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: esCategoriaDesayunos ? 2 : 0 }}>
        <Button
          variant={categoriaSeleccionada === null ? 'contained' : 'outlined'}
            onClick={() => {
              setCategoriaSeleccionada(null);
              setSubcategoriaDesayunos(null);
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
                  setSubcategoriaDesayunos(null);
                }
              }}
            sx={{ minHeight: '48px' }}
          >
            {cat.nombre}
          </Button>
        ))}
        </Box>

        {/* Subcategorías de Desayunos */}
        {esCategoriaDesayunos && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2, p: 1.5, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
            {subcategoriasDesayunos.map(subcat => (
              <Button
                key={subcat.id}
                variant={subcategoriaDesayunos === subcat.id ? 'contained' : 'outlined'}
                onClick={() => setSubcategoriaDesayunos(subcat.id === 'todos' ? null : subcat.id)}
                size="small"
                sx={{ 
                  minHeight: '36px',
                  textTransform: 'none',
                }}
                startIcon={subcat.icon}
              >
                {subcat.label}
              </Button>
            ))}
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
                        <Typography variant="body2" component="span" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          ${(item.producto.precio * item.cantidad).toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
                
                <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', my: 2 }} />
                
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

