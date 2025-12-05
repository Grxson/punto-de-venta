import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Refresh, CheckCircle, HighlightOff, Add, Edit, Delete, Visibility, VisibilityOff, ExpandMore } from '@mui/icons-material';
import { useCategorias, useCrearCategoria, useActualizarCategoria, useEliminarCategoria } from '../../hooks/useCategorias';
import { useSubcategorias, useCrearSubcategoria, useActualizarSubcategoria, useEliminarSubcategoria } from '../../hooks/useSubcategorias';
import type { CategoriaProducto } from '../../types/categorias.types';
import type { CategoriaSubcategoria } from '../../types/subcategorias.types';

export default function AdminCategorias() {
  // Estados del componente primero (ANTES de los hooks que los usan)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProducto | null>(null);
  
  // Diálogo de categoría
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaProducto | null>(null);
  const [formCategoriaNombre, setFormCategoriaNombre] = useState('');
  const [formCategoriaDescripcion, setFormCategoriaDescripcion] = useState('');
  const [formCategoriaActiva, setFormCategoriaActiva] = useState(true);

  // Diálogo de subcategoría
  const [openSubcategoriaDialog, setOpenSubcategoriaDialog] = useState(false);
  const [editingSubcategoria, setEditingSubcategoria] = useState<CategoriaSubcategoria | null>(null);
  const [formSubcategoriaNombre, setFormSubcategoriaNombre] = useState('');
  const [formSubcategoriaDescripcion, setFormSubcategoriaDescripcion] = useState('');
  const [formSubcategoriaOrden, setFormSubcategoriaOrden] = useState(0);
  const [formSubcategoriaActiva, setFormSubcategoriaActiva] = useState(true);

  // Mensajes y filtros
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterActivos, setFilterActivos] = useState<'todos' | 'activas' | 'inactivas'>('todos');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'categoria' | 'subcategoria'; item: any } | null>(null);

  // Hooks de React Query (AHORA que los estados ya existen)
  const { data: queryData, isLoading, error, refetch } = useCategorias();
  const crearCategoriaFn = useCrearCategoria();
  const actualizarCategoriaFn = useActualizarCategoria();
  const eliminarCategoriaFn = useEliminarCategoria();

  const { data: subcategoriasData, isLoading: loadingSubcategorias } = useSubcategorias(selectedCategoria?.id || null);
  const crearSubcategoriaFn = useCrearSubcategoria();
  const actualizarSubcategoriaFn = useActualizarSubcategoria();
  const eliminarSubcategoriaFn = useEliminarSubcategoria();

  const categorias: CategoriaProducto[] = queryData?.data ?? [];
  const subcategorias: CategoriaSubcategoria[] = Array.isArray(subcategoriasData?.data) ? subcategoriasData.data : [];

  // Filtrar categorías
  const categoriasFiltradas = categorias.filter((cat) => {
    if (filterActivos === 'activas') return cat.activa;
    if (filterActivos === 'inactivas') return !cat.activa;
    return true;
  });

  // ==================== CATEGORÍAS ====================

  const resetCategoriaForm = () => {
    setEditingCategoria(null);
    setFormCategoriaNombre('');
    setFormCategoriaDescripcion('');
    setFormCategoriaActiva(true);
  };

  const handleOpenCreateCategoria = () => {
    resetCategoriaForm();
    setOpenCategoriaDialog(true);
  };

  const handleOpenEditCategoria = (categoria: CategoriaProducto) => {
    setEditingCategoria(categoria);
    setFormCategoriaNombre(categoria.nombre);
    setFormCategoriaDescripcion(categoria.descripcion || '');
    setFormCategoriaActiva(categoria.activa !== false);
    setOpenCategoriaDialog(true);
  };

  const handleSaveCategoria = async () => {
    if (!formCategoriaNombre.trim()) {
      setErrorMessage('El nombre es obligatorio');
      return;
    }

    try {
      setErrorMessage('');

      if (editingCategoria) {
        await actualizarCategoriaFn.mutateAsync({
          id: editingCategoria.id!,
          categoria: {
            nombre: formCategoriaNombre.trim(),
            descripcion: formCategoriaDescripcion.trim(),
            activa: formCategoriaActiva,
          },
        });
        setSuccessMessage(`✅ Categoría "${formCategoriaNombre}" actualizada exitosamente`);
      } else {
        await crearCategoriaFn.mutateAsync({
          nombre: formCategoriaNombre.trim(),
          descripcion: formCategoriaDescripcion.trim(),
          activa: formCategoriaActiva,
        });
        setSuccessMessage(`✅ Categoría "${formCategoriaNombre}" creada exitosamente`);
      }

      setOpenCategoriaDialog(false);
      resetCategoriaForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(`❌ Error: ${err?.message || 'No se pudo guardar la categoría'}`);
    }
  };

  // ==================== SUBCATEGORÍAS ====================

  const resetSubcategoriaForm = () => {
    setEditingSubcategoria(null);
    setFormSubcategoriaNombre('');
    setFormSubcategoriaDescripcion('');
    setFormSubcategoriaOrden(0);
    setFormSubcategoriaActiva(true);
  };

  const handleOpenCreateSubcategoria = () => {
    if (!selectedCategoria) {
      setErrorMessage('Selecciona una categoría primero');
      return;
    }
    resetSubcategoriaForm();
    setOpenSubcategoriaDialog(true);
  };

  const handleOpenEditSubcategoria = (subcategoria: CategoriaSubcategoria) => {
    setEditingSubcategoria(subcategoria);
    setFormSubcategoriaNombre(subcategoria.nombre);
    setFormSubcategoriaDescripcion(subcategoria.descripcion || '');
    setFormSubcategoriaOrden(subcategoria.orden || 0);
    setFormSubcategoriaActiva(subcategoria.activa !== false);
    setOpenSubcategoriaDialog(true);
  };

  const handleSaveSubcategoria = async () => {
    if (!selectedCategoria) return;
    if (!formSubcategoriaNombre.trim()) {
      setErrorMessage('El nombre es obligatorio');
      return;
    }

    try {
      setErrorMessage('');

      if (editingSubcategoria) {
        await actualizarSubcategoriaFn.mutateAsync({
          categoriaId: selectedCategoria.id!,
          subcategoriaId: editingSubcategoria.id!,
          data: {
            nombre: formSubcategoriaNombre.trim(),
            descripcion: formSubcategoriaDescripcion.trim(),
            orden: formSubcategoriaOrden,
            activa: formSubcategoriaActiva,
          },
        });
        setSuccessMessage(`✅ Subcategoría "${formSubcategoriaNombre}" actualizada exitosamente`);
      } else {
        await crearSubcategoriaFn.mutateAsync({
          categoriaId: selectedCategoria.id!,
          data: {
            nombre: formSubcategoriaNombre.trim(),
            descripcion: formSubcategoriaDescripcion.trim(),
            orden: formSubcategoriaOrden,
            activa: formSubcategoriaActiva,
          },
        });
        setSuccessMessage(`✅ Subcategoría "${formSubcategoriaNombre}" creada exitosamente`);
      }

      setOpenSubcategoriaDialog(false);
      resetSubcategoriaForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(`❌ Error: ${err?.message || 'No se pudo guardar la subcategoría'}`);
    }
  };

  // ==================== ELIMINACIONES ====================

  const handleOpenDeleteConfirm = (type: 'categoria' | 'subcategoria', item: any) => {
    setItemToDelete({ type, item });
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setErrorMessage('');

      if (itemToDelete.type === 'categoria') {
        await eliminarCategoriaFn.mutateAsync(itemToDelete.item.id!);
        setSuccessMessage(`✅ Categoría "${itemToDelete.item.nombre}" eliminada exitosamente`);
        setSelectedCategoria(null);
      } else {
        await eliminarSubcategoriaFn.mutateAsync({
          categoriaId: selectedCategoria!.id!,
          subcategoriaId: itemToDelete.item.id!,
        });
        setSuccessMessage(`✅ Subcategoría "${itemToDelete.item.nombre}" eliminada exitosamente`);
      }

      setOpenDeleteConfirm(false);
      setItemToDelete(null);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(`❌ Error: ${err?.message || 'No se pudo eliminar'}`);
    }
  };

  const isLoading_mutation =
    crearCategoriaFn.isPending ||
    actualizarCategoriaFn.isPending ||
    eliminarCategoriaFn.isPending ||
    crearSubcategoriaFn.isPending ||
    actualizarSubcategoriaFn.isPending ||
    eliminarSubcategoriaFn.isPending;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        ⚙️ Administrar Menú (Categorías y Subcategorías)
      </Typography>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error al cargar categorías: {error.message}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {/* Panel de categorías */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6">📂 Categorías del Menú</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenCreateCategoria} disabled={isLoading_mutation}>
                Nueva Categoría
              </Button>
              <IconButton size="small" onClick={() => refetch()} disabled={isLoading_mutation}>
                <Refresh />
              </IconButton>
            </Box>
          </Box>

          {/* Filtros */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              label="Todas"
              onClick={() => setFilterActivos('todos')}
              color={filterActivos === 'todos' ? 'primary' : 'default'}
              variant={filterActivos === 'todos' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Activas"
              onClick={() => setFilterActivos('activas')}
              color={filterActivos === 'activas' ? 'success' : 'default'}
              variant={filterActivos === 'activas' ? 'filled' : 'outlined'}
              icon={<Visibility fontSize="small" />}
            />
            <Chip
              label="Inactivas"
              onClick={() => setFilterActivos('inactivas')}
              color={filterActivos === 'inactivas' ? 'error' : 'default'}
              variant={filterActivos === 'inactivas' ? 'filled' : 'outlined'}
              icon={<VisibilityOff fontSize="small" />}
            />
          </Box>

          {/* Tabla de categorías */}
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', width: '150px' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoriasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'textSecondary' }}>
                      <Typography variant="body2">No hay categorías disponibles</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  categoriasFiltradas.map((categoria) => (
                    <TableRow
                      key={categoria.id}
                      sx={{
                        backgroundColor: selectedCategoria?.id === categoria.id ? 'action.selected' : 'transparent',
                        '&:hover': { backgroundColor: '#f9f9f9' },
                      }}
                      onClick={() => setSelectedCategoria(categoria)}
                    >
                      <TableCell>
                        {categoria.activa ? (
                          <Chip label="Activa" size="small" color="success" variant="outlined" icon={<CheckCircle />} />
                        ) : (
                          <Chip label="Inactiva" size="small" color="error" variant="outlined" icon={<HighlightOff />} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: '500' }}>{categoria.nombre}</TableCell>
                      <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {categoria.descripcion || <span style={{ color: '#aaa' }}>Sin descripción</span>}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCategoria(categoria);
                          }}
                          disabled={isLoading_mutation}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteConfirm('categoria', categoria);
                          }}
                          disabled={isLoading_mutation}
                          title="Eliminar"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </CardContent>
      </Card>

      {/* Panel de subcategorías (se muestra cuando se selecciona una categoría) */}
      {selectedCategoria && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6">
                📋 Subcategorías de <strong>{selectedCategoria.nombre}</strong>
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<Add />}
                onClick={handleOpenCreateSubcategoria}
                disabled={isLoading_mutation}
              >
                Nueva Subcategoría
              </Button>
            </Box>

            {loadingSubcategorias ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : subcategorias.length === 0 ? (
              <Alert severity="info">Esta categoría no tiene subcategorías aún. Crea una para organizarla mejor.</Alert>
            ) : (
              <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '40px' }}>Orden</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '150px' }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subcategorias.map((subcategoria) => (
                      <TableRow key={subcategoria.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{subcategoria.orden}</TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>{subcategoria.nombre}</TableCell>
                        <TableCell sx={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {subcategoria.descripcion || <span style={{ color: '#aaa' }}>Sin descripción</span>}
                        </TableCell>
                        <TableCell>
                          {subcategoria.activa ? (
                            <Chip label="Activa" size="small" color="success" variant="outlined" />
                          ) : (
                            <Chip label="Inactiva" size="small" color="error" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditSubcategoria(subcategoria)}
                            disabled={isLoading_mutation}
                            title="Editar"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteConfirm('subcategoria', subcategoria)}
                            disabled={isLoading_mutation}
                            title="Eliminar"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear/editar categoría */}
      <Dialog open={openCategoriaDialog} onClose={() => !isLoading_mutation && setOpenCategoriaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategoria ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nombre de la Categoría *"
              value={formCategoriaNombre}
              onChange={(e) => setFormCategoriaNombre(e.target.value)}
              placeholder="Ej: Desayunos, Bebidas, Postres"
              disabled={isLoading_mutation}
              autoFocus
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formCategoriaDescripcion}
              onChange={(e) => setFormCategoriaDescripcion(e.target.value)}
              placeholder="Ej: Desayunos, molletes, lonches y sándwiches"
              multiline
              rows={2}
              disabled={isLoading_mutation}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formCategoriaActiva}
                  onChange={(e) => setFormCategoriaActiva(e.target.checked)}
                  disabled={isLoading_mutation}
                />
              }
              label={formCategoriaActiva ? '✅ Categoría Activa' : '❌ Categoría Inactiva'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoriaDialog(false)} disabled={isLoading_mutation}>
            Cancelar
          </Button>
          <Button onClick={handleSaveCategoria} variant="contained" color="primary" disabled={isLoading_mutation || !formCategoriaNombre.trim()}>
            {isLoading_mutation ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {editingCategoria ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear/editar subcategoría */}
      <Dialog open={openSubcategoriaDialog} onClose={() => !isLoading_mutation && setOpenSubcategoriaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubcategoria ? '✏️ Editar Subcategoría' : '➕ Nueva Subcategoría'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Nombre de la Subcategoría *"
              value={formSubcategoriaNombre}
              onChange={(e) => setFormSubcategoriaNombre(e.target.value)}
              placeholder="Ej: Dulces, Bebidas Calientes, Desayunos Especiales"
              disabled={isLoading_mutation}
              autoFocus
            />
            <TextField
              fullWidth
              label="Descripción"
              value={formSubcategoriaDescripcion}
              onChange={(e) => setFormSubcategoriaDescripcion(e.target.value)}
              placeholder="Descripción opcional"
              multiline
              rows={2}
              disabled={isLoading_mutation}
            />
            <TextField
              fullWidth
              label="Orden"
              type="number"
              value={formSubcategoriaOrden}
              onChange={(e) => setFormSubcategoriaOrden(Number(e.target.value))}
              inputProps={{ min: 0 }}
              disabled={isLoading_mutation}
              helperText="Número para ordenar las subcategorías (0, 1, 2...)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formSubcategoriaActiva}
                  onChange={(e) => setFormSubcategoriaActiva(e.target.checked)}
                  disabled={isLoading_mutation}
                />
              }
              label={formSubcategoriaActiva ? '✅ Subcategoría Activa' : '❌ Subcategoría Inactiva'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubcategoriaDialog(false)} disabled={isLoading_mutation}>
            Cancelar
          </Button>
          <Button onClick={handleSaveSubcategoria} variant="contained" color="success" disabled={isLoading_mutation || !formSubcategoriaNombre.trim()}>
            {isLoading_mutation ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            {editingSubcategoria ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={openDeleteConfirm} onClose={() => !isLoading_mutation && setOpenDeleteConfirm(false)}>
        <DialogTitle>⚠️ Confirmar Eliminación</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography>
            ¿Estás seguro de que deseas eliminar {itemToDelete?.type === 'categoria' ? 'la categoría' : 'la subcategoría'}{' '}
            <strong>{itemToDelete?.item?.nombre}</strong>?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta acción marcará el elemento como inactivo y no se podrá usar en nuevos productos.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} disabled={isLoading_mutation}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={isLoading_mutation}>
            {isLoading_mutation ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
