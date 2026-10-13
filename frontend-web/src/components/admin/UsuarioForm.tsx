/**
 * Formulario de alta y edición de usuarios.
 * Se muestra dentro de un diálogo y delega el guardado en `onSubmit`.
 */

import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useRoles } from '../../hooks/useRoles';
import { useSucursales } from '../../hooks/useSucursales';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest } from '../../types/usuario.types';

interface UsuarioFormProps {
  /** Controla la visibilidad del diálogo. */
  open: boolean;
  /** Usuario a editar; si se omite, el formulario funciona en modo creación. */
  usuario?: Usuario;
  /** Sucursal preseleccionada al crear un usuario nuevo. */
  sucursalActual?: number;
  /** Cierra el diálogo sin guardar. */
  onClose: () => void;
  /** Persiste los datos del formulario; lo resuelve el componente padre. */
  onSubmit: (data: CrearUsuarioRequest | EditarUsuarioRequest) => Promise<void>;
  /** Indica que el guardado está en curso para deshabilitar los campos. */
  isLoading?: boolean;
  /** Mensaje de error a mostrar sobre el formulario. */
  error?: string | null;
}

/** Datos del formulario, con rol y sucursal manejados como texto para los selects. */
interface UsuarioFormData extends Omit<CrearUsuarioRequest, 'rolId' | 'sucursalId'> {
  rolId: string;
  sucursalId: string;
}

/**
 * Diálogo con el formulario de usuario.
 * Valida los campos, carga los catálogos de roles y sucursales, y en edición
 * omite la contraseña cuando el campo queda vacío.
 *
 * @param props - Propiedades descritas en {@link UsuarioFormProps}.
 */
export const UsuarioForm = ({
  open,
  usuario,
  sucursalActual,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}: UsuarioFormProps) => {
  const { data: roles = [] } = useRoles();
  const { data: sucursales = [] } = useSucursales();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      username: '',
      password: '',
      rolId: '',
      sucursalId: '',
    },
  });

  const isEditing = !!usuario;
  const passwordValue = watch('password');

  // Reset form cuando se abre/cierra o cambia el usuario
  useEffect(() => {
    if (open) {
      if (usuario) {
        reset({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          username: usuario.username,
          password: '',
          rolId: usuario.rol?.id ? String(usuario.rol.id) : '',
          sucursalId: usuario.sucursal?.id
            ? String(usuario.sucursal.id)
            : sucursalActual
              ? String(sucursalActual)
              : '',
        });
      } else {
        reset({
          nombre: '',
          apellido: '',
          email: '',
          username: '',
          password: '',
          rolId: '',
          sucursalId: sucursalActual ? String(sucursalActual) : '',
        });
      }
    }
  }, [open, usuario, reset, sucursalActual]);

  const handleFormSubmit = async (data: UsuarioFormData) => {
    try {
      // Validar que rolId y sucursalId son números válidos
      const rolId = Number(data.rolId);
      const sucursalId = Number(data.sucursalId);


      if (!rolId || isNaN(rolId) || rolId <= 0) {
        console.error('❌ Rol inválido:', data.rolId);
        return;
      }
      if (!sucursalId || isNaN(sucursalId) || sucursalId <= 0) {
        console.error('❌ Sucursal inválida:', data.sucursalId);
        return;
      }

      const submitData: CrearUsuarioRequest | EditarUsuarioRequest = {
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        username: data.username,
        rolId,
        sucursalId,
      };

      // Solo incluir password si no está vacío
      if (data.password && data.password.trim().length > 0) {
        submitData.password = data.password;
      }


      await onSubmit(submitData);
      handleClose();
    } catch (err) {
      // Error manejado por el componente padre
      console.error('Error al guardar usuario:', err);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLoadingData = isLoading;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nombre */}
          <Controller
            name="nombre"
            control={control}
            rules={{ required: 'El nombre es requerido' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                disabled={isLoadingData}
              />
            )}
          />

          {/* Apellido */}
          <Controller
            name="apellido"
            control={control}
            rules={{ required: 'El apellido es requerido' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido"
                fullWidth
                error={!!errors.apellido}
                helperText={errors.apellido?.message}
                disabled={isLoadingData}
              />
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'El email es requerido',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoadingData}
              />
            )}
          />

          {/* Username */}
          <Controller
            name="username"
            control={control}
            rules={{
              required: 'El nombre de usuario es requerido',
              minLength: {
                value: 3,
                message: 'Mínimo 3 caracteres',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre de Usuario"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
                disabled={isLoadingData}
              />
            )}
          />

          {/* Password - Requerido solo si es nuevo usuario */}
          <Controller
            name="password"
            control={control}
            rules={{
              required: isEditing ? false : 'La contraseña es requerida',
              minLength:
                isEditing && !passwordValue
                  ? undefined
                  : {
                    value: 8,
                    message: 'Mínimo 8 caracteres',
                  },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={isEditing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoadingData}
              />
            )}
          />

          {/* Rol */}
          <FormControl fullWidth error={!!errors.rolId} disabled={isLoadingData || roles.length === 0}>
            <InputLabel>Rol</InputLabel>
            <Controller
              name="rolId"
              control={control}
              rules={{
                required: 'El rol es requerido',
                validate: (value) => (value && Number(value) > 0) || 'Selecciona un rol válido'
              }}
              render={({ field }) => (
                <Select {...field} label="Rol">
                  <MenuItem value="">Seleccionar rol...</MenuItem>
                  {roles.map((rol) => (
                    <MenuItem key={rol.id} value={String(rol.id)}>
                      {rol.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.rolId && <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>{String(errors.rolId.message)}</span>}
          </FormControl>

          {/* Sucursal */}
          <FormControl fullWidth error={!!errors.sucursalId} disabled={isLoadingData || sucursales.length === 0}>
            <InputLabel>Sucursal</InputLabel>
            <Controller
              name="sucursalId"
              control={control}
              rules={{
                required: 'La sucursal es requerida',
                validate: (value) => (value && Number(value) > 0) || 'Selecciona una sucursal válida'
              }}
              render={({ field }) => (
                <Select {...field} label="Sucursal">
                  <MenuItem value="">Seleccionar sucursal...</MenuItem>
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id} value={String(sucursal.id)}>
                      {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.sucursalId && <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>{String(errors.sucursalId.message)}</span>}
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pt: 2 }}>
        <Button onClick={handleClose} disabled={isLoadingData}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          disabled={isLoadingData}
          startIcon={isLoadingData && <CircularProgress size={20} />}
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
