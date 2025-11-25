import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Payment } from '@mui/icons-material';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';
import { useCart } from '../../contexts/CartContext';

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
  const { cart, addToCart, itemCount, total } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ventaExitosa, setVentaExitosa] = useState(false);
  const [dialogoVariantes, setDialogoVariantes] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  useEffect(() => {
    // Verificar si hay mensaje de venta exitosa
    if (location.state?.ventaExitosa) {
      setVentaExitosa(true);
      // Limpiar el estado después de 5 segundos
      setTimeout(() => setVentaExitosa(false), 5000);
      // Limpiar el estado de navegación
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías
      const categoriasResponse = await apiService.get(API_ENDPOINTS.CATEGORIES);
      if (categoriasResponse.success && categoriasResponse.data) {
        setCategorias(categoriasResponse.data);
      }

      // Cargar productos
      const productosResponse = await apiService.get(API_ENDPOINTS.PRODUCTS);
      if (productosResponse.success && productosResponse.data) {
        // Filtrar productos activos y asegurar que el precio sea un número
        const productosActivos = productosResponse.data
          .filter((p: any) => p.activo)
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

  const productosFiltrados = categoriaSeleccionada
    ? productos.filter(p => p.categoriaId === categoriaSeleccionada)
    : productos;

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
    // Si solo hay 1 producto, ir directo a pago
    if (itemCount === 1) {
      navigate('/pos/payment');
    } else {
      // Si hay más productos, ir al carrito
      navigate('/pos/cart');
    }
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

      {ventaExitosa && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setVentaExitosa(false)}>
          ¡Venta procesada exitosamente!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtros por categoría */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={categoriaSeleccionada === null ? 'contained' : 'outlined'}
          onClick={() => setCategoriaSeleccionada(null)}
          sx={{ minHeight: '48px' }}
        >
          Todas
        </Button>
        {categorias.map(cat => (
          <Button
            key={cat.id}
            variant={categoriaSeleccionada === cat.id ? 'contained' : 'outlined'}
            onClick={() => setCategoriaSeleccionada(cat.id)}
            sx={{ minHeight: '48px' }}
          >
            {cat.nombre}
          </Button>
        ))}
      </Box>

      {/* Grid de productos */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
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
              '&:hover': {
                boxShadow: 4,
              },
            }}
            onClick={() => handleProductoClick(producto)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h6" component="div" gutterBottom>
                {producto.nombre}
              </Typography>
              {producto.variantes && producto.variantes.length > 0 ? (
                <Chip
                  label={`${producto.variantes.length} ${producto.variantes.length === 1 ? 'variante' : 'variantes'}`}
                  size="small"
                  color="primary"
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${producto.precio.toFixed(2)}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {producto.categoriaNombre || 'Sin categoría'}
              </Typography>
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
            backgroundColor: 'primary.main',
            color: 'white',
            padding: 2,
            borderRadius: 2,
            boxShadow: 4,
            minWidth: '200px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Carrito: {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Total: ${total.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={handleCarritoClick}
            sx={{ minHeight: '48px' }}
            startIcon={itemCount === 1 ? <Payment /> : undefined}
          >
            {itemCount === 1 ? 'Pagar' : 'Ver Carrito'}
          </Button>
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
                      secondary={variante.descripcion}
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

