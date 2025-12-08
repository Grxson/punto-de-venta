/**
 * Página de administración de usuarios
 * CRUD completo para gestión de usuarios y asignación de roles
 */

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Container,
  Paper,
  Typography,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../contexts/AuthContext';
import { useUsuarios, useCrearUsuario, useActualizarUsuario, useCambiarRol, useDesactivarUsuario } from '../../hooks/useUsuarios';
import { useRoles } from '../../hooks/useRoles';
import { useSucursales } from '../../hooks/useSucursales';
import { UsuarioForm } from '../../components/admin/UsuarioForm';
import { UsuariosTable } from '../../components/admin/UsuariosTable';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../../types/usuario.types';

export const AdminUsers = () => {
  const { sucursal: sucursalDelUsuario } = useAuth();
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined); // undefined = mostrar todos
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | undefined>();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  // Obtener sucursal actual del contexto de autenticación
  useEffect(() => {
    if (sucursalDelUsuario?.id && sucursalDelUsuario.id > 0) {
      console.log(`📍 AdminUsers: Usando sucursal del usuario: ${sucursalDelUsuario.id}`);
      setSucursalId(sucursalDelUsuario.id);
    }
  }, [sucursalDelUsuario]);

  // Solo cargar usuarios si sucursalId es válido (mayor a 0)
  const queryActivos = useUsuarios(
    sucursalId && sucursalId > 0 ? sucursalId : 0, 
    sucursalId && sucursalId > 0 && filtroActivo !== undefined ? filtroActivo : undefined
  );
  
  // Si filtroActivo es undefined (mostrar todos), necesitamos combinar activos + inactivos
  const queryInactivos = useUsuarios(
    sucursalId && sucursalId > 0 && filtroActivo === undefined ? sucursalId : 0,
    sucursalId && sucursalId > 0 && filtroActivo === undefined ? false : undefined
  );

  // Combinar usuarios según el filtro
  let usuarios: Usuario[] = [];
  let usuariosLoading = false;

  if (filtroActivo === undefined) {
    // Mostrar todos: combinar activos + inactivos
    usuarios = [...(queryActivos.data || []), ...(queryInactivos.data || [])];
    usuariosLoading = queryActivos.isLoading || queryInactivos.isLoading;
  } else {
    // Filtro específico
    usuarios = queryActivos.data || [];
    usuariosLoading = queryActivos.isLoading;
  }

  const { data: roles = [] } = useRoles();

  const crearMutation = useCrearUsuario(sucursalId || undefined);
  const actualizarMutation = useActualizarUsuario(sucursalId || undefined);
  const cambiarRolMutation = useCambiarRol(sucursalId || undefined);
  const desactivarMutation = useDesactivarUsuario(sucursalId || undefined);

  const handleAbrirForm = (usuario?: Usuario) => {
    setSelectedUsuario(usuario);
    setFormOpen(true);
  };

  const handleCerrarForm = () => {
    setFormOpen(false);
    setSelectedUsuario(undefined);
  };

  const handleGuardarUsuario = async (data: CrearUsuarioRequest | EditarUsuarioRequest) => {
    try {
      if (selectedUsuario) {
        // Actualizar usuario
        await actualizarMutation.mutateAsync({
          id: selectedUsuario.id,
          data: data as EditarUsuarioRequest,
        });
        setSnackbar({
          open: true,
          message: 'Usuario actualizado correctamente',
          severity: 'success',
        });
      } else {
        // Crear usuario
        await crearMutation.mutateAsync(data as CrearUsuarioRequest);
        setSnackbar({
          open: true,
          message: 'Usuario creado correctamente',
          severity: 'success',
        });
      }
      handleCerrarForm();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el usuario',
        severity: 'error',
      });
    }
  };

  const handleAbrirConfirmDelete = (usuarioId: number) => {
    setUsuarioToDelete(usuarioId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (usuarioToDelete) {
      try {
        await desactivarMutation.mutateAsync(usuarioToDelete);
        setSnackbar({
          open: true,
          message: 'Usuario desactivado correctamente',
          severity: 'success',
        });
      } catch (error) {
        console.error('Error al desactivar usuario:', error);
        setSnackbar({
          open: true,
          message: 'Error al desactivar el usuario',
          severity: 'error',
        });
      }
    }
    setConfirmDeleteOpen(false);
    setUsuarioToDelete(null);
  };

  const handleCambiarRol = async (usuarioId: number, rolId: number) => {
    try {
      await cambiarRolMutation.mutateAsync({ id: usuarioId, rolId });
      setSnackbar({
        open: true,
        message: 'Rol asignado correctamente',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      setSnackbar({
        open: true,
        message: 'Error al cambiar el rol',
        severity: 'error',
      });
    }
  };

  const isLoading =
    usuariosLoading ||
    crearMutation.isPending ||
    actualizarMutation.isPending ||
    cambiarRolMutation.isPending ||
    desactivarMutation.isPending;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Gestión de Usuarios
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Administra usuarios, asigna roles y gestiona permisos
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAbrirForm()}
            disabled={isLoading}
          >
            Nuevo Usuario
          </Button>
        </Stack>

        {/* Filtros */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtroActivo === undefined ? 'todos' : filtroActivo ? 'activos' : 'inactivos'}
              label="Estado"
              onChange={(e) => {
                const valor = e.target.value;
                if (valor === 'todos') {
                  setFiltroActivo(undefined);
                } else if (valor === 'activos') {
                  setFiltroActivo(true);
                } else {
                  setFiltroActivo(false);
                }
              }}
            >
              <MenuItem value="todos">Todos los usuarios</MenuItem>
              <MenuItem value="activos">Solo activos</MenuItem>
              <MenuItem value="inactivos">Solo inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Tabla de usuarios */}
        <Box sx={{ mt: 4 }}>
          <UsuariosTable
            usuarios={usuarios}
            roles={roles}
            isLoading={usuariosLoading}
            onEdit={handleAbrirForm}
            onDelete={handleAbrirConfirmDelete}
            onChangeRole={handleCambiarRol}
          />
        </Box>
      </Paper>

      {/* Formulario de usuario */}
      <UsuarioForm
        open={formOpen}
        usuario={selectedUsuario}
        sucursalActual={sucursalId || undefined}
        onClose={handleCerrarForm}
        onSubmit={handleGuardarUsuario}
        isLoading={crearMutation.isPending || actualizarMutation.isPending}
        error={crearMutation.error?.message || actualizarMutation.error?.message || null}
      />

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirmar desactivación</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 2 }}>
            ¿Está seguro de que desea desactivar este usuario? Será removido de las operaciones pero
            podrá reactivarlo posteriormente.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={desactivarMutation.isPending}
          >
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
