/**
 * Componente Admin: Gestión de Categorías y Subcategorías
 * Proporciona interfaz CRUD completa para administrar el menú
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useCategorias } from '../hooks/useCategorias';
import { Categoria, Subcategoria } from '../types/categorias.types';

interface AdminCategoriasProps {
  onClose?: () => void;
}

export const AdminCategorias: React.FC<AdminCategoriasProps> = ({
  onClose,
}) => {
  const {
    categorias,
    subcategorias,
    loading,
    error,
    cargarCategorias,
    cargarSubcategorias,
    crearSubcategoria,
    actualizarSubcategoria,
    eliminarSubcategoria,
    limpiarError,
  } = useCategorias();

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'crear' | 'editar'>('crear');
  const [subcategoriaEditando, setSubcategoriaEditando] =
    useState<Subcategoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: '0',
  });

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  // Cargar subcategorías cuando selecciona categoría
  useEffect(() => {
    if (categoriaSeleccionada) {
      cargarSubcategorias(categoriaSeleccionada.id);
    }
  }, [categoriaSeleccionada, cargarSubcategorias]);

  const handleSelectCategoria = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
  };

  const handleOpenModalCrear = () => {
    setModalType('crear');
    setSubcategoriaEditando(null);
    setFormData({ nombre: '', descripcion: '', orden: '0' });
    setModalVisible(true);
  };

  const handleOpenModalEditar = (subcategoria: Subcategoria) => {
    setModalType('editar');
    setSubcategoriaEditando(subcategoria);
    setFormData({
      nombre: subcategoria.nombre,
      descripcion: subcategoria.descripcion || '',
      orden: subcategoria.orden.toString(),
    });
    setModalVisible(true);
  };

  const handleGuardar = async () => {
    if (!categoriaSeleccionada) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    try {
      if (modalType === 'crear') {
        await crearSubcategoria(categoriaSeleccionada.id, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          orden: parseInt(formData.orden) || 0,
          activa: true,
        });
        Alert.alert('✅ Éxito', 'Subcategoría creada');
      } else if (subcategoriaEditando) {
        await actualizarSubcategoria(
          categoriaSeleccionada.id,
          subcategoriaEditando.id,
          {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            orden: parseInt(formData.orden) || 0,
            activa: true,
          }
        );
        Alert.alert('✅ Éxito', 'Subcategoría actualizada');
      }
      setModalVisible(false);
      setFormData({ nombre: '', descripcion: '', orden: '0' });
    } catch (err) {
      Alert.alert('❌ Error', error || 'Error al guardar');
    }
  };

  const handleEliminar = (subcategoria: Subcategoria) => {
    if (!categoriaSeleccionada) return;

    Alert.alert(
      '⚠️ Confirmar eliminación',
      `¿Eliminar "${subcategoria.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await eliminarSubcategoria(
                categoriaSeleccionada.id,
                subcategoria.id
              );
              Alert.alert('✅ Éxito', 'Subcategoría eliminada');
            } catch (err) {
              Alert.alert('❌ Error', error || 'Error al eliminar');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderSubcategoriaItem = (item: Subcategoria) => (
    <View style={styles.subcategoriaItem}>
      <View style={styles.subcategoriaInfo}>
        <Text style={styles.subcategoriaNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.subcategoriaDescripcion}>{item.descripcion}</Text>
        )}
        <Text style={styles.subcategoriaOrden}>Orden: {item.orden}</Text>
      </View>
      <View style={styles.subcategoriaActions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnEditar]}
          onPress={() => handleOpenModalEditar(item)}
        >
          <Text style={styles.btnText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnEliminar]}
          onPress={() => handleEliminar(item)}
        >
          <Text style={styles.btnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoriaItem = (item: Categoria) => (
    <TouchableOpacity
      style={[
        styles.categoriaItem,
        categoriaSeleccionada?.id === item.id &&
          styles.categoriaItemSelected,
      ]}
      onPress={() => handleSelectCategoria(item)}
    >
      <Text
        style={[
          styles.categoriaNombre,
          categoriaSeleccionada?.id === item.id &&
            styles.categoriaNombreSelected,
        ]}
      >
        {item.nombre}
      </Text>
    </TouchableOpacity>
  );

  if (loading && categorias.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Gestión de Categorías</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity onPress={limpiarError}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        {/* Lista de Categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <FlatList
            data={categorias}
            renderItem={({ item }) => renderCategoriaItem(item)}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            nestedScrollEnabled={false}
          />
        </View>

        {/* Subcategorías */}
        {categoriaSeleccionada && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Subcategorías de {categoriaSeleccionada.nombre}
              </Text>
              <TouchableOpacity
                style={styles.btnAgregar}
                onPress={handleOpenModalCrear}
              >
                <Text style={styles.btnAgregarText}>➕ Agregar</Text>
              </TouchableOpacity>
            </View>

            {subcategorias.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay subcategorías en esta categoría
              </Text>
            ) : (
              <FlatList
                data={subcategorias}
                renderItem={({ item }) => renderSubcategoriaItem(item)}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal para crear/editar */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'crear'
                  ? 'Nueva Subcategoría'
                  : 'Editar Subcategoría'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: DULCES"
                  value={formData.nombre}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nombre: text })
                  }
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Ej: Postres y alimentos dulces"
                  value={formData.descripcion}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descripcion: text })
                  }
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Orden</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={formData.orden}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      orden: text.replace(/[^0-9]/g, ''),
                    })
                  }
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancelar]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnGuardar]}
                  onPress={handleGuardar}
                >
                  <Text style={styles.btnText}>✅ Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#666',
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
  },
  errorClose: {
    fontSize: 18,
    color: '#c62828',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoriaItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  categoriaItemSelected: {
    backgroundColor: '#e3f2fd',
    borderLeftColor: '#0066cc',
  },
  categoriaNombre: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoriaNombreSelected: {
    color: '#0066cc',
    fontWeight: '600',
  },
  subcategoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  subcategoriaInfo: {
    flex: 1,
  },
  subcategoriaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subcategoriaDescripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  subcategoriaOrden: {
    fontSize: 11,
    color: '#999',
  },
  subcategoriaActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  btnEditar: {
    backgroundColor: '#2196f3',
  },
  btnEliminar: {
    backgroundColor: '#f44336',
  },
  btnAgregar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4caf50',
    borderRadius: 6,
  },
  btnAgregarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalForm: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  btnGuardar: {
    flex: 1,
    backgroundColor: '#4caf50',
  },
});
