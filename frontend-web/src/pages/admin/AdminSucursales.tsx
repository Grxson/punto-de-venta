import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useSucursalesConInactivas } from '../../hooks/useSucursales';

/** Filtro de estado aplicable al listado. */
type EstadoFiltro = 'todas' | 'activas' | 'inactivas';

/**
 * Demostración vertical mínima del listado de sucursales.
 *
 * Reutiliza los hooks de datos existentes (`useSucursalesConInactivas`), por lo
 * que funciona igual en modo mock (`dev:mock`) y contra el backend real
 * (`dev:api`) sin ramas de código específicas. Solo implementa lectura, búsqueda
 * y filtro: la gestión completa es una tarea posterior del colaborador.
 */
export default function AdminSucursales() {
  const { data, isLoading, isError, error } = useSucursalesConInactivas();
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState<EstadoFiltro>('todas');

  const sucursales = useMemo(() => data ?? [], [data]);

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return sucursales.filter((sucursal) => {
      const coincideEstado =
        estado === 'todas' ||
        (estado === 'activas' && sucursal.activo) ||
        (estado === 'inactivas' && !sucursal.activo);
      const coincideTexto =
        termino.length === 0 ||
        sucursal.nombre.toLowerCase().includes(termino) ||
        (sucursal.direccion ?? '').toLowerCase().includes(termino);
      return coincideEstado && coincideTexto;
    });
  }, [sucursales, busqueda, estado]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sucursales
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Listado de sucursales del negocio (demostración de desarrollo).
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Buscar por nombre o dirección"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          size="small"
          fullWidth
        />
        <ToggleButtonGroup
          value={estado}
          exclusive
          onChange={(_, nuevo) => nuevo && setEstado(nuevo)}
          size="small"
        >
          <ToggleButton value="todas">Todas</ToggleButton>
          <ToggleButton value="activas">Activas</ToggleButton>
          <ToggleButton value="inactivas">Inactivas</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {isLoading && (
        <Box display="flex" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          No se pudieron cargar las sucursales: {(error as Error)?.message ?? 'error desconocido'}
        </Alert>
      )}

      {!isLoading && !isError && filtradas.length === 0 && (
        <Alert severity="info">No hay sucursales que coincidan con el filtro.</Alert>
      )}

      {!isLoading && !isError && filtradas.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Dirección</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map((sucursal) => (
                <TableRow key={sucursal.id} hover>
                  <TableCell>{sucursal.nombre}</TableCell>
                  <TableCell>{sucursal.direccion}</TableCell>
                  <TableCell>{sucursal.telefono ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={sucursal.activo ? 'Activa' : 'Inactiva'}
                      color={sucursal.activo ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
