import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  TextField,
  IconButton,
  Chip,
  TablePagination,
  Autocomplete,
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import { recetasService } from '../../services/recetas.service';
import { productosService } from '../../services/productos.service';
import { ingredientesService, Ingrediente as IngredienteService } from '../../services/ingredientes.service';
import AgregarIngredientesReceta from './components/AgregarIngredientesReceta';

interface Ingrediente {
  id: number;
  nombre: string;
  precioUnitario?: number;
  unidadNombre?: string;
  activo: boolean;
}

interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
}

interface RecetaIngrediente {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  mermaTeorica?: number;
}

interface Receta {
  productoId: number;
  productoNombre: string;
  sucursalId?: number;
  ingredientes: RecetaIngrediente[];
  costoDirecto?: number;
  costoIndirecto?: number;
  manoObra?: number;
  costoTotal?: number;
  porcentajeUtilidadDeseado?: number;
  precioSugerido?: number;
  rendimiento?: number;
  unidadRendimiento?: string;
  descripcion?: string;
  notas?: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

export default function AdminRecipes() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReceta, setEditingReceta] = useState<Receta | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form fields
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [productoSearchInput, setProductoSearchInput] = useState<string>('');
  const [recetaIngredientes, setRecetaIngredientes] = useState<RecetaIngrediente[]>([]);
  const [costoIndirecto, setCostoIndirecto] = useState<number>(0);
  const [manoObra, setManoObra] = useState<number>(0);
  const [rendimiento, setRendimiento] = useState<number>(1);
  const [unidadRendimiento, setUnidadRendimiento] = useState<string>('unidad');
  const [descripcion, setDescripcion] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [porcentajeUtilidad, setPorcentajeUtilidad] = useState<number>(40);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar recetas
      const recetasData = await recetasService.obtenerTodas();
      setRecetas(Array.isArray(recetasData) ? recetasData : []);

      // Cargar productos
      const productosResponse = await productosService.listar({ activo: true });
      const productosData = (productosResponse?.data || productosResponse || []).filter(
        (p: any) => p && p.id
      );
      setProductos(Array.isArray(productosData) ? productosData : []);

      // Cargar ingredientes
      const ingredientesResponse = await ingredientesService.obtenerActivos();
      setIngredientes(Array.isArray(ingredientesResponse) ? ingredientesResponse : []);

      // Cargar unidades
      const unidadesResponse = await ingredientesService.obtenerUnidades();
      setUnidades(Array.isArray(unidadesResponse) ? unidadesResponse : []);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const filteredRecetas = useMemo(() => {
    return recetas.filter((receta) =>
      receta.productoNombre.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [recetas, searchText]);

  // Calcular costo total de ingredientes
  const costoDirectoTotal = useMemo(() => {
    return recetaIngredientes.reduce((sum, ing) => sum + (ing.costoTotal || 0), 0);
  }, [recetaIngredientes]);

  // Calcular costo total por unidad de rendimiento
  const costoTotalReceta = useMemo(() => {
    return costoDirectoTotal + costoIndirecto + manoObra;
  }, [costoDirectoTotal, costoIndirecto, manoObra]);

  // Calcular precio sugerido
  const precioSugerido = useMemo(() => {
    return costoTotalReceta * (1 + porcentajeUtilidad / 100);
  }, [costoTotalReceta, porcentajeUtilidad]);

  // Calcular costo por unidad de rendimiento
  const costoPorUnidad = useMemo(() => {
    return rendimiento > 0 ? costoTotalReceta / rendimiento : 0;
  }, [costoTotalReceta, rendimiento]);

  const handleOpenDialog = (receta?: Receta) => {
    if (receta) {
      setEditingReceta(receta);
      const productoSeleccionado = productos.find((p) => p.id === receta.productoId) || null;
      setSelectedProducto(productoSeleccionado);
      setProductoSearchInput(receta.productoNombre);
      setRecetaIngredientes([...receta.ingredientes]);
      setCostoIndirecto(receta.costoIndirecto || 0);
      setManoObra(receta.manoObra || 0);
      setRendimiento(receta.rendimiento || 1);
      setUnidadRendimiento(receta.unidadRendimiento || 'unidad');
      setDescripcion(receta.descripcion || '');
      setNotas(receta.notas || '');
      setPorcentajeUtilidad(receta.porcentajeUtilidadDeseado || 40);
    } else {
      setEditingReceta(null);
      setSelectedProducto(null);
      setProductoSearchInput('');
      setRecetaIngredientes([]);
      setCostoIndirecto(0);
      setManoObra(0);
      setRendimiento(1);
      setUnidadRendimiento('unidad');
      setDescripcion('');
      setNotas('');
      setPorcentajeUtilidad(40);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReceta(null);
    setSelectedProducto(null);
    setProductoSearchInput('');
    setRecetaIngredientes([]);
    setCostoIndirecto(0);
    setManoObra(0);
    setRendimiento(1);
    setUnidadRendimiento('unidad');
    setDescripcion('');
    setNotas('');
    setPorcentajeUtilidad(40);
    setError(null);
  };

  const handleAgregarIngrediente = (ingrediente: RecetaIngrediente) => {
    setRecetaIngredientes([...recetaIngredientes, ingrediente]);
    setError(null);
  };

  const handleRemoverIngrediente = (ingredienteId: number) => {
    setRecetaIngredientes(recetaIngredientes.filter((ing) => ing.ingredienteId !== ingredienteId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedProducto || recetaIngredientes.length === 0) {
        setError('Debe seleccionar un producto y al menos un ingrediente');
        return;
      }

      const recetaData: Receta = {
        productoId: selectedProducto!.id,
        productoNombre: selectedProducto!.nombre,
        ingredientes: recetaIngredientes,
        costoDirecto: costoDirectoTotal,
        costoIndirecto,
        manoObra,
        costoTotal: costoTotalReceta,
        rendimiento,
        unidadRendimiento,
        descripcion,
        notas,
        porcentajeUtilidadDeseado: porcentajeUtilidad,
        precioSugerido: precioSugerido,
      };

      if (editingReceta) {
        await recetasService.actualizar(selectedProducto!.id, recetaData);
      } else {
        await recetasService.crear(recetaData);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productoId: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta receta?')) {
      return;
    }

    try {
      setLoading(true);
      await recetasService.eliminar(productoId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const paginatedRecetas = filteredRecetas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Recetas de Productos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ minHeight: '48px' }}
        >
          Nueva Receta
        </Button>
      </Box>

      {/* Búsqueda */}
      <Box sx={{ mb: 2 }}>
        <TextField
          placeholder="Buscar por nombre de producto..."
          variant="outlined"
          fullWidth
          size="small"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de recetas */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Ingredientes
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Costo Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRecetas.length > 0 ? (
                  paginatedRecetas.map((receta) => (
                    <TableRow key={receta.productoId} hover>
                      <TableCell>{receta.productoNombre}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${receta.ingredientes.length} ingredientes`} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        ${receta.costoTotal ? receta.costoTotal.toFixed(2) : '0.00'}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(receta)}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(receta.productoId)}
                          title="Eliminar"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No hay recetas registradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredRecetas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialog para crear/editar receta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>
          {editingReceta ? 'Editar Receta' : 'Nueva Receta'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Producto */}
          <Autocomplete
            options={productos}
            getOptionLabel={(option) => option.nombre}
            value={selectedProducto}
            onChange={(event, newValue) => {
              setSelectedProducto(newValue);
              if (newValue) {
                setProductoSearchInput(newValue.nombre);
              }
            }}
            inputValue={productoSearchInput}
            onInputChange={(event, newInputValue) => {
              setProductoSearchInput(newInputValue);
            }}
            disabled={!!editingReceta}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Producto"
                margin="dense"
                size="small"
                placeholder="Buscar producto..."
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterOptions={(options, state) => {
              const inputValue = state.inputValue.toLowerCase();
              return options.filter((option) =>
                option.nombre.toLowerCase().includes(inputValue)
              );
            }}
          />

          {/* Rendimiento */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 1.5, mt: 2 }}>
            <TextField
              label="Cantidad"
              type="number"
              value={rendimiento}
              onChange={(e) => setRendimiento(Number(e.target.value))}
              inputProps={{ step: 0.01, min: 0.01 }}
              margin="dense"
              size="small"
              fullWidth
            />
            <TextField
              label="Unidad"
              value={unidadRendimiento}
              onChange={(e) => setUnidadRendimiento(e.target.value)}
              placeholder="unidad, kg, lt"
              margin="dense"
              size="small"
              fullWidth
            />
          </Box>

          {/* Ingredientes */}
          <Box sx={{ mt: 2.5, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              🥘 Ingredientes
            </Typography>
            <AgregarIngredientesReceta
              ingredientesDisponibles={ingredientes}
              unidades={unidades}
              ingredientesEnReceta={recetaIngredientes}
              onAgregarIngrediente={handleAgregarIngrediente}
              onRemoverIngrediente={handleRemoverIngrediente}
              loading={loading}
            />
          </Box>

          {/* Costos Adicionales */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              💰 Costos Adicionales
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
              <TextField
                label="Costo Indirecto ($)"
                type="number"
                value={costoIndirecto}
                onChange={(e) => setCostoIndirecto(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0 }}
                margin="dense"
                size="small"
              />
              <TextField
                label="Mano de Obra ($)"
                type="number"
                value={manoObra}
                onChange={(e) => setManoObra(Number(e.target.value))}
                inputProps={{ step: 0.01, min: 0 }}
                margin="dense"
                size="small"
              />
            </Box>
            <Typography variant="caption" sx={{ display: 'block', color: '#666', mb: 1.5 }}>
              💵 Costo Directo: ${costoDirectoTotal.toFixed(2)} | Total: ${costoTotalReceta.toFixed(2)}
            </Typography>
          </Box>

          {/* Utilidad */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
              📊 Utilidad & Precio
            </Typography>
            <TextField
              label="% Utilidad Deseada"
              type="number"
              value={porcentajeUtilidad}
              onChange={(e) => setPorcentajeUtilidad(Number(e.target.value))}
              inputProps={{ step: 1, min: 0, max: 300 }}
              margin="dense"
              size="small"
              fullWidth
              sx={{ mb: 1 }}
            />
            <Box sx={{ p: 1.5, backgroundColor: '#e3f2fd', borderRadius: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: '600', color: '#1565c0' }}>
                💵 Precio Sugerido: ${precioSugerido.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0d47a1' }}>
                (${costoPorUnidad.toFixed(2)} por {unidadRendimiento})
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '✓ Guardar Receta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
