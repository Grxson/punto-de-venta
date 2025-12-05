/**
 * Componente: Selector de Categorías con Subcategorías
 * Usado en el Home y otros screens para seleccionar productos
 * 
 * Muestra las categorías como tabs y las subcategorías en una vista horizontal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useCategorias } from '../hooks/useCategorias';
import { CategoriaWithSubcategorias } from '../types/categorias.types';

interface CategoriaSelectorProps {
  onSelectSubcategoria?: (subcategoriaId: number, nombre: string) => void;
  selectedSubcategoriaId?: number | null;
}

export const CategoriaSelector: React.FC<CategoriaSelectorProps> = ({
  onSelectSubcategoria,
  selectedSubcategoriaId,
}) => {
  const {
    categoriasConSubs,
    loading,
    error,
    cargarTodasConSubcategorias,
    limpiarError,
  } = useCategorias();

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<CategoriaWithSubcategorias | null>(null);

  // Cargar categorías con subcategorías al montar
  useEffect(() => {
    cargarTodasConSubcategorias();
  }, [cargarTodasConSubcategorias]);

  // Seleccionar primera categoría por defecto
  useEffect(() => {
    if (categoriasConSubs.length > 0 && !categoriaSeleccionada) {
      setCategoriaSeleccionada(categoriasConSubs[0]);
    }
  }, [categoriasConSubs, categoriaSeleccionada]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity onPress={limpiarError}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categorías (Tabs) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriasContainer}
        contentContainerStyle={styles.categoriasContent}
      >
        {categoriasConSubs.map((categoria) => (
          <TouchableOpacity
            key={categoria.id}
            style={[
              styles.categoriaTab,
              categoriaSeleccionada?.id === categoria.id &&
                styles.categoriaTabActive,
            ]}
            onPress={() => setCategoriaSeleccionada(categoria)}
          >
            <Text
              style={[
                styles.categoriaTabText,
                categoriaSeleccionada?.id === categoria.id &&
                  styles.categoriaTabTextActive,
              ]}
            >
              {categoria.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Subcategorías */}
      {categoriaSeleccionada && categoriaSeleccionada.subcategorias ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoriasContainer}
          contentContainerStyle={styles.subcategoriasContent}
        >
          {categoriaSeleccionada.subcategorias.length > 0 ? (
            categoriaSeleccionada.subcategorias.map((subcategoria) => (
              <TouchableOpacity
                key={subcategoria.id}
                style={[
                  styles.subcategoriaButton,
                  selectedSubcategoriaId === subcategoria.id &&
                    styles.subcategoriaButtonActive,
                ]}
                onPress={() => {
                  onSelectSubcategoria?.(subcategoria.id, subcategoria.nombre);
                }}
              >
                <Text
                  style={[
                    styles.subcategoriaText,
                    selectedSubcategoriaId === subcategoria.id &&
                      styles.subcategoriaTextActive,
                  ]}
                >
                  {subcategoria.nombre}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No hay subcategorías disponibles
            </Text>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffebee',
    borderBottomWidth: 1,
    borderBottomColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 13,
    flex: 1,
  },
  errorClose: {
    fontSize: 16,
    color: '#c62828',
    marginLeft: 8,
  },
  // Categorías (Tabs)
  categoriasContainer: {
    maxHeight: 50,
  },
  categoriasContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 4,
  },
  categoriaTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: 4,
  },
  categoriaTabActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  categoriaTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoriaTabTextActive: {
    color: '#fff',
  },
  // Subcategorías
  subcategoriasContainer: {
    maxHeight: 45,
  },
  subcategoriasContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  subcategoriaButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  subcategoriaButtonActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  subcategoriaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  subcategoriaTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#999',
    fontSize: 13,
    paddingHorizontal: 12,
  },
});
