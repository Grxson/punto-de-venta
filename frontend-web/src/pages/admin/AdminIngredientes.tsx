import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
} from '@mui/material';
import { Edit, Delete, CheckCircle, Link as LinkIcon } from '@mui/icons-material';
import { ingredientesService, Ingrediente, Unidad } from '../../services/ingredientes.service';

export default function AdminIngredientes() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingIngredienteId, setEditingIngredienteId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

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
    </Box>
  );
}
