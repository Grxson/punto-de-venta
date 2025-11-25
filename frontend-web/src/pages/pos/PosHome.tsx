import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: {
    id: number;
    nombre: string;
  };
  activo: boolean;
}

export default function PosHome() {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Array<{ producto: Producto; cantidad: number }>>([]);

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
        setProductos(productosResponse.data.filter((p: Producto) => p.activo));
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
    ? productos.filter(p => p.categoria.id === categoriaSeleccionada)
    : productos;

  const agregarAlCarrito = (producto: Producto) => {
    const itemExistente = cart.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      setCart(cart.map(item =>
        item.producto.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCart([...cart, { producto, cantidad: 1 }]);
    }
  };

  const totalCarrito = cart.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);

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
            onClick={() => agregarAlCarrito(producto)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h6" component="div" gutterBottom>
                {producto.nombre}
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${producto.precio.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {producto.categoria.nombre}
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
            Carrito: {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Total: ${totalCarrito.toFixed(2)}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            onClick={() => navigate('/pos/cart')}
            sx={{ minHeight: '48px' }}
          >
            Ver Carrito
          </Button>
        </Box>
      )}
    </Box>
  );
}

