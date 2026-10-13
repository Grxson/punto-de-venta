import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import { Add, Edit, Delete, Close } from '@mui/icons-material';
import apiService from '../../../services/api.service';

/** Proveedor del catálogo, tal como lo expone `/inventario/proveedores`. */
export interface Proveedor {
  /** Id del proveedor en el backend. */
  id: number;
  /** Nombre o razón social. */
  nombre: string;
  /** RUC opcional. */
  ruc?: string;
  /** Teléfono de contacto opcional. */
  telefono?: string;
  /** Email de contacto opcional. */
  email?: string;
}

/** Props del selector de proveedores con alta y edición inline. */
interface ProveedorAutoCompleteProps {
  /** Proveedor seleccionado; `null` cuando no hay ninguno. */
  value: Proveedor | null;
  /** Notifica el cambio de selección (o `null` al limpiar/eliminar). */
  onChange: (proveedor: Proveedor | null) => void;
  /** Etiqueta del campo; por defecto `Proveedor`. */
  label?: string;
  /** Marca el campo como obligatorio en el formulario padre. */
  required?: boolean;
  /** Ocupa todo el ancho disponible; `true` por defecto. */
  fullWidth?: boolean;
  /** Densidad visual del `Autocomplete`. */
  size?: 'small' | 'medium';
}

/**
 * Autocomplete de proveedores para el formulario de compras.
 * Permite elegir uno existente, crear otro escribiendo un nombre sin coincidencias,
 * o editar/eliminar los ya listados sin salir del formulario.
 * @remarks Mantiene su propia lista de proveedores en `useState` y la recarga al
 * montar; al crear o editar propaga el resultado al padre con `onChange`.
 */
export default function ProveedorAutoComplete({
  value,
  onChange,
  label = 'Proveedor',
  required = false,
  fullWidth = true,
  size = 'small',
}: ProveedorAutoCompleteProps) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [formData, setFormData] = useState({ nombre: '', ruc: '', telefono: '', email: '' });
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores al montar
  useEffect(() => {
    cargarProveedores();
  }, []);

  /**
   * Cargar lista de proveedores desde el backend
   */
  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/inventario/proveedores');
      if (response.data) {
        setProveedores(response.data);
      }
    } catch (err) {
      console.error('Error cargando proveedores:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Abrir dialog para crear nuevo proveedor
   */
  const handleAbrirCrearProveedor = () => {
    setDialogMode('create');
    setFormData({ nombre: inputValue || '', ruc: '', telefono: '', email: '' });
    setEditingProveedor(null);
    setError(null);
    setOpenDialog(true);
  };

  /**
   * Abre el dialog en modo edición precargando los datos del proveedor.
   * @param e - Evento del click; se detiene para no seleccionar la opción del listado.
   * @param proveedor - Proveedor a editar.
   */
  const handleAbrirEditarProveedor = (e: React.MouseEvent, proveedor: Proveedor) => {
    e.stopPropagation();
    setDialogMode('edit');
    setEditingProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      ruc: proveedor.ruc || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
    });
    setError(null);
    setOpenDialog(true);
  };

  /**
   * Guardar proveedor (crear o editar)
   */
  const handleGuardarProveedor = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre del proveedor es obligatorio');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (dialogMode === 'create') {
        // Crear nuevo
        response = await apiService.post('/inventario/proveedores', {
          nombre: formData.nombre,
          ruc: formData.ruc || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
        });

        if (response.data) {
          const nuevoProveedor = response.data;
          setProveedores([...proveedores, nuevoProveedor]);
          onChange(nuevoProveedor);
          setInputValue('');
        }
      } else if (dialogMode === 'edit' && editingProveedor) {
        // Editar existente
        response = await apiService.put(`/inventario/proveedores/${editingProveedor.id}`, {
          nombre: formData.nombre,
          ruc: formData.ruc || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
        });

        if (response.data) {
          const proveedorActualizado = response.data;
          setProveedores(
            proveedores.map((p) => (p.id === proveedorActualizado.id ? proveedorActualizado : p))
          );
          if (value?.id === editingProveedor.id) {
            onChange(proveedorActualizado);
          }
        }
      }

      setOpenDialog(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina el proveedor tras confirmar, y limpia la selección si era el activo.
   * @param e - Evento del click; se detiene para no seleccionar la opción del listado.
   * @param proveedor - Proveedor a eliminar.
   */
  const handleEliminarProveedor = async (e: React.MouseEvent, proveedor: Proveedor) => {
    e.stopPropagation();

    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${proveedor.nombre}?`)) {
      return;
    }

    setLoading(true);
    try {
      await apiService.delete(`/inventario/proveedores/${proveedor.id}`);
      setProveedores(proveedores.filter((p) => p.id !== proveedor.id));
      if (value?.id === proveedor.id) {
        onChange(null);
        setInputValue('');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opciones de filtrado y menú personalizado
   */
  const filteredOptions = proveedores.filter((p) =>
    p.nombre.toLowerCase().includes(inputValue.toLowerCase())
  );

  const hasNoMatch = inputValue.trim() && filteredOptions.length === 0;

  return (
    <>
      <Autocomplete
        options={filteredOptions}
        getOptionLabel={(option) => option.nombre}
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
        loading={loading}
        fullWidth={fullWidth}
        size={size}
        freeSolo={false}
        noOptionsText={
          hasNoMatch ? (
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                startIcon={<Add />}
                onClick={handleAbrirCrearProveedor}
                variant="text"
                size="small"
              >
                Crear "{inputValue}"
              </Button>
            </Box>
          ) : (
            'Sin opciones'
          )
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder="Buscar o crear proveedor"
            required={required}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Paper
            {...props}
            component="li"
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1,
              mb: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box>
              <div>{option.nombre}</div>
              {option.ruc && <small style={{ color: '#666' }}>RUC: {option.ruc}</small>}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={(e) => handleAbrirEditarProveedor(e, option)}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  onClick={(e) => handleEliminarProveedor(e, option)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        )}
      />

      {/* Dialog para crear/editar proveedor */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Crear Nuevo Proveedor' : 'Editar Proveedor'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {error && <Box sx={{ color: 'error.main', mb: 2, p: 1, bgcolor: 'error.lighter' }}>{error}</Box>}

          <TextField
            fullWidth
            label="Nombre del Proveedor *"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            margin="normal"
            placeholder="Ej: Distribuidora XYZ"
          />

          <TextField
            fullWidth
            label="RUC"
            value={formData.ruc}
            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
            margin="normal"
            placeholder="Ej: 12345678901"
          />

          <TextField
            fullWidth
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            margin="normal"
            placeholder="Ej: +51 987 654 321"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            placeholder="Ej: contacto@proveedor.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleGuardarProveedor}
            variant="contained"
            disabled={loading || !formData.nombre.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
