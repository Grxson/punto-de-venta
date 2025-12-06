/**
 * Servicio para API calls relacionados con usuarios
 */

import apiService from './api.service';
import type { Usuario, CrearUsuarioRequest, EditarUsuarioRequest, CambiarRolRequest } from '../types/usuario.types';

const API_BASE = '/auth/usuarios';

export const usuariosService = {
  /**
   * Obtener todos los usuarios de una sucursal
   * @param sucursalId - ID de la sucursal
   * @param activo - true=activos, false=inactivos, undefined=todos (sin filtro)
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
      console.log(`📤 obtenerPorSucursal: GET /auth/usuarios/sucursal/${sucursalId}${query}`);
      const response = await apiService.get<Usuario[]>(`${API_BASE}/sucursal/${sucursalId}${query}`);
      if (response.success && response.data) {
        console.log(`✅ Usuarios obtenidos: ${response.data.length}`);
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
   * Obtener un usuario por ID
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
   * Crear nuevo usuario
   */
  crear: async (data: CrearUsuarioRequest) => {
    console.log('🔵 usuariosService.crear() - Datos:', data);
    const response = await apiService.post<Usuario>(API_BASE, data);
    console.log('🔴 usuariosService.crear() - Respuesta:', response);
    return response.data;
  },

  /**
   * Actualizar usuario
   */
  actualizar: async (id: number, data: EditarUsuarioRequest) => {
    console.log('🔵 usuariosService.actualizar() - ID:', id, 'Datos:', data);
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}`, data);
    console.log('🔴 usuariosService.actualizar() - Respuesta:', response);
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al actualizar usuario');
    }
    return response.data;
  },

  /**
   * Cambiar rol de un usuario
   */
  cambiarRol: async (id: number, rolId: number) => {
    console.log('🔵 usuariosService.cambiarRol() - ID:', id, 'RolId:', rolId);
    const response = await apiService.put<Usuario>(`${API_BASE}/${id}/rol?rolId=${rolId}`, {});
    console.log('🔴 usuariosService.cambiarRol() - Respuesta:', response);
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al cambiar rol');
    }
    return response.data;
  },

  /**
   * Desactivar usuario
   */
  desactivar: async (id: number) => {
    console.log('🔵 usuariosService.desactivar() - ID:', id);
    const response = await apiService.delete<void>(`${API_BASE}/${id}`);
    console.log('🔴 usuariosService.desactivar() - Respuesta:', response);
    if (!response.success) {
      console.error('❌ Error en respuesta:', response.error);
      throw new Error(response.error || 'Error al desactivar usuario');
    }
    return response.data;
  },

  /**
   * Reactivar usuario
   */
  reactivar: async (id: number) => {
    const response = await apiService.post<Usuario>(`${API_BASE}/${id}/reactivar`, {});
    return response.data;
  },
};
