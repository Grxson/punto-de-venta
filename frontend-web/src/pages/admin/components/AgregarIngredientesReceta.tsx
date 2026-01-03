import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
  Grid,
  Typography,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Delete, Add, Search } from '@mui/icons-material';
import { Ingrediente, Unidad } from '../../../services/ingredientes.service';

interface RecetaIngrediente {
  ingredienteId: number;
  ingredienteNombre: string;
  cantidad: number;
  unidadId: number;
  unidadNombre: string;
  unidadAbreviatura: string;
  mermaTeorica?: number;
  costoUnitario?: number;
  costoTotal?: number;
}

interface AgregarIngredientesRecetaProps {
  ingredientesDisponibles: Ingrediente[];
  unidades: Unidad[];
  ingredientesEnReceta: RecetaIngrediente[];
  onAgregarIngrediente: (ingrediente: RecetaIngrediente) => void;
  onRemoverIngrediente: (ingredienteId: number) => void;
  loading?: boolean;
}

export default function AgregarIngredientesReceta({
  ingredientesDisponibles,
  unidades,
  ingredientesEnReceta,
  onAgregarIngrediente,
  onRemoverIngrediente,
  loading = false,
}: AgregarIngredientesRecetaProps) {
  // Estado del formulario para agregar ingrediente
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<Ingrediente | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<Unidad | null>(
    unidades.length > 0 ? unidades[0] : null
  );
  const [mermaTeoria, setMermaTeoria] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState<boolean>(false);

  // Actualizar unidad seleccionada cuando cambian las unidades
  useEffect(() => {
    if (unidades.length > 0 && !unidadSeleccionada) {
      setUnidadSeleccionada(unidades[0]);
    }
  }, [unidades, unidadSeleccionada]);

  // Búsqueda indexada de ingredientes
  const ingredientesFiltrados = useMemo(() => {
    if (!searchText.trim()) {
      return ingredientesDisponibles.filter(
        (ing) => !ingredientesEnReceta.some((r) => r.ingredienteId === ing.id)
      );
    }

    const search = searchText.toLowerCase();
    return ingredientesDisponibles
      .filter(
        (ing) =>
          (ing.nombre?.toLowerCase().includes(search) ||
            ing.descripcion?.toLowerCase().includes(search)) &&
          !ingredientesEnReceta.some((r) => r.ingredienteId === ing.id)
      )
      .sort((a, b) => {
        // Priorizar coincidencias exactas al inicio
        const aStarts = a.nombre?.toLowerCase().startsWith(search);
        const bStarts = b.nombre?.toLowerCase().startsWith(search);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
  }, [searchText, ingredientesDisponibles, ingredientesEnReceta]);

  // Calcular costo del ingrediente
  const calcularCostoIngrediente = () => {
    if (!ingredienteSeleccionado || !unidadSeleccionada || cantidad <= 0) {
      return 0;
    }

    const costoUnitario = ingredienteSeleccionado.costoUnitarioBase || 0;

    // Si la unidad es diferente a la unidad base, convertir
    // Por ahora, asumimos que es la misma unidad
    const cantidadReal = cantidad / (1 - (mermaTeoria || 0) / 100);
    return cantidadReal * costoUnitario;
  };

  const handleAgregarIngrediente = () => {
    setError(null);

    if (!ingredienteSeleccionado) {
      setError('Debe seleccionar un ingrediente');
      return;
    }

    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (!unidadSeleccionada) {
      setError('Debe seleccionar una unidad');
      return;
    }

    // Verificar si el ingrediente ya existe
    if (ingredientesEnReceta.some((ing) => ing.ingredienteId === ingredienteSeleccionado.id)) {
      setError('Este ingrediente ya está en la receta');
      return;
    }

    const costoTotal = calcularCostoIngrediente();

    const nuevoIngrediente: RecetaIngrediente = {
      ingredienteId: ingredienteSeleccionado.id,
      ingredienteNombre: ingredienteSeleccionado.nombre,
      cantidad,
      unidadId: unidadSeleccionada.id,
      unidadNombre: unidadSeleccionada.nombre,
      unidadAbreviatura: unidadSeleccionada.abreviatura,
      mermaTeorica: mermaTeoria || 0,
      costoUnitario: ingredienteSeleccionado.costoUnitarioBase || 0,
      costoTotal,
    };

    onAgregarIngrediente(nuevoIngrediente);

    // Limpiar formulario
    setIngredienteSeleccionado(null);
    setCantidad(1);
    setMermaTeoria(0);
    setSearchText('');
    setMostrarForm(false);
  };

  const totalCostoIngredientes = ingredientesEnReceta.reduce(
    (sum, ing) => sum + (ing.costoTotal || 0),
    0
  );

  return (
    <Box>
      {/* Botón para mostrar/ocultar formulario */}
      {!mostrarForm && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setMostrarForm(true)}
          fullWidth
          size="small"
        >
          + Agregar Ingrediente
        </Button>
      )}

      {/* Formulario para agregar ingrediente */}
      {mostrarForm && (
        <Card sx={{ mb: 2, backgroundColor: '#fafafa' }}>
          <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={1}>
              {/* Búsqueda de ingrediente */}
              <Grid item xs={12} md={7}>
                <Autocomplete
                  options={ingredientesFiltrados}
                  getOptionLabel={(option) => option.nombre}
                  value={ingredienteSeleccionado}
                  onChange={(e, value) => setIngredienteSeleccionado(value)}
                  inputValue={searchText}
                  onInputChange={(e, value) => setSearchText(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ingrediente"
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.nombre}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ${option.costoUnitarioBase?.toFixed(4)}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  noOptionsText="No hay ingredientes"
                />
              </Grid>

              {/* Cantidad */}
              <Grid item xs={6} md={2.5}>
                <TextField
                  label="Cant."
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.01, min: 0 }}
                  size="small"
                  fullWidth
                  disabled={loading || !ingredienteSeleccionado}
                />
              </Grid>

              {/* Unidad */}
              <Grid item xs={12} md={3}>
                <Autocomplete
                  options={unidades}
                  getOptionLabel={(option) => option.abreviatura}
                  value={unidadSeleccionada}
                  onChange={(e, value) => setUnidadSeleccionada(value)}
                  renderInput={(params) => <TextField {...params} label="U." size="small" />}
                  disabled={loading}
                />
              </Grid>

              {/* Merma teórica */}
              <Grid item xs={6} md={2.5}>
                <TextField
                  label="Merma %"
                  type="number"
                  value={mermaTeoria}
                  onChange={(e) => setMermaTeoria(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.1, min: 0, max: 100 }}
                  size="small"
                  fullWidth
                  disabled={loading}
                />
              </Grid>

              {/* Botones de acción */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAgregarIngrediente}
                    disabled={loading || !ingredienteSeleccionado}
                    size="small"
                  >
                    ✓ Agregar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setMostrarForm(false);
                      setIngredienteSeleccionado(null);
                      setCantidad(1);
                      setMermaTeoria(0);
                      setSearchText('');
                      setError(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabla de ingredientes añadidos */}
      {ingredientesEnReceta.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            📋 Ingredientes en Receta ({ingredientesEnReceta.length})
          </Typography>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f0f0f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Ingrediente
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Cant.
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    U.
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Merma
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    Costo
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                    X
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredientesEnReceta.map((ing, idx) => (
                  <TableRow key={idx} hover sx={{ height: '40px' }}>
                    <TableCell sx={{ fontWeight: 500, fontSize: '0.9rem', py: 0.5 }}>{ing.ingredienteNombre}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.9rem', py: 0.5 }}>{ing.cantidad.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
                      <Chip
                        label={ing.unidadAbreviatura}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.9rem', py: 0.5 }}>{(ing.mermaTeorica || 0).toFixed(1)}%</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#fff3e0',
                        color: '#e65100',
                        fontSize: '0.9rem',
                        py: 0.5
                      }}
                    >
                      ${(ing.costoTotal || 0).toFixed(2)}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onRemoverIngrediente(ing.ingredienteId)}
                        disabled={loading}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {/* Fila de totales */}
                <TableRow sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold', fontSize: '0.95rem', py: 0.75 }}>
                    💰 TOTAL:
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      color: '#d32f2f',
                      backgroundColor: '#ffebee',
                      py: 0.75
                    }}
                  >
                    ${totalCostoIngredientes.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
