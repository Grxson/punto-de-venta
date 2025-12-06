import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useMenu } from '../hooks/useMenu';
import { CarritoItem } from '../types/menu';

export function CarritoScreen() {
  const { carrito, actualizarCantidad, totalCarrito, cantidadCarrito, limpiarCarrito } =
    useMenu();

  const renderCarritoItem = ({ item }: { item: CarritoItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemNombre}>{item.producto.nombre}</Text>
        <Text style={styles.itemPrecio}>${item.precioUnitario.toFixed(2)}</Text>
      </View>

      <View style={styles.cantidadContainer}>
        <TouchableOpacity
          style={styles.btnCantidad}
          onPress={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
        >
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.cantidad}>{item.cantidad}</Text>

        <TouchableOpacity
          style={styles.btnCantidad}
          onPress={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}
        >
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtotal}>${item.subtotal.toFixed(2)}</Text>
    </View>
  );

  if (carrito.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>El carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={carrito}
        renderItem={renderCarritoItem}
        keyExtractor={(item) => item.producto.id.toString()}
        style={styles.lista}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total ({cantidadCarrito} items)</Text>
          <Text style={styles.totalMonto}>${totalCarrito.toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.btnComprar}>
          <Text style={styles.btnComprarText}>Procesar Venta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnLimpiar}
          onPress={limpiarCarrito}
        >
          <Text style={styles.btnLimpiarText}>Limpiar Carrito</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  lista: {
    flex: 1,
    padding: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrecio: {
    fontSize: 12,
    color: '#666',
  },
  cantidadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  btnCantidad: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cantidad: {
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  subtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    minWidth: 60,
    textAlign: 'right',
  },
  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalMonto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  btnComprar: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnComprarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  btnLimpiar: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnLimpiarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
