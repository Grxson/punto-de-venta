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
  Divider,
  Paper,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete, Close, CheckCircle, Link as LinkIcon } from '@mui/icons-material';
import { ingredientesService, Ingrediente, Unidad } from '../../services/ingredientes.service';
import { gastosService, Gasto } from '../../services/gastos.service';

export default function AdminIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIngrediente, setEditingIngrediente] = useState<Ingrediente | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form fields
  const [nombre, setNombre] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [unidadBaseId, setUnidadBaseId] = useState<number | ''>('');
  const [costoUnitarioBase, setCostoUnitarioBase] = useState<number>(0);
  const [stockMinimo, setStockMinimo] = useState<number>(0);
  const [activo, setActivo] = useState<boolean>(true);

  // Vinculación a gastos
  const [gastoSeleccionado, setGastoSeleccionado] = useState<Gasto | null>(null);
  const [gastosMateriaPrima, setGastosMateriaPrima] = useState<Gasto[]>([]);
  const [buscandoGastos, setBuscandoGastos] = useState(false);
  const [unidadGastoId, setUnidadGastoId] = useState<number | null>(null);
  const [factorConversion, setFactorConversion] = useState<string>('');
  const [mostrarCostoCalculado, setMostrarCostoCalculado] = useState(false);
  const [costoCalculado, setCostoCalculado] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  // Recalcular costo cuando cambia el gasto o factor
  useEffect(() => {
    if (gastoSeleccionado && factorConversion && Number(factorConversion) > 0) {
      const costo = gastoSeleccionado.monto / Number(factorConversion);
      setCostoCalculado(costo);
      setCostoUnitarioBase(costo);
      setMostrarCostoCalculado(true);
    } else {
      setMostrarCostoCalculado(false);
    }
  }, [gastoSeleccionado, factorConversion]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar ingredientes
      const ingredientesData = await ingredientesService.obtenerTodos();
      setIngredientes(Array.isArray(ingredientesData) ? ingredientesData : []);

      // Cargar unidades
      const unidadesData = await ingredientesService.obtenerUnidades();
      setUnidades(Array.isArray(unidadesData) ? unidadesData : []);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const filteredIngredientes = useMemo(() => {
    return ingredientes.filter((ing) =>
      ing.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
      (ing.descripcion?.toLowerCase().includes(searchText.toLowerCase()) ?? false)
    );
  }, [ingredientes, searchText]);

  const buscarGastos = async (textoBusqueda: string) => {
    try {
      setBuscandoGastos(true);
      const gastos = await gastosService.buscarInsumos(textoBusqueda);
      setGastosMateriaPrima(gastos);
    } catch (err) {
      console.error('Error buscando gastos:', err);
      setError('Error al buscar gastos de insumos');
    } finally {
      setBuscandoGastos(false);
    }
  };

  const handleOpenDialog = (ingrediente?: Ingrediente) => {
    if (ingrediente) {
      setEditingIngrediente(ingrediente);
      setNombre(ingrediente.nombre);
      setDescripcion(ingrediente.descripcion || '');
      // Usar nombres correctos del DTO: unidadBaseId y costoUnitarioBase
      setUnidadBaseId(ingrediente.unidadBaseId || '');
      setCostoUnitarioBase(Number(ingrediente.costoUnitarioBase) || 0);
      setStockMinimo(0);
      // Cargar datos de vinculación con gasto si existen
      if (ingrediente.gastoId) {
        setGastoSeleccionado({
          id: ingrediente.gastoId,
          monto: ingrediente.costoTotalGasto || 0,
          nota: ingrediente.unidadGastoNombre || '',
        } as any);
        setUnidadGastoId(ingrediente.unidadGastoId || null);
        setFactorConversion(ingrediente.factorConversion || '');
      } else {
        setGastoSeleccionado(null);
        setFactorConversion('');
        setUnidadGastoId(null);
      }
      setActivo(ingrediente.activo ?? true);
    } else {
      setEditingIngrediente(null);
      setNombre('');
      setDescripcion('');
      setUnidadBaseId('');
      setCostoUnitarioBase(0);
      setStockMinimo(0);
      setGastoSeleccionado(null);
      setFactorConversion('');
      setUnidadGastoId(null);
      setActivo(true);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIngrediente(null);
    setNombre('');
    setDescripcion('');
    setUnidadBaseId('');
    setCostoUnitarioBase(0);
    setStockMinimo(0);
    setGastoSeleccionado(null);
    setFactorConversion('');
    setUnidadGastoId(null);
    setActivo(true);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!nombre.trim()) {
        setError('El nombre del ingrediente es requerido');
        return;
      }

      if (!unidadBaseId) {
        setError('Debe seleccionar una unidad de medida');
        return;
      }

      if (costoUnitarioBase <= 0) {
        setError('El costo unitario debe ser mayor a 0');
        return;
      }

      const ingredienteData: Omit<Ingrediente, 'id' | 'createdAt' | 'updatedAt'> = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        costoUnitarioBase: costoUnitarioBase,
        unidadBaseId: Number(unidadBaseId),
        activo,
        // Vinculación con gasto (INCLUIDA)
        gastoId: gastoSeleccionado?.id,
        unidadGastoId: unidadGastoId || undefined,
        factorConversion: factorConversion || undefined,
        costoTotalGasto: gastoSeleccionado?.monto,
      };

      if (editingIngrediente) {
        await ingredientesService.actualizar(editingIngrediente.id, ingredienteData);
      } else {
        await ingredientesService.crear(ingredienteData);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente?')) {
      return;
    }

    try {
      setLoading(true);
      await ingredientesService.eliminar(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (ingrediente: Ingrediente) => {
    try {
      setLoading(true);
      await ingredientesService.actualizar(ingrediente.id, { activo: !ingrediente.activo });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado');
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

  const getUnidadNombre = (unidadId?: number) => {
    if (!unidadId) return '-';
    const unidad = unidades.find((u) => u.id === unidadId);
    return unidad ? `${unidad.nombre} (${unidad.abreviatura})` : '-';
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const paginatedIngredientes = filteredIngredientes.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Ingredientes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Nuevo Ingrediente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Barra de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nombre o descripción..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Tabla de ingredientes */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Costo Unitario
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Unidad
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Vinculado a Gasto
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Estado
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedIngredientes.length > 0 ? (
                  paginatedIngredientes.map((ingrediente) => (
                    <TableRow key={ingrediente.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{ingrediente.nombre}</TableCell>
                      <TableCell>{ingrediente.descripcion || '-'}</TableCell>
                      <TableCell align="right">
                        {ingrediente.costoUnitarioBase
                          ? `$${ingrediente.costoUnitarioBase.toFixed(6)}`
                          : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getUnidadNombre(ingrediente.unidadBaseId)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {ingrediente.gastoId ? (
                          <Chip
                            icon={<LinkIcon />}
                            label={`Gasto #${ingrediente.gastoId}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ) : (
                          <Typography variant="caption" color="textSecondary">
                            Sin vincular
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={ingrediente.activo ? <CheckCircle /> : undefined}
                          label={ingrediente.activo ? 'Activo' : 'Inactivo'}
                          color={ingrediente.activo ? 'success' : 'default'}
                          variant={ingrediente.activo ? 'filled' : 'outlined'}
                          size="small"
                          onClick={() => handleToggleActivo(ingrediente)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(ingrediente)}
                          title="Editar"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(ingrediente.id)}
                          title="Eliminar"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      No hay ingredientes registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredIngredientes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialog para crear/editar ingrediente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIngrediente ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Datos básicos */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Información Básica
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  label="Nombre del Ingrediente"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  fullWidth
                  placeholder="Ej: Harina integral"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Ej: Harina integral de trigo molido fino"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Unidad de Medida"
                  value={unidadBaseId}
                  onChange={(e) => setUnidadBaseId(Number(e.target.value) || '')}
                  fullWidth
                  required
                  variant="outlined"
                  SelectProps={{ native: true }}
                >
                  <option value="">-- Seleccionar unidad --</option>
                  {unidades.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.abreviatura})
                    </option>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Vinculación a Gastos */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Vincular con Gasto de Insumos
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Opcional: Vincula este ingrediente con un gasto de la categoría "Insumos" para calcular automáticamente el costo unitario
            </Typography>

            <Autocomplete
              options={gastosMateriaPrima}
              getOptionLabel={(option) => {
                // Mostrar referencia O nota (lo que esté disponible) para mejor UX
                const descripcion = option.referencia || option.nota || 'Sin descripción';
                return `${descripcion} - $${option.monto.toFixed(2)}`;
              }}
              value={gastoSeleccionado}
              onChange={(e, newValue) => setGastoSeleccionado(newValue)}
              onInputChange={(e, value) => {
                if (value && value.length > 0) {
                  // Búsqueda en tiempo real sin límite mínimo de caracteres
                  buscarGastos(value);
                }
              }}
              loading={buscandoGastos}
              fullWidth
              noOptionsText="Escribe para buscar gastos de insumos"
              renderInput={(params) => (
                <TextField {...params} label="Buscar Gasto de Insumos" placeholder="Ej: Harina, Azúcar..." />
              )}
            />

            {/* Display del gasto seleccionado */}
            {gastoSeleccionado && (
              <Paper sx={{ p: 2, mt: 2, backgroundColor: '#f5f5f5' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Descripción del Gasto
                    </Typography>
                    <Typography variant="body1">{gastoSeleccionado.referencia || gastoSeleccionado.nota || 'Sin descripción'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Costo Total del Gasto
                    </Typography>
                    <Typography variant="body1">${gastoSeleccionado.monto.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Unidad del Gasto
                    </Typography>
                    <TextField
                      select
                      value={unidadGastoId || ''}
                      onChange={(e) => setUnidadGastoId(Number(e.target.value) || null)}
                      fullWidth
                      size="small"
                      variant="outlined"
                      SelectProps={{ native: true }}
                    >
                      <option value="">-- Seleccionar unidad --</option>
                      {unidades.map((unidad) => (
                        <option key={unidad.id} value={unidad.id}>
                          {unidad.nombre} ({unidad.abreviatura})
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="textSecondary">
                      Factor de Conversión (cantidad por unidad gasto)
                    </Typography>
                    <TextField
                      type="number"
                      value={factorConversion}
                      onChange={(e) => setFactorConversion(e.target.value)}
                      fullWidth
                      size="small"
                      placeholder="Ej: 100 (si compré 100 piezas en un paquete)"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  {mostrarCostoCalculado && (
                    <Grid item xs={12}>
                      <Alert severity="info">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Costo Calculado Automáticamente:
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'success.main' }}>
                          ${costoCalculado.toFixed(6)} por unidad
                        </Typography>
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Costo y Stock */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Costo y Stock
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Costo Unitario Base ($)"
                  type="number"
                  value={costoUnitarioBase}
                  onChange={(e) => setCostoUnitarioBase(Number(e.target.value))}
                  fullWidth
                  required
                  inputProps={{ step: 0.01, min: 0 }}
                  helperText="Se calcula automáticamente si vinculas un gasto"
                  disabled={mostrarCostoCalculado}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock Mínimo (opcional)"
                  type="number"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(Number(e.target.value))}
                  fullWidth
                  inputProps={{ step: 1, min: 0 }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Estado */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Chip
              label={activo ? 'Ingrediente Activo' : 'Ingrediente Inactivo'}
              color={activo ? 'success' : 'default'}
              onClick={() => setActivo(!activo)}
              sx={{ cursor: 'pointer' }}
              icon={activo ? <CheckCircle /> : undefined}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : '✓ Guardar Ingrediente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
