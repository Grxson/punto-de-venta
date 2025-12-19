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
    costoUnitarioBase: '',
    // Factor de conversión flexible: X unidad = Y rendimiento
    factorCantidadEntrada: '',   // Ej: 0.5, 1, 2, 100 (cantidad de entrada)
    factorCantidadSalida: '',    // Ej: 250, 500, 1000, 10 (cantidad de rendimiento)
    factorUnidadSalidaId: 0,     // Unidad del rendimiento (ml, piezas, rebanadas, etc.)
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
    if (!nuevoIngrediente.nombre.trim() || !nuevoIngrediente.unidadId || !nuevoIngrediente.costoUnitarioBase.trim()) {
      setError('Completa nombre, unidad y costo unitario del ingrediente');
      return;
    }

    setLoadingCrear(true);
    setError(null);

    try {
      // Construir el factor de conversión en formato legible y flexible
      let factorConversionText = '';
      if (nuevoIngrediente.factorCantidadEntrada.trim() && nuevoIngrediente.factorCantidadSalida.trim()) {
        const unidadEntrada = unidades.find(u => u.id === nuevoIngrediente.unidadId);
        const unidadSalida = unidades.find(u => u.id === nuevoIngrediente.factorUnidadSalidaId);
        
        if (unidadEntrada && unidadSalida) {
          // Formato: "0.5 kg = 250 ml"
          factorConversionText = `${nuevoIngrediente.factorCantidadEntrada} ${unidadEntrada.abreviatura} = ${nuevoIngrediente.factorCantidadSalida} ${unidadSalida.abreviatura}`;
        } else if (unidadEntrada) {
          // Formato: "0.5 kg = 250 (sin unidad de salida)"
          factorConversionText = `${nuevoIngrediente.factorCantidadEntrada} ${unidadEntrada.abreviatura} = ${nuevoIngrediente.factorCantidadSalida}`;
        } else {
          // Formato: "0.5 = 250 (sin unidades)"
          factorConversionText = `${nuevoIngrediente.factorCantidadEntrada} = ${nuevoIngrediente.factorCantidadSalida}`;
        }
      }

      const ingredienteCreado = await ingredientesService.crear({
        nombre: nuevoIngrediente.nombre.trim(),
        unidadBaseId: nuevoIngrediente.unidadId,
        costoUnitarioBase: parseFloat(nuevoIngrediente.costoUnitarioBase),
        factorConversion: factorConversionText || undefined,
        activo: true,
      });

      // Agregar a la lista de disponibles
      setIngredientesDisponibles([...ingredientesDisponibles, ingredienteCreado]);

      // Seleccionar automáticamente el ingrediente creado
      setIngredienteSeleccionado(ingredienteCreado);
      setInputValue(ingredienteCreado.nombre);

      // Cerrar dialog
      setAbrirDialogCrear(false);
      setNuevoIngrediente({ nombre: '', unidadId: unidades[0]?.id || 0, costoUnitarioBase: '', factorCantidadEntrada: '', factorCantidadSalida: '', factorUnidadSalidaId: 0 });
    } catch (err) {
      // Intentar extraer detalles del error
      let mensajeError = 'Error al crear ingrediente';
      
      if (err instanceof Error) {
        mensajeError = err.message;
        
        // Si es un error de validación, intentar extraer los detalles
        try {
          const errorData = JSON.parse(err.message);
          if (errorData.validationErrors) {
            const detalles = Object.entries(errorData.validationErrors)
              .map(([campo, msg]) => `${campo}: ${msg}`)
              .join(', ');
            mensajeError = `Validación: ${detalles}`;
          } else if (errorData.message) {
            mensajeError = errorData.message;
          }
        } catch {
          // No es JSON, usar el mensaje tal cual
        }
      }
      
      setError(mensajeError);
      console.error('Error detallado:', err);
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
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          Crear Nuevo Ingrediente (Materia Prima)
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* SECCIÓN 1: NOMBRE */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>
                1. ¿Qué compras? (Nombre de la Materia Prima)
              </Box>
              <Box sx={{ ml: 1, fontSize: '0.8rem', color: '#999' }}>
                ℹ️ Requerido
              </Box>
            </Box>
            <TextField
              fullWidth
              placeholder="Ejemplo: Naranja Fresca, Jugo Concentrado, Vaso 16oz"
              value={nuevoIngrediente.nombre}
              onChange={(e) =>
                setNuevoIngrediente((prev) => ({ ...prev, nombre: e.target.value }))
              }
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
              💡 Este es el nombre de la materia prima que compras al proveedor
            </Box>
          </Box>

          {/* SECCIÓN 2: UNIDAD DE COMPRA */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1, border: '1px solid #cce0ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#003d99' }}>
                2. ¿En qué unidad compras? (Unidad Base)
              </Box>
              <Box sx={{ ml: 1, fontSize: '0.8rem', color: '#0066cc' }}>
                ℹ️ Requerido - Crítico
              </Box>
            </Box>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>Selecciona la unidad de compra</InputLabel>
              <Select
                value={nuevoIngrediente.unidadId}
                label="Selecciona la unidad de compra"
                onChange={(e) =>
                  setNuevoIngrediente((prev) => ({ ...prev, unidadId: e.target.value as number }))
                }
              >
                {unidades.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{u.nombre}</span>
                      <Box sx={{ fontSize: '0.85rem', color: '#999' }}>
                        ({u.abreviatura})
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ fontSize: '0.8rem', color: '#003d99', fontStyle: 'italic' }}>
              📦 Esta unidad es la que usarás para:
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                <li>Registrar compras: "Compré 100 kg"</li>
                <li>Ver stock: "Quedan 30 kg"</li>
                <li>Crear recetas: "Usa 0.5 kg por unidad"</li>
              </ul>
            </Box>
          </Box>

          {/* SECCIÓN 2.5: COSTO UNITARIO BASE */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1, border: '1px solid #cce0ff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#003d99' }}>
                2.5. ¿Cuánto cuesta? (Costo por Unidad Base)
              </Box>
              <Box sx={{ ml: 1, fontSize: '0.8rem', color: '#0066cc' }}>
                ℹ️ Requerido
              </Box>
            </Box>
            <TextField
              fullWidth
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              placeholder="Ejemplo: 25.50, 100.00, etc"
              value={nuevoIngrediente.costoUnitarioBase}
              onChange={(e) =>
                setNuevoIngrediente((prev) => ({ ...prev, costoUnitarioBase: e.target.value }))
              }
              size="small"
              sx={{ mb: 1 }}
            />
            <Box sx={{ fontSize: '0.8rem', color: '#003d99', fontStyle: 'italic' }}>
              💰 Este es el costo de 1 unidad (ej: 1 kg cuesta $25.50)
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                <li>"1 kg Harina" = $25.50</li>
                <li>"1 litro Aceite" = $45.00</li>
                <li>"1 paquete Vasos" = $12.00</li>
              </ul>
            </Box>
          </Box>

          {/* SECCIÓN 3: FACTOR DE CONVERSIÓN - FLEXIBLE */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>
                3. ¿Cuánto rinde? (Factor de Conversión)
              </Box>
              <Box sx={{ ml: 1, fontSize: '0.8rem', color: '#999' }}>
                ℹ️ Opcional - Flexible para cualquier cantidad
              </Box>
            </Box>

            {/* Grid principal: ENTRADA (Izquierda) vs SALIDA (Derecha) */}
            <Box sx={{ mb: 2 }}>
              {/* ENTRADA: Cantidad + Unidad de lo que compras */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ fontSize: '0.8rem', fontWeight: '600', color: '#333', mb: 1 }}>
                  📥 Cantidad que COMPRAS:
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    placeholder="Ejemplo: 0.5, 1, 2"
                    value={nuevoIngrediente.factorCantidadEntrada}
                    onChange={(e) =>
                      setNuevoIngrediente((prev) => ({ ...prev, factorCantidadEntrada: e.target.value }))
                    }
                    size="small"
                    label="Cantidad"
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Unidad</InputLabel>
                    <Select
                      value={nuevoIngrediente.unidadId}
                      label="Unidad"
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
                </Box>
              </Box>

              {/* SALIDA: Cantidad + Unidad del rendimiento */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ fontSize: '0.8rem', fontWeight: '600', color: '#333', mb: 1 }}>
                  📤 Cantidad que RINDE:
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    placeholder="Ejemplo: 250, 500, 1000"
                    value={nuevoIngrediente.factorCantidadSalida}
                    onChange={(e) =>
                      setNuevoIngrediente((prev) => ({ ...prev, factorCantidadSalida: e.target.value }))
                    }
                    size="small"
                    label="Cantidad"
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Unidad de salida</InputLabel>
                    <Select
                      value={nuevoIngrediente.factorUnidadSalidaId}
                      label="Unidad de salida"
                      onChange={(e) =>
                        setNuevoIngrediente((prev) => ({ ...prev, factorUnidadSalidaId: e.target.value as number }))
                      }
                    >
                      <MenuItem value={0}>
                        <Box sx={{ color: '#999' }}>-- Sin especificar --</Box>
                      </MenuItem>
                      {unidades.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{u.nombre}</span>
                            <Box sx={{ fontSize: '0.85rem', color: '#999' }}>
                              ({u.abreviatura})
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Previsualización del factor - DINÁMICA Y FLEXIBLE */}
            {nuevoIngrediente.factorCantidadEntrada.trim() && nuevoIngrediente.factorCantidadSalida.trim() && (
              <Box sx={{ 
                p: 1.5, 
                backgroundColor: '#f0f7ff', 
                borderRadius: 1, 
                border: '1px solid #cce0ff',
                mb: 2
              }}>
                <Box sx={{ fontSize: '0.85rem', color: '#003d99', fontWeight: '600' }}>
                  ✅ Factor de Conversión:
                  <Box sx={{ 
                    mt: 0.5, 
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    color: '#0066cc',
                    fontWeight: 'bold'
                  }}>
                    {nuevoIngrediente.factorCantidadEntrada} {unidades.find(u => u.id === nuevoIngrediente.unidadId)?.abreviatura || '?'} = {nuevoIngrediente.factorCantidadSalida} {unidades.find(u => u.id === nuevoIngrediente.factorUnidadSalidaId)?.abreviatura || 'unidades'}
                  </Box>
                </Box>
              </Box>
            )}

            <Box sx={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
              📊 Ejemplos reales:
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                <li>Jugo: "0.5 kg Naranja" = "250 ml" (medio kilo rinde 250)</li>
                <li>Rebanadas: "100 gramos Embutido" = "10 rebanadas" (100g dan 10)</li>
                <li>Porciones: "1 kg Harina" = "40 panes" (1kg para 40 panes)</li>
                <li>Flexible: "2 kg Naranja" = "1000 ml" (2 kilos rinden 1 litro)</li>
              </ul>
              <Box sx={{ mt: 1, color: '#0066cc', fontWeight: '500' }}>
                ✅ Usarás esto en RECETAS para calcular costos exactos sin importar la cantidad
              </Box>
            </Box>
          </Box>

          {/* EJEMPLO VISUAL */}
          <Box sx={{ 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1, 
            border: '1px dashed #ccc',
            mb: 2
          }}>
            <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1.5, color: '#333' }}>
              📝 Ejemplos Reales (Diversos Productos):
            </Box>
            
            {/* Ejemplo 1: Naranja */}
            <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #ddd' }}>
              <Box sx={{ fontSize: '0.85rem', fontWeight: '600', color: '#0066cc', mb: 0.5 }}>
                🍊 Naranja:
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                1. Nombre: Naranja Fresca
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2. Unidad Base: kg
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2.5. Costo: $25.50/kg
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1, fontFamily: 'monospace' }}>
                3. Factor: <strong>0.5 kg = 250 ml</strong> (media pesa rinde 250ml)
              </Box>
            </Box>

            {/* Ejemplo 2: Embutido */}
            <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #ddd' }}>
              <Box sx={{ fontSize: '0.85rem', fontWeight: '600', color: '#0066cc', mb: 0.5 }}>
                🥓 Embutido/Jamón:
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                1. Nombre: Jamón Serrano
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2. Unidad Base: gramo
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2.5. Costo: $0.80/gramo
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1, fontFamily: 'monospace' }}>
                3. Factor: <strong>100 g = 15 rebanadas</strong> (100 gramos dan 15 rebanadas)
              </Box>
            </Box>

            {/* Ejemplo 3: Harina */}
            <Box sx={{ mb: 0 }}>
              <Box sx={{ fontSize: '0.85rem', fontWeight: '600', color: '#0066cc', mb: 0.5 }}>
                🥖 Harina:
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                1. Nombre: Harina Blanca
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2. Unidad Base: kg
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1 }}>
                2.5. Costo: $15.00/kg
              </Box>
              <Box sx={{ fontSize: '0.8rem', color: '#333', ml: 1, fontFamily: 'monospace' }}>
                3. Factor: <strong>1 kg = 40 panes</strong> (1 kilo rinde 40 panes)
              </Box>
            </Box>

            <Box sx={{ fontSize: '0.8rem', color: '#0066cc', fontWeight: '500', mt: 1.5, pt: 1.5, borderTop: '1px solid #ddd' }}>
              💡 <strong>Ventaja:</strong> Cada ingrediente puede tener su propia conversión, sin limitarte a "1" como cantidad fija
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
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
            disabled={loadingCrear || !nuevoIngrediente.nombre.trim() || !nuevoIngrediente.unidadId || !nuevoIngrediente.costoUnitarioBase.trim()}
          >
            {loadingCrear ? <CircularProgress size={20} /> : 'Crear Ingrediente'}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
