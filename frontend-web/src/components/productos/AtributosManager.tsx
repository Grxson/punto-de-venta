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
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit, Delete, Add, Close } from '@mui/icons-material';
import apiService from '../../services/api.service';

interface Opcion {
  id?: number;
  nombre: string;
  precioExtra: number;
}

interface Atributo {
  id?: number;
  nombre: string;
  tipo: 'SIMPLE' | 'MULTIPLE';
  requerido: boolean;
  opciones: Opcion[];
}

interface AtributosManagerProps {
  productoId: number;
  productoNombre: string;
  onUpdate: () => void;
}

export default function AtributosManager({ productoId, productoNombre, onUpdate }: AtributosManagerProps) {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAtributo, setEditingAtributo] = useState<Atributo | null>(null);

  // Form state para atributo
  const [nombreAtributo, setNombreAtributo] = useState('');
  const [tipoAtributo, setTipoAtributo] = useState<'SIMPLE' | 'MULTIPLE'>('SIMPLE');
  const [requerido, setRequerido] = useState(false);
  const [opciones, setOpciones] = useState<Opcion[]>([]);
  const [openOpcionDialog, setOpenOpcionDialog] = useState(false);
  const [nombreOpcion, setNombreOpcion] = useState('');
  const [precioExtraOpcion, setPrecioExtraOpcion] = useState<string>('');
  const [editingOpcionIndex, setEditingOpcionIndex] = useState<number | null>(null);

  useEffect(() => {
    if (productoId) {
      loadAtributos();
    }
  }, [productoId]);

  const loadAtributos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(`/v1/productos/${productoId}/atributos`);
      if (response.success && Array.isArray(response.data)) {
        setAtributos(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar atributos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (atributo?: Atributo) => {
    if (atributo) {
      setEditingAtributo(atributo);
      setNombreAtributo(atributo.nombre);
      setTipoAtributo(atributo.tipo);
      setRequerido(atributo.requerido);
      setOpciones(atributo.opciones || []);
    } else {
      setEditingAtributo(null);
      setNombreAtributo('');
      setTipoAtributo('SIMPLE');
      setRequerido(false);
      setOpciones([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAtributo(null);
    setNombreAtributo('');
    setTipoAtributo('SIMPLE');
    setRequerido(false);
    setOpciones([]);
    setEditingOpcionIndex(null);
  };

  const handleAddOpcion = () => {
    const precioNum = parseFloat(precioExtraOpcion) || 0;
    
    if (editingOpcionIndex !== null) {
      // Editar opción existente
      const newOpciones = [...opciones];
      newOpciones[editingOpcionIndex] = {
        ...newOpciones[editingOpcionIndex],
        nombre: nombreOpcion,
        precioExtra: precioNum,
      };
      setOpciones(newOpciones);
      setEditingOpcionIndex(null);
    } else {
      // Agregar nueva opción
      setOpciones([...opciones, { nombre: nombreOpcion, precioExtra: precioNum }]);
    }
    
    setNombreOpcion('');
    setPrecioExtraOpcion('');
    setOpenOpcionDialog(false);
  };

  const handleDeleteOpcion = (index: number) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  const handleEditOpcion = (index: number) => {
    const opcion = opciones[index];
    setNombreOpcion(opcion.nombre);
    setPrecioExtraOpcion(String(opcion.precioExtra));
    setEditingOpcionIndex(index);
    setOpenOpcionDialog(true);
  };

  const handleSaveAtributo = async () => {
    try {
      if (!nombreAtributo.trim()) {
        setError('El nombre del atributo es requerido');
        return;
      }

      if (opciones.length === 0) {
        setError('Debe agregar al menos una opción');
        return;
      }

      // Asegurar que tipo siempre tiene un valor válido
      const tipoFinal = tipoAtributo && (tipoAtributo === 'SIMPLE' || tipoAtributo === 'MULTIPLE') 
        ? tipoAtributo 
        : 'SIMPLE';

      const payload = {
        nombre: nombreAtributo.trim(),
        tipo: tipoFinal,
        requerido: Boolean(requerido),
        activo: true,
        opciones: opciones.map(op => ({
          nombre: op.nombre.trim(),
          precioExtra: parseFloat(String(op.precioExtra)) || 0,
        })),
      };

      setLoading(true);
      setError(null);

      if (editingAtributo?.id) {
        // Actualizar
        const response = await apiService.put(
          `/v1/productos/${productoId}/atributos/${editingAtributo.id}`,
          payload
        );
        if (response.success) {
          await loadAtributos();
          handleCloseDialog();
          onUpdate();
        } else {
          setError(response.error || 'Error al actualizar atributo');
        }
      } else {
        // Crear
        const response = await apiService.post(
          `/v1/productos/${productoId}/atributos`,
          payload
        );
        if (response.success) {
          await loadAtributos();
          handleCloseDialog();
          onUpdate();
        } else {
          setError(response.error || 'Error al crear atributo');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar atributo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAtributo = async (atributoId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este atributo?')) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiService.delete(`/v1/productos/${productoId}/atributos/${atributoId}`);
      
      if (response.success) {
        await loadAtributos();
        onUpdate();
      } else {
        setError(response.error || 'Error al eliminar atributo');
      }
    } catch (err: any) {
      setError(err.message || 'Error al eliminar atributo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Ingredientes/Componentes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="small"
        >
          Agregar Ingrediente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {!loading && atributos.length === 0 && (
        <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
          No hay ingredientes/componentes configurados para este producto
        </Typography>
      )}

      {!loading && atributos.length > 0 && (
        <List>
          {atributos.map((atributo) => (
            <Paper key={atributo.id} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {atributo.nombre}
                    {atributo.requerido && <Chip label="Requerido" size="small" color="primary" sx={{ ml: 1 }} />}
                    <Chip 
                      label={atributo.tipo === 'SIMPLE' ? 'Una opción' : 'Múltiples opciones'} 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1 }} 
                    />
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Opciones disponibles:
                  </Typography>
                  <Box sx={{ mt: 1, ml: 2 }}>
                    {atributo.opciones?.map((opcion, idx) => (
                      <Box key={idx} sx={{ py: 0.5 }}>
                        <Chip
                          label={`${opcion.nombre} (+$${opcion.precioExtra?.toFixed(2) || '0.00'})`}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(atributo)}
                    color="primary"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => atributo.id && handleDeleteAtributo(atributo.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </List>
      )}

      {/* Diálogo para crear/editar atributo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAtributo ? 'Editar Ingrediente/Componente' : 'Nuevo Ingrediente/Componente'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre del Ingrediente"
            value={nombreAtributo}
            onChange={(e) => setNombreAtributo(e.target.value)}
            margin="normal"
            placeholder="Ej: Sabor, Tipo de Pan, Bebida, etc."
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Tipo de Selección</InputLabel>
            <Select
              value={tipoAtributo}
              label="Tipo de Selección"
              onChange={(e) => setTipoAtributo(e.target.value as 'SIMPLE' | 'MULTIPLE')}
            >
              <MenuItem value="SIMPLE">Simple (Una sola opción)</MenuItem>
              <MenuItem value="MULTIPLE">Múltiple (Varias opciones)</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={<Checkbox checked={requerido} onChange={(e) => setRequerido(e.target.checked)} />}
            label="¿Es requerido seleccionar una opción?"
            sx={{ mt: 2 }}
          />

          <Typography variant="subtitle2" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
            Opciones
          </Typography>

          {opciones.length > 0 && (
            <TableContainer sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Nombre</TableCell>
                    <TableCell align="right">Precio Extra</TableCell>
                    <TableCell align="center" width={100}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opciones.map((opcion, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{opcion.nombre}</TableCell>
                      <TableCell align="right">${opcion.precioExtra?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEditOpcion(idx)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteOpcion(idx)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setOpenOpcionDialog(true)}
            fullWidth
            sx={{ mt: 1 }}
          >
            Agregar Opción
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSaveAtributo}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {editingAtributo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para agregar/editar opción */}
      <Dialog open={openOpcionDialog} onClose={() => setOpenOpcionDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingOpcionIndex !== null ? 'Editar Opción' : 'Nueva Opción'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Nombre de la Opción"
            value={nombreOpcion}
            onChange={(e) => setNombreOpcion(e.target.value)}
            margin="normal"
            placeholder="Ej: Dulce, Salado, Mediano, etc."
          />
          <TextField
            fullWidth
            label="Precio Extra"
            type="number"
            value={precioExtraOpcion}
            onChange={(e) => setPrecioExtraOpcion(e.target.value)}
            margin="normal"
            placeholder="0.00"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOpcionDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleAddOpcion}
            variant="contained"
            color="primary"
          >
            {editingOpcionIndex !== null ? 'Actualizar' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
