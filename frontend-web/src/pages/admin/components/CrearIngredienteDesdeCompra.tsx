import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { ingredientesService, Unidad } from '../../../services/ingredientes.service';

interface CompraSimple {
  id: number;
  nombre: string;
  fecha: string;
  cantidad: number;
  unidadId: number;
  unidadNombre?: string;
  unidadAbreviatura?: string;
  precioTotal: number;
}

interface CrearIngredienteDesdeCompraProps {
  open: boolean;
  onClose: () => void;
  onIngredienteCreado: (ingrediente: any) => void;
}

/**
 * Modal para crear un ingrediente basado en una compra simple
 * 
 * Flujo:
 * 1. Seleccionar una compra (nombre, cantidad comprada, unidad, precio)
 * 2. Especificar el RENDIMIENTO REAL/APROXIMADO
 *    - Cuántas unidades útiles salen del producto comprado
 *    - Ej: 1 kg jamón → 20 rebanadas
 *    - Ej: 100 kg harina → 500 porciones (de 200g cada una)
 *    - Ej: 100 kg naranjas → 50 litros de jugo (1kg rinde 0.5L)
 * 3. Seleccionar unidad del ingrediente final
 * 4. Calcular automáticamente costo unitario
 * 5. Crear ingrediente en el sistema
 * 
 * Ejemplos de rendimiento:
 * - Jamón: 1 kg → 20 rebanadas (el usuario especifica 20)
 * - Harina: 100 kg → 500 porciones (de 200g cada una)
 * - Naranjas: 100 kg → 50 litros (porque 1 kg rinde 0.5L de jugo)
 * - Pollo: 50 kg → 200 muslos + 150 pechugas (se puede hacer por separado)
 */
