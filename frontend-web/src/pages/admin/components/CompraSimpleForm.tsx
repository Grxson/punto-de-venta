import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import { ingredientesService, Unidad } from '../../../services/ingredientes.service';

interface CompraSimple {
  nombre: string;
  fecha: string;
  cantidad: number;
  unidadId: number;
  precioTotal: number;
}

interface CompraSimpleFormProps {
  onGuardado: (compra: CompraSimple & { id?: number }) => void;
  onCancelado: () => void;
}

/**
 * Formulario simple para registrar una compra sin necesidad de proveedor
 * Solo: nombre, fecha, cantidad, unidad, precio
 * 
 * Esta compra se puede luego transformar en ingrediente
 */
export default function CompraSimpleForm({ onGuardado, onCancelado }: CompraSimpleFormProps) {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [compra, setCompra] = useState<CompraSimple>({
    nombre: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    cantidad: 1,
    unidadId: 0,
    precioTotal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar unidades disponibles
  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = async () => {
    try {
      const data = await ingredientesService.obtenerUnidades();
      setUnidades(data);
      if (data.length > 0) {
        setCompra((prev) => ({ ...prev, unidadId: data[0].id }));
      }
    } catch (err) {
      console.error('Error al cargar unidades:', err);
      setError('No se pudieron cargar las unidades');
    }
  };

  const handleGuardar = async () => {
    // Validar campos
    if (!compra.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (compra.cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (compra.precioTotal < 0) {
      setError('El precio no puede ser negativo');
      return;
    }
    if (compra.unidadId === 0) {
      setError('Selecciona una unidad');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Guardar en localStorage como compra simple
      // (Idealmente esto iría al backend, pero por ahora lo almacenamos localmente)
      const compraConId = {
        ...compra,
        id: Date.now(), // ID temporal basado en timestamp
      };

      // Obtener compras existentes del localStorage
      const comprasExistentes = JSON.parse(localStorage.getItem('comprasSimples') || '[]');
      comprasExistentes.push(compraConId);
      localStorage.setItem('comprasSimples', JSON.stringify(comprasExistentes));

      setSuccess('Compra registrada correctamente');
      setTimeout(() => {
        onGuardado(compraConId);
      }, 1500);
    } catch (err) {
      setError('Error al guardar la compra: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const precioUnitario = compra.cantidad > 0 ? compra.precioTotal / compra.cantidad : 0;
  const unidadSeleccionada = unidades.find((u) => u.id === compra.unidadId);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card>
        <CardContent>
          <h3 style={{ marginTop: 0 }}>📦 Registrar Nueva Compra</h3>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Nombre del producto/ingrediente */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre del Producto *"
                placeholder="Ej: Harina, Leche, Huevos"
                value={compra.nombre}
                onChange={(e) => setCompra({ ...compra, nombre: e.target.value })}
                fullWidth
                disabled={loading}
              />
            </Grid>

            {/* Fecha */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha de Compra *"
                type="date"
                value={compra.fecha}
                onChange={(e) => setCompra({ ...compra, fecha: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>

            {/* Cantidad */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Cantidad *"
                type="number"
                value={compra.cantidad}
                onChange={(e) => setCompra({ ...compra, cantidad: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                disabled={loading}
              />
            </Grid>

            {/* Unidad */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Unidad *</InputLabel>
                <Select
                  value={compra.unidadId}
                  onChange={(e) => setCompra({ ...compra, unidadId: e.target.value as number })}
                  label="Unidad *"
                >
                  {unidades.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.nombre} ({u.abreviatura})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Precio Total */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Precio Total $"
                type="number"
                value={compra.precioTotal}
                onChange={(e) => setCompra({ ...compra, precioTotal: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: '0.01', min: '0' }}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Resumen */}
          <Card variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: '#f9f9f9' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <strong>Cantidad Total:</strong> {compra.cantidad} {unidadSeleccionada?.abreviatura}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <strong>Precio Unitario:</strong> ${precioUnitario.toFixed(2)} /{' '}
                  {unidadSeleccionada?.abreviatura}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1976d2' }}>
                  Total: ${compra.precioTotal.toFixed(2)}
                </Box>
              </Grid>
            </Grid>
          </Card>

          {/* Botones */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancelado} variant="outlined" disabled={loading}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardar}
              variant="contained"
              disabled={loading || !compra.nombre.trim() || compra.cantidad <= 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Registrar Compra'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
