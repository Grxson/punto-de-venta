import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import type { Producto } from '../../types/productos.types';
import { productosService } from '../../services/productos.service';

interface VariantesManagerProps {
  productoId: number;
  productoNombre: string;
  onUpdate: () => void;
}

export default function VariantesManager({ productoId, productoNombre, onUpdate }: VariantesManagerProps) {
  const [variantes, setVariantes] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVariante, setEditingVariante] = useState<Producto | null>(null);

  // Form state
  const [nombreVariante, setNombreVariante] = useState('');
  const [precio, setPrecio] = useState<string>('');
  const [ordenVariante, setOrdenVariante] = useState<string>('');

  useEffect(() => {
    if (productoId) {
      loadVariantes();
    }
  }, [productoId]);

  const loadVariantes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch product details which includes variantes in the ProductoDTO
      const response = await productosService.obtener(productoId);
      if (response.success && response.data) {
        // Extract variantes from the product DTO
        const productData = response.data as any;
        const variantesFromResponse = productData.variantes || [];
        
        setVariantes(variantesFromResponse);
      }
    } catch (err: any) {
      setError('Error al cargar variantes: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (variante?: Producto) => {
    if (variante) {
      setEditingVariante(variante);
      setNombreVariante(variante.nombreVariante || '');
      setPrecio(variante.precio?.toString() || '');
      setOrdenVariante(variante.ordenVariante?.toString() || '');
    } else {
      setEditingVariante(null);
      setNombreVariante('');
      setPrecio('');
      setOrdenVariante('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVariante(null);
    setNombreVariante('');
    setPrecio('');
    setOrdenVariante('');
    setError(null);
  };

  const handleSaveVariante = async () => {
    if (!nombreVariante.trim()) {
      setError('El nombre de la variante es obligatorio');
      return;
    }
    if (!precio || parseFloat(precio) < 0) {
      setError('El precio debe ser mayor o igual a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const varianteData: Partial<Producto> = {
        nombre: `${productoNombre} - ${nombreVariante.trim()}`,
        nombreVariante: nombreVariante.trim(),
        precio: parseFloat(precio),
        ordenVariante: ordenVariante ? parseInt(ordenVariante) : variantes.length + 1,
      };

      if (editingVariante?.id) {
        // Actualizar variante existente
        await productosService.actualizar(editingVariante.id, varianteData);
      } else {
        // Crear nueva variante usando el endpoint específico
        await productosService.crearVariante(productoId, varianteData as Omit<Producto, 'id' | 'variantes'>);
      }

      handleCloseDialog();
      loadVariantes();
      onUpdate();
    } catch (err: any) {
      console.error('Error guardando variante:', err);
      let mensajeError = 'Error al guardar la variante';

      // Si es un error de conflicto (409), probablemente es nombre duplicado
      if (err.statusCode === 409) {
        mensajeError = 'El nombre de esta variante ya existe. Usa un nombre diferente.';
      } else if (err.message) {
        mensajeError = err.message;
      }

      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariante = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta variante?')) {
      return;
    }

    try {
      setLoading(true);
      await productosService.eliminar(id);
      loadVariantes();
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar la variante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Variantes</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Agregar Variante
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && variantes.length === 0 ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : variantes.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay variantes. Agregue una para crear diferentes tamaños o presentaciones.
        </Typography>
      ) : (
        <List>
          {variantes.map((variante) => (
            <ListItem key={variante.id}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">{variante.nombreVariante}</Typography>
                    {variante.ordenVariante && (
                      <Chip label={`Orden: ${variante.ordenVariante}`} size="small" />
                    )}
                  </Box>
                }
                secondary={`Precio: $${variante.precio?.toFixed(2)}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleOpenDialog(variante)}
                  disabled={loading}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => variante.id && handleDeleteVariante(variante.id)}
                  disabled={loading}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Dialog para crear/editar variante */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVariante ? 'Editar Variante' : 'Nueva Variante'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre de la variante *"
              value={nombreVariante}
              onChange={(e) => setNombreVariante(e.target.value)}
              fullWidth
              required
              placeholder="Ej: Grande, 500ml, Chico"
              disabled={loading}
            />

            <TextField
              label="Precio *"
              type="number"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
              disabled={loading}
            />

            <TextField
              label="Orden"
              type="number"
              value={ordenVariante}
              onChange={(e) => setOrdenVariante(e.target.value)}
              fullWidth
              inputProps={{ min: 1 }}
              helperText="Orden de visualización (menor número = primero)"
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveVariante}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {editingVariante ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

