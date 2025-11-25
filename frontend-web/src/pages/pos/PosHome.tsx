import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
}

export default function PosHome() {
  const navigate = useNavigate();
  const { cart, addToCart, itemCount, total } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            onClick={() => addToCart(producto)}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Typography variant="h6" component="div" gutterBottom>
                {producto.nombre}
              </Typography>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${producto.precio.toFixed(2)}
              </Typography>
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

