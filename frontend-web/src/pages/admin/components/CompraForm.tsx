import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { comprasService, CompraDetalle, CrearCompraRequest, ActualizarCompraRequest } from '../../../services/compras.service';
import { usuariosService } from '../../../services/usuarios.service';
import ProveedorAutoComplete, { Proveedor } from './ProveedorAutoComplete';
import SeleccionarIngredientes from './SeleccionarIngredientes';

interface IngredienteSeleccionado {
  ingredienteId: number;
  ingredienteNombre: string;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  cantidad: number;
  precioUnitario: number;
}

interface CompraFormProps {
  compraId?: number;
  onGuardado: () => void;
  onCancelado: () => void;
}

/**
 * Formulario para crear/editar una compra
 */
export default function CompraForm({ compraId, onGuardado, onCancelado }: CompraFormProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [fecha, setFecha] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [ingredientes, setIngredientes] = useState<IngredienteSeleccionado[]>([]);
  const [observaciones, setObservaciones] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modalIngredientes, setModalIngredientes] = useState(false);

  // Si es edición, cargar datos de la compra
  useEffect(() => {
    cargarProveedores();
    if (compraId) {
      cargarCompra();
    }
  }, [compraId]);

  /**
   * Cargar proveedores disponibles
   */
  const cargarProveedores = async () => {
    try {
      // Ya no es necesario cargar aquí, ProveedorAutoComplete se encarga
      // Mantener compatible con el estado por si se necesita
    } catch (err) {
      console.error('Error cargando proveedores:', err);
      setError('No se pudieron cargar los proveedores');
    }
  };

  /**
   * Cargar una compra existente
   */
  const cargarCompra = async () => {
    if (!compraId) return;
    setLoading(true);
    setError(null);
    try {
      const compra = await comprasService.obtener(compraId);
      setFecha(format(new Date(compra.fecha), 'yyyy-MM-dd'));
      setObservaciones(compra.notas || '');

      const proveedor = proveedores.find((p) => p.id === compra.proveedorId);
      setProveedorSeleccionado(proveedor || null);

      // Convertir items a ingredientes seleccionados
      const ingredientesConverted = compra.items.map((item) => ({
        ingredienteId: item.ingredienteId,
        ingredienteNombre: item.ingredienteNombre,
        unidadId: item.unidadId,
        unidadNombre: item.unidadNombre,
        unidadAbreviatura: item.unidadAbreviatura,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      }));
      setIngredientes(ingredientesConverted);
    } catch (err) {
      setError('Error al cargar la compra: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un ingrediente de la compra
   */
  const eliminarIngrediente = (ingredienteId: number) => {
    setIngredientes(ingredientes.filter((i) => i.ingredienteId !== ingredienteId));
  };

  /**
   * Guardar la compra
   */
  const handleGuardar = async () => {
    if (!proveedorSeleccionado || ingredientes.length === 0) {
      setError('Completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData = {
        proveedorId: proveedorSeleccionado.id,
        fecha: `${fecha}T00:00:00`,
        items: ingredientes.map((i) => ({
          ingredienteId: i.ingredienteId,
          cantidad: i.cantidad,
          unidadId: i.unidadId,
          precioUnitario: i.precioUnitario,
        })),
        observaciones,
      };

      if (compraId) {
        await comprasService.actualizar(compraId, requestData as ActualizarCompraRequest);
        setSuccess('Compra actualizada correctamente');
      } else {
        await comprasService.crear(requestData as CrearCompraRequest);
        setSuccess('Compra creada correctamente');
      }

      setTimeout(() => {
        onGuardado();
      }, 1500);
    } catch (err) {
      setError('Error al guardar la compra: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const totalCompra = ingredientes.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
  const esEdicion = !!compraId;

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading && !compraId ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Sección: Datos Generales */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <h3 style={{ marginTop: 0 }}>{esEdicion ? 'Editar Compra' : 'Nueva Compra'}</h3>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ProveedorAutoComplete
                    value={proveedorSeleccionado}
                    onChange={setProveedorSeleccionado}
                    label="Proveedor *"
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Compra *"
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    multiline
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    fullWidth
                    placeholder="Notas adicionales sobre la compra..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Sección: Ingredientes */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <h3 style={{ margin: 0 }}>Ingredientes ({ingredientes.length})</h3>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setModalIngredientes(true)}
                >
                  Agregar Ingredientes
                </Button>
              </Box>

              {ingredientes.length === 0 ? (
                <Alert severity="info">No hay ingredientes en esta compra. Agrega al menos uno.</Alert>
              ) : (
                <>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
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
                        {ingredientes.map((item) => (
                          <TableRow key={item.ingredienteId}>
                            <TableCell>{item.ingredienteNombre}</TableCell>
                            <TableCell align="right">{item.cantidad.toFixed(2)}</TableCell>
                            <TableCell align="center">{item.unidadAbreviatura}</TableCell>
                            <TableCell align="right">${item.precioUnitario.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              ${(item.cantidad * item.precioUnitario).toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                color="error"
                                onClick={() => eliminarIngrediente(item.ingredienteId)}
                              >
                                <Delete fontSize="small" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Total */}
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: '#f9f9f9',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'flex-end',
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Total Compra: ${totalCompra.toFixed(2)}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancelado} variant="outlined">
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              variant="contained"
              disabled={loading || ingredientes.length === 0 || !proveedorSeleccionado}
            >
              {loading ? <CircularProgress size={24} /> : esEdicion ? 'Actualizar Compra' : 'Crear Compra'}
            </Button>
          </Box>

          {/* Modal Seleccionar Ingredientes */}
          <SeleccionarIngredientes
            open={modalIngredientes}
            onClose={() => setModalIngredientes(false)}
            onSeleccionar={(nuevosIngredientes) => {
              setIngredientes([...ingredientes, ...nuevosIngredientes]);
              setModalIngredientes(false);
            }}
            ingredientesIniciales={ingredientes}
          />
        </>
      )}
    </Box>
  );
}
