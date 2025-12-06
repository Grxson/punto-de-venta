import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../services/api/axiosInstance';
import { UsuarioDTO } from '../types/auth';

interface UsuarioConRol extends UsuarioDTO {
  rolNombre?: string;
}

export function AdminUsuariosScreen() {
  const { sucursal, isAdmin } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioConRol | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, [sucursal]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      // Validar que sucursal tenga un ID válido
      if (sucursal && sucursal.id && sucursal.id > 0) {
        const response = await apiClient.get<UsuarioConRol[]>(
          `/auth/usuarios/sucursal/${sucursal.id}`
        );
        setUsuarios(response.data || []);
      } else {
        console.warn('Sucursal inválida:', sucursal);
        setUsuarios([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await apiClient.get<{ id: number; nombre: string }[]>('/roles');
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  const handleSeleccionarUsuario = (usuario: UsuarioConRol) => {
    setSelectedUsuario(usuario);
    setModalVisible(true);
  };

  const handleCambiarRol = async (rolId: number) => {
    if (!selectedUsuario) return;

    try {
      // Encontrar el nombre del rol
      const rol = roles.find((r) => r.id === rolId);
      const rolNombre = rol?.nombre || '';

      await apiClient.put(
        `/auth/usuarios/${selectedUsuario.id}/rol`,
        { rolId, rolNombre }
      );

      // Actualizar la lista local
      setUsuarios(usuarios.map((u) =>
        u.id === selectedUsuario.id
          ? { ...u, rol: rolNombre as any }
          : u
      ));

      setModalVisible(false);
      Alert.alert('Éxito', 'Rol actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar rol:', error);
      Alert.alert('Error', 'No se pudo cambiar el rol del usuario');
    }
  };

  const getRolColor = (rol?: string) => {
    switch (rol?.toUpperCase()) {
      case 'ADMIN':
        return '#5856D6';
      case 'GERENTE':
        return '#FF9500';
      case 'VENDEDOR':
        return '#34C759';
      case 'USUARIO':
        return '#007AFF';
      default:
        return '#999';
    }
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tienes permisos para acceder a esta sección</Text>
      </View>
    );
  }

  // Esperar a que sucursal sea válido
  if (!sucursal || !sucursal.id || sucursal.id <= 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.emptyText}>Cargando sucursal...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <Text style={styles.subtitle}>
          {sucursal?.nombre} • {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {usuarios.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay usuarios en esta sucursal</Text>
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.usuarioCard}
              onPress={() => handleSeleccionarUsuario(item)}
            >
              <View style={styles.usuarioInfo}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {item.nombre.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.usuarioDetails}>
                  <Text style={styles.usuarioNombre}>{item.nombre}</Text>
                  <Text style={styles.usuarioEmail}>{item.email}</Text>
                  <View style={[
                    styles.rolBadge,
                    { backgroundColor: getRolColor(item.rol) }
                  ]}>
                    <Text style={styles.rolText}>{item.rol}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.touchHint}>→</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={true}
        />
      )}

      {/* Modal de selección de rol */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Rol</Text>
            <Text style={styles.modalSubtitle}>{selectedUsuario?.nombre}</Text>

            <ScrollView style={styles.rolesContainer}>
              {roles.map((rol) => (
                <TouchableOpacity
                  key={rol.id}
                  style={[
                    styles.rolOption,
                    selectedUsuario?.rol === rol.nombre && styles.rolOptionSelected,
                  ]}
                  onPress={() => handleCambiarRol(rol.id)}
                >
                  <View
                    style={[
                      styles.rolOptionDot,
                      { backgroundColor: getRolColor(rol.nombre) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.rolOptionText,
                      selectedUsuario?.rol === rol.nombre && styles.rolOptionTextSelected,
                    ]}
                  >
                    {rol.nombre}
                  </Text>
                  {selectedUsuario?.rol === rol.nombre && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  usuarioCard: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usuarioInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  usuarioDetails: {
    flex: 1,
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  usuarioEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  rolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  rolText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  touchHint: {
    fontSize: 20,
    color: '#999',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rolesContainer: {
    marginBottom: 16,
  },
  rolOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rolOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  rolOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  rolOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  rolOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
