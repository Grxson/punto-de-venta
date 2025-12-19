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
  TablePagination,
  Autocomplete,
  Divider,
  Paper,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Delete, Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import apiService from '../../services/api.service';
import { API_ENDPOINTS } from '../../config/api.config';

interface Merma {
  id: number;
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  motivo: string;
  fecha: string;
  responsableId?: number;
  responsableNombre?: string;
  costoUnitario: number;
  costoTotal: number;
}

interface Ingrediente {
  id: number;
  nombre: string;
  unidadBaseId: number;
  costoUnitarioBase: number;
}

interface Unidad {
  id: number;
  nombre: string;
  abreviatura: string;
}

export default function AdminMermas() {
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; tipo: 'success' | 'error' }>({
    open: false,
    message: '',
    tipo: 'success',
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogDelete, setDialogDelete] = useState(false);

  // Form fields
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
  const [cantidad, setCantidad] = useState<number>(0);
  const [unidadId, setUnidadId] = useState<number | ''>('');
  const [motivo, setMotivo] = useState<string>('');
  const [costoUnitario, setCostoUnitario] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      // Cargar mermas, ingredientes y unidades
      const [mermasRes, ingredientesRes, unidadesRes] = await Promise.all([
        apiService.get('/inventario/mermas'),
        apiService.get(API_ENDPOINTS.PRODUCTS),
        apiService.get('/inventario/unidades'),
      ]);

      if (mermasRes.success && Array.isArray(mermasRes.data)) {
        setMermas(mermasRes.data);
      }
      if (ingredientesRes.success && Array.isArray(ingredientesRes.data)) {
        setIngredientes(ingredientesRes.data);
      }
      if (unidadesRes.success && Array.isArray(unidadesRes.data)) {
        setUnidades(unidadesRes.data);
      }
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingData(false);
    }
  };

  const filteredMermas = useMemo(() => {
    return mermas.filter((merma) =>
      merma.ingredienteNombre.toLowerCase().includes(searchText.toLowerCase()) ||
      merma.motivo.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [mermas, searchText]);

  const handleOpenDialog = () => {
    setIngredienteSeleccionado(null);
    setCantidad(0);
    setUnidadId('');
    setMotivo('');
    setCostoUnitario(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleGuardarMerma = async () => {
    if (!ingredienteSeleccionado || cantidad <= 0 || !motivo.trim() || !unidadId) {
      setError('Completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const costoTotal = cantidad * costoUnitario;

      const mermaData = {
        ingredienteId: ingredienteSeleccionado.id,
        cantidad,
        unidadId,
        motivo: motivo.trim(),
        fecha: new Date().toISOString(),
        costoUnitario,
        costoTotal,
      };

      const response = await apiService.post('/inventario/mermas', mermaData);

      if (response.success) {
        setSnackbar({
          open: true,
          message: '✓ Merma registrada exitosamente',
          tipo: 'success',
        });
        handleCloseDialog();
        await loadData();
      } else {
        setError(response.error || 'Error al guardar la merma');
      }
    } catch (err: any) {
      console.error('Error al guardar merma:', err);
      setError(err.message || 'Error al guardar la merma');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarMerma = async (mermaId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.delete(`/inventario/mermas/${mermaId}`);

      if (response.success) {
        setSnackbar({
          open: true,
          message: '✓ Merma eliminada exitosamente',
          tipo: 'success',
        });
        setDialogDelete(false);
        await loadData();
      } else {
        setError(response.error || 'Error al eliminar la merma');
      }
    } catch (err: any) {
      console.error('Error al eliminar merma:', err);
      setError(err.message || 'Error al eliminar la merma');
    } finally {
      setLoading(false);
      setDeletingId(null);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Gestión de Mermas
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Botón agregar merma */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Buscar por ingrediente o motivo..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, mr: 2 }}
          size="small"
        />
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Registrar Merma
        </Button>
      </Box>

      {/* Tabla de mermas */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Ingrediente</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cantidad</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Unidad</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Costo Unitario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Costo Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMermas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((merma) => (
              <TableRow key={merma.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell>{merma.ingredienteNombre}</TableCell>
                <TableCell align="right">{merma.cantidad.toFixed(2)}</TableCell>
                <TableCell>{merma.unidadAbreviatura}</TableCell>
                <TableCell>{merma.motivo}</TableCell>
                <TableCell align="right">${merma.costoUnitario.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${merma.costoTotal.toFixed(2)}
                </TableCell>
                <TableCell>{format(new Date(merma.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setDeletingId(merma.id);
                      setDialogDelete(true);
                    }}
                    title="Eliminar merma"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredMermas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No hay mermas registradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredMermas.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Diálogo para registrar merma */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Registrar Nueva Merma</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Seleccionar ingrediente */}
            <Autocomplete
              options={ingredientes}
              getOptionLabel={(option) => option.nombre}
              value={ingredienteSeleccionado}
              onChange={(event, newValue) => {
                setIngredienteSeleccionado(newValue);
                if (newValue) {
                  setCostoUnitario(newValue.costoUnitarioBase);
                  setUnidadId(newValue.unidadBaseId);
                }
              }}
              renderInput={(params) => <TextField {...params} label="Ingrediente *" placeholder="Buscar ingrediente..." />}
              disabled={loading}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            {/* Cantidad */}
            <TextField
              label="Cantidad *"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
              inputProps={{ step: '0.01', min: '0' }}
              disabled={loading}
              fullWidth
            />

            {/* Unidad */}
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Unidad *</InputLabel>
              <Select
                value={unidadId}
                onChange={(e) => setUnidadId(e.target.value as number)}
                label="Unidad *"
              >
                {unidades.map((unidad) => (
                  <MenuItem key={unidad.id} value={unidad.id}>
                    {unidad.nombre} ({unidad.abreviatura})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Costo Unitario */}
            <TextField
              label="Costo Unitario ($) *"
              type="number"
              value={costoUnitario}
              onChange={(e) => setCostoUnitario(parseFloat(e.target.value) || 0)}
              inputProps={{ step: '0.01', min: '0' }}
              disabled={loading}
              fullWidth
            />

            {/* Costo Total (readonly) */}
            {cantidad > 0 && costoUnitario > 0 && (
              <Box sx={{ p: 1.5, backgroundColor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Costo Total:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  ${(cantidad * costoUnitario).toFixed(2)}
                </Typography>
              </Box>
            )}

            <Divider />

            {/* Motivo */}
            <TextField
              label="Motivo de la Merma *"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              multiline
              rows={3}
              placeholder="Describe por qué se registra esta merma (ej: Producto vencido, rotura de empaque, etc.)"
              disabled={loading}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarMerma}
            variant="contained"
            disabled={!ingredienteSeleccionado || cantidad <= 0 || !motivo.trim() || !unidadId || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar Merma'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta merma? Esta acción no se puede deshacer.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogDelete(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={() => deletingId !== null && handleEliminarMerma(deletingId)}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
