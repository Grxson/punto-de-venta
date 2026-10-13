/**
 * Servicio con llamadas a la API relacionadas con usuarios.
 */

import apiService from './api.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest, CambiarRolRequest } from '../types/usuario.types';

const API_BASE = '/auth/usuarios';

export const usuariosService = {
  /**
   * Obtiene los usuarios de una sucursal.
   *
   * @param sucursalId - ID de la sucursal.
   * @param activo - `true` para activos, `false` para inactivos y `undefined`
   *   para no filtrar (devuelve todos).
   * @returns La lista de usuarios, o `[]` si la petición falla.
   */
  obtenerPorSucursal: async (sucursalId: number, activo?: boolean) => {
    try {
      const params = new URLSearchParams();
      // Solo agregar el parámetro si activo es explícitamente true o false
      if (activo === true) {
        params.append('activo', 'true');
      } else if (activo === false) {
        params.append('activo', 'false');
      }
      // Si activo es undefined, no agregamos nada (backend debe devolver todos)
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await apiService.get<Usuario[]>(`${API_BASE}/sucursal/${sucursalId}${query}`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener usuarios:', response.error || 'Unknown error');
      return [];
    } catch (error) {
      console.error('Exception al obtener usuarios:', error);
      return [];
    }
  },

  /**
   * Obtiene un usuario por su ID.
   *
   * @param id - ID del usuario.
   * @returns El usuario, o `null` si no existe o la petición falla.
   */
  obtenerPorId: async (id: number) => {
    try {
      const response = await apiService.get<Usuario>(`${API_BASE}/${id}`);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn('Error al obtener usuario:', response.error || 'Unknown error');
      return null;
    } catch (error) {
      console.error('Exception al obtener usuario:', error);
      return null;
    }
  },

  /**
   * Crea un usuario nuevo.
   *
   * @param data - Datos del usuario a crear.
   * @returns El usuario creado, o `undefined` si el backend no devuelve datos.
   */
  crear: async (data: CrearUsuarioRequest) => {
    const response = await apiService.post<Usuario>(API_BASE, data);
    return response.data;
  },

  /**
   * Actualiza un usuario existente.
   *
   * @param id - ID del usuario.
   * @param data - Campos a actualizar.
   * @returns El usuario actualizado.
   * @throws Error si la respuesta del backend indica fallo.
   */
  actualizar: async (id: number, data: EditarUsuarioRequest) => {
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}`, data);
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al actualizar usuario');
    }
    return response.data;
  },

  /**
   * Cambia el rol de un usuario.
   *
   * @param id - ID del usuario.
   * @param rolId - ID del rol a asignar.
   * @returns El usuario con el rol actualizado.
   * @throws Error si la respuesta del backend indica fallo.
   */
  cambiarRol: async (id: number, rolId: number) => {
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}/rol?rolId=${rolId}`, {});
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al cambiar rol');
    }
    return response.data;
  },

  /**
   * Desactiva (baja lógica) un usuario.
   *
   * @param id - ID del usuario.
   * @returns `undefined`; el método solo confirma el éxito.
   * @throws Error si la respuesta del backend indica fallo.
   */
  desactivar: async (id: number) => {
    const response = await apiService.delete<void>(`${API_BASE}/${id}`);
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al desactivar usuario');
    }
    return response.data;
  },

  /**
   * Reactiva un usuario previamente desactivado.
   *
   * @param id - ID del usuario.
   * @returns El usuario reactivado.
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Usuario>(`${API_BASE}/${id}/reactivar`, {});
    return response.data;
  },
};
