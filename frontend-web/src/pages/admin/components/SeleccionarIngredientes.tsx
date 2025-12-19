import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Autocomplete,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { ingredientesService, Ingrediente, Unidad } from '../../../services/ingredientes.service';

interface IngredienteSeleccionado {
  ingredienteId: number;
  ingredienteNombre: string;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  cantidad: number;
  precioUnitario: number;
}

interface SeleccionarIngredientesProps {
  open: boolean;
  onClose: () => void;
  onSeleccionar: (ingredientes: IngredienteSeleccionado[]) => void;
  ingredientesIniciales?: IngredienteSeleccionado[];
}

/**
 * Modal para seleccionar ingredientes en una compra
 * Permite agregar múltiples ingredientes con cantidad y precio unitario
 */
export default function SeleccionarIngredientes({
  open,
  onClose,
  onSeleccionar,
  ingredientesIniciales = [],
}: SeleccionarIngredientesProps) {
  const [ingredientesDisponibles, setIngredientesDisponibles] = useState<Ingrediente[]>([]);
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>(
    ingredientesIniciales
  );
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Ingrediente para agregar
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [precioUnitario, setPrecioUnitario] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');

  // Dialog para crear nuevo ingrediente
  const [abrirDialogCrear, setAbrirDialogCrear] = useState(false);
  const [nuevoIngrediente, setNuevoIngrediente] = useState({
    nombre: '',
    unidadId: 0,
    factorConversion: '',
  });
  const [loadingCrear, setLoadingCrear] = useState(false);

  // Cargar ingredientes disponibles
  useEffect(() => {
    if (open) {
      cargarIngredientes();
      cargarUnidades();
    }
  }, [open]);

  const cargarIngredientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ingredientesService.obtenerActivos();
      setIngredientesDisponibles(data);
    } catch (err) {
      setError('Error al cargar ingredientes: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const cargarUnidades = async () => {
    try {
      const data = await ingredientesService.obtenerUnidades();
      setUnidades(data);
      // Seleccionar la primera unidad por defecto
      if (data.length > 0) {
        setNuevoIngrediente((prev) => ({ ...prev, unidadId: data[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar unidades:', err);
    }
  };

  /**
   * Agregar ingrediente a la lista de seleccionados
   */
  const agregarIngrediente = () => {
    if (!ingredienteSeleccionado || cantidad <= 0 || precioUnitario < 0) {
      setError('Completa todos los campos correctamente');
      return;
    }

    // Verificar si ya está seleccionado
    const yaExiste = ingredientesSeleccionados.some(
      (i) => i.ingredienteId === ingredienteSeleccionado.id
    );

    if (yaExiste) {
      setError('Este ingrediente ya fue agregado');
      return;
    }

    const nuevoIngrediente: IngredienteSeleccionado = {
      ingredienteId: ingredienteSeleccionado.id,
      ingredienteNombre: ingredienteSeleccionado.nombre,
      unidadId: ingredienteSeleccionado.unidadBaseId || 0,
      unidadNombre: ingredienteSeleccionado.unidadBaseNombre || 'unidad',
      unidadAbreviatura: ingredienteSeleccionado.unidadBaseAbreviatura || '',
      cantidad,
      precioUnitario,
    };

    setIngredientesSeleccionados([...ingredientesSeleccionados, nuevoIngrediente]);
    setError(null);

    // Limpiar formulario
    setIngredienteSeleccionado(null);
    setCantidad(1);
    setPrecioUnitario(0);
    setInputValue('');
  };

  /**
   * Crear un nuevo ingrediente sobre la marcha
   */
  const handleCrearIngrediente = async () => {
    if (!nuevoIngrediente.nombre.trim() || !nuevoIngrediente.unidadId) {
      setError('Completa nombre y unidad del ingrediente');
      return;
    }

    setLoadingCrear(true);
    setError(null);

    try {
      const ingredienteCreado = await ingredientesService.crear({
        nombre: nuevoIngrediente.nombre.trim(),
        unidadBaseId: nuevoIngrediente.unidadId,
        factorConversion: nuevoIngrediente.factorConversion
          ? parseFloat(nuevoIngrediente.factorConversion)
          : undefined,
        activo: true,
      });

      // Agregar a la lista de disponibles
      setIngredientesDisponibles([...ingredientesDisponibles, ingredienteCreado]);

      // Seleccionar automáticamente el ingrediente creado
      setIngredienteSeleccionado(ingredienteCreado);
      setInputValue(ingredienteCreado.nombre);

      // Cerrar dialog
      setAbrirDialogCrear(false);
      setNuevoIngrediente({ nombre: '', unidadId: unidades[0]?.id || 0, factorConversion: '' });
    } catch (err) {
      setError('Error al crear ingrediente: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoadingCrear(false);
    }
  };

  /**
   * Eliminar un ingrediente de la lista
   */
  const eliminarIngrediente = (ingredienteId: number) => {
    setIngredientesSeleccionados(
      ingredientesSeleccionados.filter((i) => i.ingredienteId !== ingredienteId)
    );
  };

  /**
   * Actualizar cantidad de un ingrediente
   */
  const actualizarCantidad = (ingredienteId: number, nuevaCantidad: number) => {
    setIngredientesSeleccionados(
      ingredientesSeleccionados.map((i) =>
        i.ingredienteId === ingredienteId ? { ...i, cantidad: nuevaCantidad } : i
      )
    );
  };

  /**
   * Actualizar precio unitario
   */
  const actualizarPrecio = (ingredienteId: number, nuevoPrecio: number) => {
    setIngredientesSeleccionados(
      ingredientesSeleccionados.map((i) =>
        i.ingredienteId === ingredienteId ? { ...i, precioUnitario: nuevoPrecio } : i
      )
    );
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  /**
   * Confirmar selección
   */
  const handleConfirmar = () => {
    if (ingredientesSeleccionados.length === 0) {
      setError('Agrega al menos un ingrediente');
      return;
    }
    onSeleccionar(ingredientesSeleccionados);
    onClose();
  };

  const totalSubtotal = ingredientesSeleccionados.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnitario,
    0
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Seleccionar Ingredientes para Compra</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Sección: Agregar ingrediente */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <h4 style={{ marginTop: 0 }}>Agregar Ingrediente</h4>

          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <Autocomplete
                options={ingredientesDisponibles}
                getOptionLabel={(option) => option.nombre}
                value={ingredienteSeleccionado}
                inputValue={inputValue}
                onInputChange={(event, value) => setInputValue(value)}
                onChange={(event, newValue) => {
                  setIngredienteSeleccionado(newValue);
                  if (newValue) {
                    setInputValue(newValue.nombre);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Ingrediente" size="small" sx={{ mb: 2 }} />
                )}
                noOptionsText={
                  inputValue && inputValue.length > 0 ? (
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ fontSize: '0.875rem', color: '#666', mb: 1 }}>
                        No se encontró "{inputValue}"
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                          setNuevoIngrediente((prev) => ({
                            ...prev,
                            nombre: inputValue,
                          }));
                          setAbrirDialogCrear(true);
                        }}
                        fullWidth
                      >
                        Crear: "{inputValue}"
                      </Button>
                    </Box>
                  ) : (
                    'No hay ingredientes disponibles'
                  )
                }
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  label="Cantidad"
                  type="number"
                  size="small"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: '0' }}
                />
                <TextField
                  label="Precio Unitario"
                  type="number"
                  size="small"
                  value={precioUnitario}
                  onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01', min: '0' }}
                  InputProps={{ startAdornment: '$' }}
                />
                <Box sx={{ fontSize: '0.875rem' }}>
                  <strong>Subtotal:</strong> ${(cantidad * precioUnitario).toFixed(2)}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={agregarIngrediente}
                  size="small"
                  fullWidth
                >
                  Agregar
                </Button>
              </Box>
            </>
          )}
        </Box>

        {/* Tabla: Ingredientes seleccionados */}
        <Box>
          <h4>Ingredientes Seleccionados ({ingredientesSeleccionados.length})</h4>
          {ingredientesSeleccionados.length === 0 ? (
            <Alert severity="info">No hay ingredientes seleccionados aún</Alert>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                    <TableRow>
                      <TableCell>Ingrediente</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="center">Unidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="center" width={50}>
                        Acción
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ingredientesSeleccionados
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.ingredienteId}>
                          <TableCell>{item.ingredienteNombre}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(item.ingredienteId, parseFloat(e.target.value) || 0)
                              }
                              inputProps={{ step: '0.01', min: '0' }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="center">{item.unidadAbreviatura}</TableCell>
                          <TableCell align="right">
                            <TextField
                              type="number"
                              size="small"
                              value={item.precioUnitario}
                              onChange={(e) =>
                                actualizarPrecio(item.ingredienteId, parseFloat(e.target.value) || 0)
                              }
                              inputProps={{ step: '0.01', min: '0' }}
                              InputProps={{ startAdornment: '$' }}
                              sx={{ width: 90 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            ${(item.cantidad * item.precioUnitario).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              color="error"
                              onClick={() => eliminarIngrediente(item.ingredienteId)}
                              title="Eliminar"
                            >
                              <Delete fontSize="small" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {ingredientesSeleccionados.length > rowsPerPage && (
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={ingredientesSeleccionados.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página"
                />
              )}

              {/* Total */}
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                }}
              >
                Total Compra: ${totalSubtotal.toFixed(2)}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmar}
          variant="contained"
          disabled={ingredientesSeleccionados.length === 0}
        >
          Confirmar Selección
        </Button>
      </DialogActions>

      {/* Dialog para crear nuevo ingrediente */}
      <Dialog open={abrirDialogCrear} onClose={() => setAbrirDialogCrear(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Ingrediente</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            fullWidth
            label="Nombre del Ingrediente"
            value={nuevoIngrediente.nombre}
            onChange={(e) =>
              setNuevoIngrediente((prev) => ({ ...prev, nombre: e.target.value }))
            }
            margin="dense"
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Unidad de Medida</InputLabel>
            <Select
              value={nuevoIngrediente.unidadId}
              label="Unidad de Medida"
              onChange={(e) =>
                setNuevoIngrediente((prev) => ({ ...prev, unidadId: e.target.value as number }))
              }
            >
              {unidades.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.nombre} ({u.abreviatura})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Factor de Conversión (Opcional)"
            placeholder="Ej: 1 kg = 500 ml"
            value={nuevoIngrediente.factorConversion}
            onChange={(e) =>
              setNuevoIngrediente((prev) => ({ ...prev, factorConversion: e.target.value }))
            }
            margin="dense"
            helperText="Información referencial para cálculos (opcional)"
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setAbrirDialogCrear(false)}
            variant="outlined"
            disabled={loadingCrear}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCrearIngrediente}
            variant="contained"
            disabled={loadingCrear || !nuevoIngrediente.nombre.trim()}
          >
            {loadingCrear ? <CircularProgress size={20} /> : 'Crear Ingrediente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
