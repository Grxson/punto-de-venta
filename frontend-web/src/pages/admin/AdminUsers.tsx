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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useUsuarios, useCrearUsuario, useActualizarUsuario, useCambiarRol, useDesactivarUsuario } from '../../hooks/useUsuarios';
import { useRoles } from '../../hooks/useRoles';
import { useSucursales } from '../../hooks/useSucursales';
import { UsuarioForm } from '../../components/admin/UsuarioForm';
import { UsuariosTable } from '../../components/admin/UsuariosTable';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../../types/usuario.types';

export const AdminUsers = () => {
  const [sucursalId, setSucursalId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | undefined>();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  // Obtener sucursal actual del localStorage o contexto
  // Por ahora usamos la primera sucursal disponible
  const { data: sucursales } = useSucursales();

  useEffect(() => {
    if (sucursales && sucursales.length > 0 && !sucursalId) {
      setSucursalId(sucursales[0].id);
    }
  }, [sucursales, sucursalId]);

  const { data: usuarios = [], isLoading: usuariosLoading } = useUsuarios(sucursalId || 0);
  const { data: roles = [] } = useRoles();

  const crearMutation = useCrearUsuario();
  const actualizarMutation = useActualizarUsuario();
  const cambiarRolMutation = useCambiarRol();
  const desactivarMutation = useDesactivarUsuario();

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
