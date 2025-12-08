import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useReportes } from '../hooks/useReportes';

export function AdminDashboardScreen() {
  const { isAdmin, user, sucursal } = useAuth();
  const { kpis, reporteGeneral, isLoading } = useReportes();

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No tienes acceso a esta sección</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Administrativo</Text>
        <Text style={styles.subtitle}>Bienvenido, {user?.nombre}</Text>
      </View>

      {kpis && (
        <View style={styles.kpisContainer}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Ventas Totales</Text>
            <Text style={styles.kpiValue}>${kpis.ventasTotales.toFixed(2)}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Gastos Totales</Text>
            <Text style={styles.kpiValueRed}>${kpis.gastosTotales.toFixed(2)}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Mejor Producto</Text>
            <Text style={styles.kpiValue}>{kpis.mejorProducto}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Sucursal Top</Text>
            <Text style={styles.kpiValue}>{kpis.sucursalMasVendedora}</Text>
          </View>
        </View>
      )}

      {reporteGeneral && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Ventas:</Text>
            <Text style={styles.value}>${reporteGeneral.ventas.total.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gastos:</Text>
            <Text style={styles.value}>${reporteGeneral.gastos.total.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Ganancia Neta:</Text>
            <Text style={[styles.value, styles.ganancia]}>
              ${reporteGeneral.ganancias.neto.toFixed(2)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Margen:</Text>
            <Text style={styles.value}>{reporteGeneral.ganancias.margen.toFixed(1)}%</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver Reportes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Administrar Sucursales</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Administrar Usuarios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#5856D6',
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#FF3B30',
  },
  kpisContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: '1%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  kpiValueRed: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ganancia: {
    color: '#34C759',
    fontSize: 16,
  },
  buttonContainer: {
    padding: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5856D6',
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
});
