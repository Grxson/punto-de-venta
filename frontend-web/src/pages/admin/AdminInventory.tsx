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
  TablePagination,
} from '@mui/material';
import { Add, Refresh, Search, FileDownload } from '@mui/icons-material';
import type { Producto } from '../../types/productos.types';
import type { CategoriaProducto } from '../../types/categorias.types';
import { productosService } from '../../services/productos.service';
import { categoriasService } from '../../services/categorias.service';
import { useAuth } from '../../contexts/AuthContext';
import { websocketService } from '../../services/websocket.service';
import { userPreferencesService } from '../../services/userPreferences.service';
import { useProductos, useActualizarProducto, useEliminarProductoPermanente } from '../../hooks/useProductos';
import { useCategorias } from '../../hooks/useCategorias';
import ProductosTable from '../../components/productos/ProductosTable';
import ProductoForm from '../../components/productos/ProductoForm';
import VariantesManager from '../../components/productos/VariantesManager';

export default function AdminInventory() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.rol === 'ADMIN' || usuario?.rolNombre === 'ADMIN';

  // Filtros
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<number | ''>('');
  const [busqueda, setBusqueda] = useState('');

  // React Query hooks con filtros
  const filtros = {
    activo: filtroActivo === 'todos' ? undefined : filtroActivo === 'activos',
    categoriaId: filtroCategoria || undefined,
    busqueda: busqueda || undefined,
  };

  const { data: productosResponse, isLoading: loading, error: queryError, refetch } = useProductos(filtros);
  const productos = productosResponse?.data ?? [];
  const { data: categoriasResponse } = useCategorias();
  const categorias = categoriasResponse?.data ?? [];
  const actualizarProducto = useActualizarProducto();
  const eliminarProductoPermanente = useEliminarProductoPermanente();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    refetch(); // Solo refetch con React Query
  };

  // WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    websocketService.connect();

    const handleProductoUpdate = () => {
      refetch();
    };

    websocketService.on('producto:created', handleProductoUpdate);
    websocketService.on('producto:updated', handleProductoUpdate);
    websocketService.on('producto:deleted', handleProductoUpdate);

    return () => {
      websocketService.off('producto:created', handleProductoUpdate);
      websocketService.off('producto:updated', handleProductoUpdate);
      websocketService.off('producto:deleted', handleProductoUpdate);
    };
  }, [refetch]);

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
      setError(null);
      const nuevoEstado = !productoSeleccionado.activo;

      // Usar mutation de React Query (invalida caché automáticamente)
      await actualizarProducto.mutateAsync({
        id: productoSeleccionado.id,
        producto: { activo: nuevoEstado },
      });

      setSuccess(
        nuevoEstado
          ? 'Producto activado correctamente'
          : 'Producto desactivado correctamente'
      );
      setOpenDeleteConfirm(false);
      setProductoSeleccionado(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del producto');
    }
  };

  const confirmarEliminarPermanente = async () => {
    if (!productoSeleccionado?.id) return;

    try {
      setError(null);

      // Eliminar permanentemente con mutation de React Query
      await eliminarProductoPermanente.mutateAsync(productoSeleccionado.id);

      setSuccess('Producto eliminado definitivamente');
      setOpenDeletePermanenteConfirm(false);
      setProductoSeleccionado(null);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      // El mensaje ya viene en err.message desde el hook
      setError(err?.message || 'Error al eliminar el producto');
    }
  };

  const handleFormSuccess = () => {
    setOpenForm(false);
    setProductoSeleccionado(null);
    refetch(); // Refetch con React Query
    setSuccess('Producto guardado correctamente');
    setTimeout(() => setSuccess(null), 5000);
  };

  const productosFiltrados = (productos || []).filter((p) => {
    if (filtroActivo !== 'todos' && p.activo !== (filtroActivo === 'true')) return false;
    if (filtroCategoria && p.categoriaId !== Number(filtroCategoria)) return false;
    if (busqueda.trim() && !p.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Productos paginados
  const productosPaginados = productosFiltrados.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Exportar a CSV
  const handleExportarCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Precio', 'Costo Estimado', 'SKU', 'Estado', 'En Menú'];
    const rows = productosFiltrados.map(p => [
      p.nombre,
      p.categoriaNombre || 'Sin categoría',
      p.precio?.toFixed(2) || '0.00',
      p.costoEstimado?.toFixed(4) || '',
      p.sku || '',
      p.activo ? 'Activo' : 'Inactivo',
      p.disponibleEnMenu ? 'Sí' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPage(0);
  }, [filtroActivo, filtroCategoria, busqueda]);

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
              value={filtroActivo}
              label="Estado"
              onChange={(e) => {
                const val = e.target.value;
                setFiltroActivo(val);
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
              {(categorias || []).map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={loading}
          >
            Actualizar
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportarCSV}
            disabled={productosFiltrados.length === 0}
            sx={{ ml: 'auto' }}
          >
            Exportar CSV
          </Button>
        </Box>
      </Paper>

      {/* Tabla de productos */}
      {loading && productos.length === 0 ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <ProductosTable
            productos={productosPaginados}
            loading={loading}
            onEdit={handleEditarProducto}
            onDelete={handleEliminarProducto}
            onDeletePermanente={isAdmin ? handleEliminarPermanente : undefined}
            onView={handleVerVariantes}
          />
          <TablePagination
            component="div"
            count={productosFiltrados.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            labelRowsPerPage="Productos por página:"
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
          />
        </Box>
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
            <Box>
              <Typography gutterBottom>
                ¿Está seguro de eliminar definitivamente el producto "{productoSeleccionado?.nombre}"?
              </Typography>
              <Typography gutterBottom>
                <strong>Esta acción no se puede deshacer.</strong>
              </Typography>
              <Typography gutterBottom sx={{ mt: 2 }}>
                El producto solo se puede eliminar si:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                <li>No tiene ventas asociadas</li>
                <li>No tiene recetas asociadas</li>
                <li>No tiene variantes (si es producto base)</li>
              </Box>
            </Box>
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
              onUpdate={() => refetch()}
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
