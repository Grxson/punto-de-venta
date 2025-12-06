import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useMenu } from '../hooks/useMenu';

export function VentasScreen() {
  const { user, sucursal } = useAuth();
  const { carrito, totalCarrito, limpiarCarrito } = useMenu();
  const [descripcion, setDescripcion] = useState('');

  const handleProcesarVenta = async () => {
    if (carrito.length === 0) {
      Alert.alert('Error', 'El carrito está vacío');
      return;
    }

    try {
      // TODO: Enviar venta al backend
      // await api.post('/ventas', { items: carrito, descripcion, total: totalCarrito })
      Alert.alert('Éxito', `Venta de $${totalCarrito.toFixed(2)} procesada`);
      limpiarCarrito();
      setDescripcion('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la venta');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Venta</Text>
        <Text style={styles.subtitle}>
          {sucursal?.nombre} - {user?.nombre}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen del Carrito</Text>
        {carrito.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos en el carrito</Text>
        ) : (
          carrito.map((item) => (
            <View key={item.producto.id} style={styles.cartItem}>
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName}>{item.producto.nombre}</Text>
                <Text style={styles.cartItemQty}>{item.cantidad}x ${item.precioUnitario}</Text>
              </View>
              <Text style={styles.cartItemSubtotal}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      {carrito.length > 0 && (
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="Notas o descripción (opcional)"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
          />
        </View>
      )}

      {carrito.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${totalCarrito.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.btnProcesar} onPress={handleProcesarVenta}>
            <Text style={styles.btnText}>Procesar Venta</Text>
          </TouchableOpacity>
        </View>
      )}
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
    padding: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 24,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cartItemQty: {
    fontSize: 12,
    color: '#666',
  },
  cartItemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34C759',
  },
  btnProcesar: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
