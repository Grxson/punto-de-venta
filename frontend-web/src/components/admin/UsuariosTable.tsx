/**
 * Tabla para listar usuarios
 */

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  CircularProgress,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState, useMemo } from 'react';
import type { Usuario } from '../../types/usuario.types';
import type { Rol } from '../../types/rol.types';

interface UsuariosTableProps {
  usuarios?: Usuario[];
  roles?: Rol[];
  isLoading?: boolean;
  onEdit: (usuario: Usuario) => void;
  onDelete: (usuarioId: number) => void;
  onChangeRole: (usuarioId: number, rolId: number) => void;
}

export const UsuariosTable = ({
  usuarios = [],
  roles = [],
  isLoading = false,
  onEdit,
  onDelete,
  onChangeRole,
}: UsuariosTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState<number | ''>('');
  const [filterActivo, setFilterActivo] = useState<boolean | ''>('');

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchSearch =
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRol = filterRol === '' || usuario.rol?.id === filterRol;
      const matchActivo = filterActivo === '' || usuario.activo === filterActivo;

      return matchSearch && matchRol && matchActivo;
    });
  }, [usuarios, searchTerm, filterRol, filterActivo]);

  // Paginar
  const paginatedUsuarios = filteredUsuarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Filtros */}
      <Stack spacing={2} sx={{ mb: 3 }} direction="row" useFlexGap flexWrap="wrap">
        <TextField
          placeholder="Buscar usuario..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ minWidth: 250 }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            value={filterRol === '' ? '' : String(filterRol)}
            onChange={(e) => {
              const value = e.target.value;
              setFilterRol(value === '' ? '' : Number(value));
              setPage(0);
            }}
            label="Rol"
          >
            <MenuItem value="">Todos los roles</MenuItem>
            {Array.isArray(roles) && roles.map((rol) => (
              <MenuItem key={rol.id} value={String(rol.id)}>
                {rol.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterActivo}
            onChange={(e) => {
              const value = e.target.value;
              setFilterActivo(value === '' ? '' : value === 'true');
              setPage(0);
            }}
            label="Estado"
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="true">Activos</MenuItem>
            <MenuItem value="false">Inactivos</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Tabla */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  No hay usuarios para mostrar
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsuarios.map((usuario) => (
                <TableRow key={usuario.id} hover>
                  <TableCell>
                    {usuario.nombre} {usuario.apellido}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.username}</TableCell>
                  <TableCell>
                    {usuario.rol ? (
                      <Select
                        value={usuario.rol.id || ''}
                        onChange={(e) => onChangeRole(usuario.id, Number(e.target.value))}
                        size="small"
                        variant="standard"
                        sx={{ minWidth: 120 }}
                      >
                        {Array.isArray(roles) && roles.map((rol) => (
                          <MenuItem key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <Chip label="Sin asignar" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.activo ? 'Activo' : 'Inactivo'}
                      color={usuario.activo ? 'success' : 'error'}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(usuario)}
                      title="Editar usuario"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(usuario.id)}
                      title="Eliminar usuario"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsuarios.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      </TableContainer>
    </Box>
  );
};
