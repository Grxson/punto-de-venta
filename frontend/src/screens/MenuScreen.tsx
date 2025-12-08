import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useMenu } from '../hooks/useMenu';
import { CategoriaDTO, ProductoSucursalDTO } from '../types/menu';

export function MenuScreen() {
  const { categorias, productosAgrupados, agregarAlCarrito, isLoading } = useMenu();
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const productosFiltrados = selectedCategoria
    ? productosAgrupados.get(selectedCategoria) || []
    : Array.from(productosAgrupados.values()).flat();

  const renderCategoria = ({ item }: { item: CategoriaDTO }) => (
    <TouchableOpacity
      style={[
        styles.categoriaTab,
        selectedCategoria === item.id && styles.categoriaTabActive,
      ]}
      onPress={() => setSelectedCategoria(item.id)}
    >
      <Text style={styles.categoriaIcon}>{item.icono}</Text>
      <Text
        style={[
          styles.categoriaText,
          selectedCategoria === item.id && styles.categoriaTextActive,
        ]}
      >
        {item.nombre}
      </Text>
    </TouchableOpacity>
  );

  const renderProducto = ({ item }: { item: ProductoSucursalDTO }) => (
    <View style={styles.productoCard}>
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{item.nombre}</Text>
        {item.descripcion && (
          <Text style={styles.productoDescripcion} numberOfLines={1}>
            {item.descripcion}
          </Text>
        )}
        <Text style={styles.productoPrecio}>${item.precio_sucursal.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.agregarButton}
        onPress={() => agregarAlCarrito(item, 1)}
      >
        <Text style={styles.agregarButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriasScroll}>
        {categorias.map((cat) => (
          <React.Fragment key={cat.id}>
            {renderCategoria({ item: cat })}
          </React.Fragment>
        ))}
      </ScrollView>

      <FlatList
        data={productosFiltrados}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productosGrid}
        style={styles.productosList}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriasScroll: {
    maxHeight: 100,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  categoriaTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  categoriaTabActive: {
    backgroundColor: '#f0f0f0',
  },
  categoriaIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoriaText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  categoriaTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  productosList: {
    flex: 1,
    padding: 8,
  },
  productosGrid: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productoCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  productoInfo: {
    flex: 1,
    marginRight: 8,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  agregarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  agregarButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
