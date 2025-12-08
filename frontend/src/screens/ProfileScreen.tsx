import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { UserRole, SucursalDTO } from '../types/auth';
import { apiClient } from '../services/api/axiosInstance';

function getRolStyle(rol?: UserRole): any {
  const roleStyles: Record<UserRole, any> = {
    ADMIN: styles.rolADMIN,
    GERENTE: styles.rolGERENTE,
    VENDEDOR: styles.rolVENDEDOR,
    USUARIO: styles.rolUSUARIO,
  };
  return rol ? roleStyles[rol] : styles.rolUSUARIO;
}

export function ProfileScreen() {
  const { user, sucursal, logout, isAdmin, changeSucursal } = useAuth();
  const [sucursales, setSucursales] = useState<SucursalDTO[]>([]);
  const [showSucursalModal, setShowSucursalModal] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  useEffect(() => {
    const cargarSucursales = async () => {
      if (isAdmin) {
        try {
          setLoadingSucursales(true);
          const response = await apiClient.get<SucursalDTO[]>('/api/sucursales');
          setSucursales(response.data || []);
        } catch (error) {
          console.error('Error al cargar sucursales:', error);
        } finally {
          setLoadingSucursales(false);
        }
      }
    };

    cargarSucursales();
  }, [isAdmin]);

  const handleSelectSucursal = async (nuevaSucursal: SucursalDTO) => {
    await changeSucursal(nuevaSucursal);
    setShowSucursalModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.nombre.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nombre}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Cuenta</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sucursal:</Text>
          {isAdmin && sucursales.length > 0 ? (
            <TouchableOpacity onPress={() => setShowSucursalModal(true)}>
              <Text style={[styles.infoValue, { color: '#007AFF' }]}>
                {sucursal?.nombre} ▼
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoValue}>{sucursal?.nombre}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rol:</Text>
          <View style={[styles.rolBadge, getRolStyle(user?.rol)]}>
            <Text style={styles.rolText}>{user?.rol}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        {isAdmin && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Permisos:</Text>
            <Text style={styles.infoValue}>
              {user?.permisos?.join(', ') || 'Sin permisos específicos'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Cambiar Contraseña</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Panel de Admin</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showSucursalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSucursalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cambiar Sucursal</Text>
            
            {loadingSucursales ? (
              <ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 20 }} />
            ) : (
              <>
                {sucursales.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.sucursalOption,
                      sucursal?.id === s.id && styles.sucursalOptionSelected,
                    ]}
                    onPress={() => handleSelectSucursal(s)}
                  >
                    <Text
                      style={[
                        styles.sucursalOptionText,
                        sucursal?.id === s.id && styles.sucursalOptionTextSelected,
                      ]}
                    >
                      {s.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => setShowSucursalModal(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    alignItems: 'center',
    paddingTop: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rolADMIN: {
    backgroundColor: '#5856D6',
  },
  rolGERENTE: {
    backgroundColor: '#FF9500',
  },
  rolVENDEDOR: {
    backgroundColor: '#34C759',
  },
  rolUSUARIO: {
    backgroundColor: '#007AFF',
  },
  rolText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionSection: {
    padding: 8,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  sucursalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sucursalOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  sucursalOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sucursalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
});
