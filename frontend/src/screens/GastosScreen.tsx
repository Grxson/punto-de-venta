import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';

interface Gasto {
  id: number;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export function GastosScreen() {
  const { user, sucursal } = useAuth();
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [gastos, setGastos] = useState<Gasto[]>([]);

  const categorias = ['Alquiler', 'Servicios', 'Insumos', 'Mantenimiento', 'Otro'];

  const handleAgregarGasto = () => {
    if (!categoria || !descripcion.trim() || !monto.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const nuevoGasto: Gasto = {
      id: Math.random(),
      categoria,
      descripcion,
      monto: parseFloat(monto),
      fecha: new Date().toLocaleDateString(),
    };

    setGastos([nuevoGasto, ...gastos]);
    setCategoria('');
    setDescripcion('');
    setMonto('');
    Alert.alert('Éxito', 'Gasto registrado correctamente');
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

  const renderGasto = ({ item }: { item: Gasto }) => (
    <View style={styles.gastoItem}>
      <View style={styles.gastoInfo}>
        <Text style={styles.gastoCategoria}>{item.categoria}</Text>
        <Text style={styles.gastoDescripcion}>{item.descripcion}</Text>
        <Text style={styles.gastoFecha}>{item.fecha}</Text>
      </View>
      <Text style={styles.gastoMonto}>${item.monto.toFixed(2)}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Gastos</Text>
        <Text style={styles.subtitle}>{sucursal?.nombre}</Text>
      </View>

      <View style={styles.formulario}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.pickerContainer}>
          {categorias.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pickerButton,
                categoria === cat && styles.pickerButtonActive,
              ]}
              onPress={() => setCategoria(cat)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  categoria === cat && styles.pickerButtonTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={styles.input}
          placeholder="Descripción del gasto"
          value={descripcion}
          onChangeText={setDescripcion}
        />

        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity style={styles.btnAgregar} onPress={handleAgregarGasto}>
          <Text style={styles.btnText}>Agregar Gasto</Text>
        </TouchableOpacity>
      </View>

      {gastos.length > 0 && (
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Gastos del Día</Text>
            <Text style={styles.listTotal}>Total: ${totalGastos.toFixed(2)}</Text>
          </View>
          <FlatList
            data={gastos}
            renderItem={renderGasto}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
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
    backgroundColor: '#FF9500',
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
  formulario: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pickerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
  },
  pickerButtonActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  pickerButtonText: {
    fontSize: 12,
    color: '#666',
  },
  pickerButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  btnAgregar: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  listTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
  },
  gastoItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  gastoInfo: {
    flex: 1,
  },
  gastoCategoria: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  gastoDescripcion: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  gastoFecha: {
    fontSize: 11,
    color: '#999',
  },
  gastoMonto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9500',
  },
});