export default function CrearIngredienteDesdeCompra({
  open,
  onClose,
  onIngredienteCreado,
}: CrearIngredienteDesdeCompraProps) {
  const [compras, setCompras] = useState<CompraSimple[]>([]);
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraSimple | null>(null);
  const [unidades, setUnidades] = useState<Unidad[]>([]);

  const [rendimiento, setRendimiento] = useState<number>(1);
  const [unidadRendimientoId, setUnidadRendimientoId] = useState<number>(0);
  const [nombreIngrediente, setNombreIngrediente] = useState<string>('');

  // Nuevo: Factor de conversión
  const [cantidadFactorConversion, setCantidadFactorConversion] = useState<number>(1);
  const [unidadFactorId, setUnidadFactorId] = useState<number>(0);
  const [observacionesRendimiento, setObservacionesRendimiento] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar compras y unidades cuando abre el modal
  useEffect(() => {
    if (open) {
      cargarCompras();
      cargarUnidades();
    }
  }, [open]);

  // Actualizar nombre del ingrediente cuando se selecciona una compra
  useEffect(() => {
    if (compraSeleccionada) {
      setNombreIngrediente(compraSeleccionada.nombre);
      setRendimiento(compraSeleccionada.cantidad);
      setCantidadFactorConversion(compraSeleccionada.cantidad);
      setUnidadFactorId(compraSeleccionada.unidadId);
    }
  }, [compraSeleccionada]);

  const cargarCompras = () => {
    try {
      const comprasGuardadas = JSON.parse(localStorage.getItem('comprasSimples') || '[]');
      setCompras(comprasGuardadas);
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('No se pudieron cargar las compras');
    }
  };

  const cargarUnidades = async () => {
    try {
      const data = await ingredientesService.obtenerUnidades();
      setUnidades(data);
      if (data.length > 0) {
        setUnidadRendimientoId(data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar unidades:', err);
    }
  };

  const handleCrearIngrediente = async () => {
    if (!compraSeleccionada || rendimiento <= 0 || unidadRendimientoId === 0 || !nombreIngrediente.trim()) {
      setError('Completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Calcular costo unitario del ingrediente
      // Considerando el factor de conversión:
      // Costo por unidad = Precio Total ÷ (Cantidad Comprada × Rendimiento)
      const costoUnitario = compraSeleccionada.precioTotal / (compraSeleccionada.cantidad * rendimiento);

      // Obtener información del factor de conversión
      const unidadFactorObj = unidades.find(u => u.id === unidadFactorId);
      const unidadRendimientoObj = unidades.find(u => u.id === unidadRendimientoId);

      // Construir el factor de conversión para almacenar
      const factorConversion = `De ${cantidadFactorConversion} ${unidadFactorObj?.abreviatura || 'un'} obtengo ${rendimiento} ${unidadRendimientoObj?.abreviatura || 'un'}`;
      
      // Calcular costo por unidad de compra (para referencia)
      const costoPorUnidadCompra = compraSeleccionada.precioTotal / cantidadFactorConversion;

      const descripcion = [
        `📐 Factor de conversión: ${factorConversion}`,
        `💰 Costo por ${unidadFactorObj?.abreviatura || 'un'}: $${costoPorUnidadCompra.toFixed(6)}`,
        `💰 Costo unitario: $${costoUnitario.toFixed(6)} por ${unidadRendimientoObj?.abreviatura || 'un'}`,
        `📦 Origen: Compra de ${compraSeleccionada.cantidad} ${compraSeleccionada.unidadAbreviatura || 'un'} por $${compraSeleccionada.precioTotal}`,
        observacionesRendimiento ? `📝 Observaciones: ${observacionesRendimiento}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      // Crear el ingrediente
      const ingredienteCreado = await ingredientesService.crear({
        nombre: nombreIngrediente.trim(),
        unidadBaseId: unidadRendimientoId,
        costoUnitarioBase: costoUnitario,
        factorConversion: factorConversion,
        descripcion,
        activo: true,
        // NOTA: No vinculamos con gastoId porque las compras simples se guardan en localStorage
        // y no tienen ID en la BD. En el futuro, si las compras simples se guardan en BD,
        // podemos descomentar esto:
        // gastoId: compraSeleccionada.id,
        // unidadGastoId: unidadFactorId,
        // costoTotalGasto: compraSeleccionada.precioTotal,
      });

      setSuccess(`✅ Ingrediente "${ingredienteCreado.nombre}" creado correctamente\n💰 Costo: $${costoUnitario.toFixed(6)} por ${unidadRendimientoObj?.abreviatura}`);

      setTimeout(() => {
        onIngredienteCreado(ingredienteCreado);
        // Limpiar formulario
        setCompraSeleccionada(null);
        setRendimiento(1);
        setNombreIngrediente('');
        setCantidadFactorConversion(1);
        setUnidadFactorId(0);
        setObservacionesRendimiento('');
        onClose();
      }, 2000);
    } catch (err) {
      setError('Error al crear ingrediente: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const unidadRendimiento = unidades.find((u) => u.id === unidadRendimientoId);
  const costoUnitarioCalculado =
    compraSeleccionada && rendimiento > 0 
      ? compraSeleccionada.precioTotal / (compraSeleccionada.cantidad * rendimiento)
      : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>✨ Crear Ingrediente desde Compra</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mt: 2 }}>
          {/* PASO 1: Seleccionar compra */}
          <Card sx={{ mb: 3, backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Paso 1: Seleccionar Compra</h4>

              {compras.length === 0 ? (
                <Alert severity="info">No hay compras registradas. Crea una compra primero.</Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="center">Seleccionar</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {compras.map((compra) => (
                        <TableRow
                          key={compra.id}
                          sx={{
                            backgroundColor:
                              compraSeleccionada?.id === compra.id ? '#c8e6c9' : 'white',
                            cursor: 'pointer',
                          }}
                        >
                          <TableCell>{compra.nombre}</TableCell>
                          <TableCell align="right">
                            {compra.cantidad} {compra.unidadAbreviatura}
                          </TableCell>
                          <TableCell align="right">${compra.precioTotal.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant={compraSeleccionada?.id === compra.id ? 'contained' : 'outlined'}
                              onClick={() => setCompraSeleccionada(compra)}
                              disabled={loading}
                            >
                              {compraSeleccionada?.id === compra.id ? '✓' : 'Seleccionar'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* PASO 2: Configurar rendimiento */}
          {compraSeleccionada && (
            <Card sx={{ backgroundColor: '#f3e5f5' }}>
              <CardContent>
                <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Paso 2: Especificar Rendimiento Real/Aproximado</h4>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {/* Nombre del ingrediente */}
                  <Grid item xs={12}>
                    <TextField
                      label="Nombre del Ingrediente"
                      value={nombreIngrediente}
                      onChange={(e) => setNombreIngrediente(e.target.value)}
                      fullWidth
                      disabled={loading}
                      size="small"
                    />
                  </Grid>

                  {/* Resumen de la compra */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#fff3e0',
                        borderRadius: 1,
                        mb: 2,
                        borderLeft: '4px solid #ff9800',
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>📦 Compra seleccionada:</strong> {compraSeleccionada.nombre}
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>📊 Cantidad comprada:</strong> {compraSeleccionada.cantidad}{' '}
                        {compraSeleccionada.unidadAbreviatura}
                      </div>
                      <div>
                        <strong>💵 Precio total invertido:</strong> ${compraSeleccionada.precioTotal.toFixed(2)}
                      </div>
                    </Box>
                  </Grid>

                  {/* Info sobre rendimiento */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        backgroundColor: '#e8f5e9',
                        borderRadius: 1,
                        mb: 2,
                        borderLeft: '4px solid #4caf50',
                      }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <strong>💡 ¿Qué es el rendimiento?</strong>
                      </div>
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                        Es la cantidad <strong>TOTAL</strong> de unidades útiles que obtienes del producto comprado.
                      </div>
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        <strong>Ejemplos:</strong>
                      </div>
                      <ul style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: 0 }}>
                        <li>Jamón: Compras 1 kg → <strong>20 rebanadas</strong> (especifica: 20)</li>
                        <li>Harina: Compras 100 kg → <strong>500 porciones</strong> de 200g cada una (especifica: 500)</li>
                        <li>Naranjas: Compras 100 kg → <strong>50 litros</strong> de jugo (porque 1kg rinde 0.5L, especifica: 50)</li>
                        <li>Pollo: Compras 50 kg → <strong>200 muslos</strong> o <strong>150 pechugas</strong> (especifica lo que necesites)</li>
                      </ul>
                    </Box>
                  </Grid>

                  {/* NUEVA SECCIÓN: Factor de Conversión */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 2, backgroundColor: '#fff8e1', borderLeft: '4px solid #fbc02d' }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>📐 Factor de Conversión (Opcional)</strong>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Especifica DE QUÉ CANTIDAD de materia prima obtienes el rendimiento. Esto permite recalcular si la compra es diferente.
                      </div>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="De cuánta cantidad"
                            type="number"
                            value={cantidadFactorConversion}
                            onChange={(e) => setCantidadFactorConversion(parseFloat(e.target.value) || 0)}
                            fullWidth
                            disabled={loading}
                            size="small"
                            inputProps={{ step: '0.01', min: '0' }}
                            helperText="Ej: 1 (kg), 500 (g), 100 (kg)"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth disabled={loading} size="small">
                            <InputLabel>Unidad de entrada *</InputLabel>
                            <Select
                              value={unidadFactorId}
                              onChange={(e) => setUnidadFactorId(e.target.value as number)}
                              label="Unidad de entrada *"
                            >
                              {unidades.map((u) => (
                                <MenuItem key={u.id} value={u.id}>
                                  {u.nombre} ({u.abreviatura})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '0.85rem', color: '#666', fontStyle: 'italic' }}>
                            <strong>Ejemplos de factor:</strong>
                            <br />
                            • "De 1 kg de naranjas obtengo 500 ml de jugo" → 1 kg = 500 ml
                            <br />
                            • "De 500 g de naranjas obtengo 500 ml de jugo" → 500 g = 500 ml
                            <br />
                            • "De 100 kg de harina obtengo 500 porciones" → 100 kg = 500 porciones
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>

                  {/* Rendimiento */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Rendimiento Total (aproximado) *"
                      type="number"
                      value={rendimiento}
                      onChange={(e) => setRendimiento(parseFloat(e.target.value) || 0)}
                      fullWidth
                      inputProps={{ step: '0.01', min: '0' }}
                      disabled={loading}
                      size="small"
                      helperText="Ej: 20 rebanadas, 500 porciones, 50 litros, 200 muslos"
                    />
                  </Grid>

                  {/* Unidad de rendimiento */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={loading} size="small">
                      <InputLabel>Unidad del Ingrediente *</InputLabel>
                      <Select
                        value={unidadRendimientoId}
                        onChange={(e) => setUnidadRendimientoId(e.target.value as number)}
                        label="Unidad del Ingrediente *"
                      >
                        {unidades.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.nombre} ({u.abreviatura})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Observaciones del rendimiento */}
                  <Grid item xs={12}>
                    <TextField
                      label="Observaciones del rendimiento (Opcional)"
                      multiline
                      rows={2}
                      value={observacionesRendimiento}
                      onChange={(e) => setObservacionesRendimiento(e.target.value)}
                      fullWidth
                      disabled={loading}
                      size="small"
                      placeholder="Ej: Rendimiento aproximado, puede variar. Naranjas frescas con alto contenido de agua. Se elimina el 30% en cascara y semillas."
                      helperText="Notas sobre por qué tiene este rendimiento"
                    />
                  </Grid>

                  {/* Cálculo automático */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '0.9rem', color: '#666', mb: 1 }}>
                            <strong>📐 Cálculo automático:</strong>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '0.95rem', color: '#333', mb: 1 }}>
                            Precio Total ÷ Rendimiento Total = Costo Unitario
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '0.9rem', color: '#666', mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                            <strong>Factor de conversión:</strong> {cantidadFactorConversion} {unidades.find(u => u.id === unidadFactorId)?.abreviatura} = {rendimiento} {unidadRendimiento?.abreviatura}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '0.85rem', color: '#666', mb: 2, p: 1, backgroundColor: '#fffde7', borderRadius: 1, borderLeft: '3px solid #fbc02d' }}>
                            <div><strong>Desglose:</strong></div>
                            <div>• Cantidad comprada: {compraSeleccionada.cantidad} {unidades.find(u => u.id === unidadFactorId)?.abreviatura}</div>
                            <div>• Rendimiento total: {rendimiento} {unidadRendimiento?.abreviatura}</div>
                            <div>• Total de unidades: {compraSeleccionada.cantidad} × {rendimiento} = {(compraSeleccionada.cantidad * rendimiento).toLocaleString('es-ES')}</div>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ fontSize: '1.1rem', fontFamily: 'monospace', color: '#1976d2', mb: 1 }}>
                            ${compraSeleccionada.precioTotal.toFixed(2)} ÷ ({compraSeleccionada.cantidad} × {rendimiento || '?'}) = $
                            {costoUnitarioCalculado.toFixed(6)}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              color: '#2e7d32',
                              textAlign: 'center',
                              p: 2,
                              backgroundColor: '#fff',
                              borderRadius: 1,
                              border: '2px solid #4caf50',
                            }}
                          >
                            ${costoUnitarioCalculado.toFixed(6)} por {unidadRendimiento?.abreviatura}
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleCrearIngrediente}
          variant="contained"
          disabled={
            loading ||
            !compraSeleccionada ||
            rendimiento <= 0 ||
            unidadRendimientoId === 0 ||
            !nombreIngrediente.trim()
          }
        >
          {loading ? <CircularProgress size={24} /> : 'Crear Ingrediente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
