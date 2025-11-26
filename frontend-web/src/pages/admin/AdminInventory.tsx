import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Refresh, Search } from '@mui/icons-material';
import type { Producto } from '../../types/productos.types';
import type { CategoriaProducto } from '../../types/categorias.types';
import { productosService } from '../../services/productos.service';
import { categoriasService } from '../../services/categorias.service';
import { useAuth } from '../../contexts/AuthContext';
import { websocketService } from '../../services/websocket.service';
import { userPreferencesService } from '../../services/userPreferences.service';
import ProductosTable from '../../components/productos/ProductosTable';
import ProductoForm from '../../components/productos/ProductoForm';
import VariantesManager from '../../components/productos/VariantesManager';

export default function AdminInventory() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'ADMIN' || usuario?.rolNombre === 'ADMIN';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaProducto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filtros
  const [filtroActivo, setFiltroActivo] = useState<boolean | 'todos'>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<number | ''>('');
  const [busqueda, setBusqueda] = useState('');

  // Estados de diálogos
  const [openForm, setOpenForm] = useState(false);
  const [openVariantes, setOpenVariantes] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openDeletePermanenteConfirm, setOpenDeletePermanenteConfirm] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [tabValue, setTabValue] = useState(() => {
    // Restaurar la pestaña guardada al montar el componente
    return userPreferencesService.getAdminInventoryTab();
  });

  useEffect(() => {
    loadData();
  }, []);

  // Guardar la pestaña activa cuando cambia
  useEffect(() => {
    userPreferencesService.setAdminInventoryTab(tabValue);
  }, [tabValue]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías
      const categoriasResponse = await categoriasService.listar({ activa: true });
      if (categoriasResponse.success && categoriasResponse.data) {
        setCategorias(categoriasResponse.data);
      }

      // Cargar productos
      await loadProductos();
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadProductos = async () => {
    try {
      const filtros: any = {};
      if (filtroActivo !== 'todos') {
        filtros.activo = filtroActivo;
      }
      if (filtroCategoria) {
        filtros.categoriaId = Number(filtroCategoria);
      }
      if (busqueda.trim()) {
        filtros.q = busqueda.trim();
      }

      const response = await productosService.listar(filtros);
      if (response.success && response.data) {
        setProductos(response.data);
      } else {
        setError(response.error || 'Error al cargar productos');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar productos');
    }
  };

  // Separar efectos: uno para cargar datos (con dependencias) y otro para WebSocket (sin dependencias)
  useEffect(() => {
    // Cargar categorías solo una vez
    const loadCategorias = async () => {
      try {
        const categoriasResponse = await categoriasService.listar({ activa: true });
        if (categoriasResponse.success && categoriasResponse.data) {
          setCategorias(categoriasResponse.data);
        }
      } catch (err: any) {
        console.error('Error al cargar categorías:', err);
      }
    };
    
    loadCategorias();
    loadProductos();
  }, [filtroActivo, filtroCategoria, busqueda]);

  // Efecto separado para WebSocket que solo se ejecuta una vez
  useEffect(() => {
    // Conectar WebSocket para actualizaciones en tiempo real
    websocketService.connect();

    // Escuchar eventos de productos
    const unsubscribe = websocketService.on('productos', (message) => {
      if (message.tipo === 'PRODUCTO_CREADO' || message.tipo === 'PRODUCTO_ACTUALIZADO') {
        // Recargar productos cuando hay cambios
        loadProductos();
      } else if (message.tipo === 'PRODUCTO_ELIMINADO') {
        // Remover producto de la lista
        setProductos((prev) => prev.filter((p) => p.id !== message.entidadId));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []); // Sin dependencias - solo se ejecuta una vez

  const handleNuevoProducto = () => {
    setProductoSeleccionado(null);
    setOpenForm(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setOpenForm(true);
  };

  const handleVerVariantes = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setTabValue(1);
    setOpenVariantes(true);
  };

  const handleEliminarProducto = (producto: Producto) => {
    // Este método ahora maneja tanto activación como desactivación
    setProductoSeleccionado(producto);
    setOpenDeleteConfirm(true);
  };

  const handleEliminarPermanente = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setOpenDeletePermanenteConfirm(true);
  };

  const confirmarEliminar = async () => {
    if (!productoSeleccionado?.id) return;

    try {
      setLoading(true);
      setError(null);
      // Si está activo, desactivarlo; si está inactivo, activarlo
      const nuevoEstado = !productoSeleccionado.activo;
      await productosService.cambiarEstado(productoSeleccionado.id, nuevoEstado);
      setSuccess(
        nuevoEstado 
          ? 'Producto activado correctamente' 
          : 'Producto desactivado correctamente'
      );
      setOpenDeleteConfirm(false);
      setProductoSeleccionado(null);
      await loadProductos();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del producto');
    } finally {
      setLoading(false);
    }
  };

  const confirmarEliminarPermanente = async () => {
    if (!productoSeleccionado?.id) return;

    try {
      setLoading(true);
      setError(null);
      await productosService.eliminarDefinitivamente(productoSeleccionado.id);
      setSuccess('Producto eliminado definitivamente');
      setOpenDeletePermanenteConfirm(false);
      setProductoSeleccionado(null);
      await loadProductos();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setProductoSeleccionado(null);
    loadProductos();
    setSuccess('Producto guardado correctamente');
    setTimeout(() => setSuccess(null), 5000);
  };

  const productosFiltrados = productos.filter((p) => {
    if (filtroActivo !== 'todos' && p.activo !== filtroActivo) return false;
    if (filtroCategoria && p.categoriaId !== Number(filtroCategoria)) return false;
    if (busqueda.trim() && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNuevoProducto}
        >
          Nuevo Producto
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroActivo === 'todos' ? 'todos' : filtroActivo === true ? 'true' : 'false'}
              label="Estado"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'todos') {
                  setFiltroActivo('todos');
                } else if (val === 'true') {
                  setFiltroActivo(true);
                } else {
                  setFiltroActivo(false);
                }
              }}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="true">Activos</MenuItem>
              <MenuItem value="false">Inactivos</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={filtroCategoria}
              label="Categoría"
              onChange={(e) => setFiltroCategoria(e.target.value as number | '')}
            >
              <MenuItem value="">Todas</MenuItem>
              {categorias.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadProductos}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Paper>

      {/* Tabla de productos */}
      {loading && productos.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ProductosTable
          productos={productosFiltrados}
          loading={loading}
          onEdit={handleEditarProducto}
          onDelete={handleEliminarProducto}
          onDeletePermanente={isAdmin ? handleEliminarPermanente : undefined}
          onView={handleVerVariantes}
        />
      )}

      {/* Diálogo de formulario de producto */}
      <ProductoForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setProductoSeleccionado(null);
        }}
        producto={productoSeleccionado}
        onSuccess={handleFormSuccess}
      />

      {/* Diálogo de confirmación de activación/desactivación */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>
          {productoSeleccionado?.activo ? 'Desactivar Producto' : 'Activar Producto'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {productoSeleccionado?.activo ? (
              <>
                ¿Está seguro de desactivar el producto "{productoSeleccionado?.nombre}"?
                <br />
                <br />
                Esta acción ocultará el producto del menú y no estará disponible para ventas.
                El producto se mantendrá en el sistema y podrá ser reactivado en cualquier momento.
              </>
            ) : (
              <>
                ¿Está seguro de activar el producto "{productoSeleccionado?.nombre}"?
                <br />
                <br />
                Esta acción hará que el producto aparezca nuevamente en el menú y esté disponible para ventas.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminar}
            color={productoSeleccionado?.activo ? 'warning' : 'success'}
            variant="contained"
            disabled={loading}
          >
            {productoSeleccionado?.activo ? 'Desactivar' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación definitiva */}
      {isAdmin && (
        <Dialog open={openDeletePermanenteConfirm} onClose={() => setOpenDeletePermanenteConfirm(false)}>
          <DialogTitle>Confirmar eliminación definitiva</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>ADVERTENCIA:</strong> Esta acción eliminará el producto permanentemente de la base de datos.
            </Alert>
            <Typography>
              ¿Está seguro de eliminar definitivamente el producto "{productoSeleccionado?.nombre}"?
              <br />
              <br />
              <strong>Esta acción no se puede deshacer.</strong>
              <br />
              <br />
              El producto solo se puede eliminar si:
              <ul>
                <li>No tiene ventas asociadas</li>
                <li>No tiene recetas asociadas</li>
                <li>No tiene variantes (si es producto base)</li>
              </ul>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeletePermanenteConfirm(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={confirmarEliminarPermanente}
              color="error"
              variant="contained"
              disabled={loading}
            >
              Eliminar Definitivamente
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Diálogo de gestión de variantes */}
      {productoSeleccionado && productoSeleccionado.id && (
        <Dialog
          open={openVariantes}
          onClose={() => {
            setOpenVariantes(false);
            setProductoSeleccionado(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Gestión de Variantes - {productoSeleccionado.nombre}
          </DialogTitle>
          <DialogContent>
            <VariantesManager
              productoId={productoSeleccionado.id}
              productoNombre={productoSeleccionado.nombre}
              onUpdate={loadProductos}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenVariantes(false);
              setProductoSeleccionado(null);
            }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
