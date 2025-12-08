# 🎨 INTEGRACIÓN FRONTEND - Sistema Multi-Sucursal

## 📱 React Native - Ejemplos de Código

### 1. Custom Hook: `useSucursal.js`

```javascript
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook para manejar sucursal actual y sus productos
 * 
 * Mantiene en caché:
 * - Información de la sucursal actual
 * - Productos disponibles
 * - Token y contexto
 */
export function useSucursal() {
  const [sucursal, setSucursal] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener información de sucursal actual
  const obtenerSucursalActual = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sucursales/actual');
      setSucursal(response.data);
      console.log('Sucursal actual:', response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error obteniendo sucursal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener productos de la sucursal actual
  const obtenerProductos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sucursales/productos');
      setProductos(response.data || []);
      console.log('Productos cargados:', response.data.length);
    } catch (err) {
      setError(err.message);
      console.error('Error obteniendo productos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar datos
  const recargar = useCallback(async () => {
    await Promise.all([obtenerSucursalActual(), obtenerProductos()]);
  }, [obtenerSucursalActual, obtenerProductos]);

  // Al montar, cargar datos
  useEffect(() => {
    recargar();
  }, [recargar]);

  return {
    sucursal,
    productos,
    loading,
    error,
    recargar,
    setSucursal,
    setProductos
  };
}
```

### 2. Pantalla de Menú: `MenuScreen.jsx`

```javascript
import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSucursal } from '../hooks/useSucursal';
import ProductoCard from '../components/ProductoCard';
import SucursalInfo from '../components/SucursalInfo';

export default function MenuScreen() {
  const { sucursal, productos, loading, recargar } = useSucursal();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await recargar();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Información de la sucursal actual */}
      {sucursal && <SucursalInfo sucursal={sucursal} />}

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <ProductoCard
            producto={item}
            key={item.id}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No hay productos disponibles</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
});
```

### 3. Componente: `SucursalInfo.jsx`

```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SucursalInfo({ sucursal }) {
  const navigation = useNavigation();

  if (!sucursal) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{sucursal.sucursalNombre}</Text>
          <Text style={styles.subtitle}>{sucursal.direccion}</Text>
          <Text style={styles.phone}>{sucursal.telefono}</Text>
        </View>

        {/* Badge de sucursal */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            ID: {sucursal.sucursalId}
          </Text>
        </View>
      </View>

      {/* Botón para cambiar sucursal (admin) */}
      <TouchableOpacity
        style={styles.cambiarButton}
        onPress={() => navigation.navigate('CambiarSucursal')}
      >
        <Text style={styles.cambiarButtonText}>
          Cambiar Sucursal (Admin)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  phone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cambiarButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cambiarButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

### 4. Componente: `ProductoCard.jsx`

```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProductoCard({ producto }) {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ProductoDetalle', { producto });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Imagen (placeholder) */}
      <View style={styles.imageContainer}>
        <Text style={styles.imagePlaceholder}>📦</Text>
      </View>

      {/* Información */}
      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>
          {producto.nombre}
        </Text>

        {/* Categoría */}
        {producto.categoriaNombre && (
          <Text style={styles.categoria}>
            {producto.categoriaNombre}
          </Text>
        )}

        {/* Precio */}
        <View style={styles.priceContainer}>
          <Text style={styles.precio}>
            ${producto.precioEfectivo?.toFixed(2)}
          </Text>
        </View>

        {/* Disponibilidad */}
        <Text style={[
          styles.disponibilidad,
          {
            color: producto.disponible ? '#4CAF50' : '#F44336'
          }
        ]}>
          {producto.disponible ? '✓ Disponible' : '✗ No disponible'}
        </Text>

        {/* Badge de horario */}
        {producto.horarioDisponibilidad && (
          <View style={styles.horarioBadge}>
            <Text style={styles.horarioBadgeText}>
              ⏰ {JSON.parse(producto.horarioDisponibilidad).inicio}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    fontSize: 40,
  },
  info: {
    padding: 12,
  },
  nombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoria: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  priceContainer: {
    marginBottom: 8,
  },
  precio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  disponibilidad: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  horarioBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  horarioBadgeText: {
    fontSize: 11,
    color: '#856404',
  },
});
```

### 5. Pantalla de Admin: `CambiarSucursalScreen.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CambiarSucursalScreen() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucursalActual, setSucursalActual] = useState(null);

  useEffect(() => {
    cargarSucursales();
    obtenerSucursalActual();
  }, []);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sucursales');
      setSucursales(response.data || []);
    } catch (err) {
      console.error('Error cargando sucursales:', err);
    } finally {
      setLoading(false);
    }
  };

  const obtenerSucursalActual = async () => {
    try {
      const response = await api.get('/api/sucursales/actual');
      setSucursalActual(response.data?.sucursalId);
    } catch (err) {
      console.error('Error obteniendo sucursal actual:', err);
    }
  };

  const cambiarSucursal = async (sucursalId) => {
    try {
      setLoading(true);

      // 1. Cambiar contexto en backend
      await api.post(`/api/sucursales/cambiar/${sucursalId}`);

      // 2. Guardar sucursal en AsyncStorage (para futuras requests)
      await AsyncStorage.setItem('sucursalId', sucursalId.toString());

      // 3. Actualizar header para próximas requests
      api.defaults.headers.common['X-Sucursal-Id'] = sucursalId;

      setSucursalActual(sucursalId);
      alert('Sucursal cambiada correctamente');
    } catch (err) {
      console.error('Error cambiando sucursal:', err);
      alert('Error al cambiar sucursal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Sucursal (Admin)</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={sucursales}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.sucursalItem,
                sucursalActual === item.id && styles.sucursalItemActive,
              ]}
              onPress={() => cambiarSucursal(item.id)}
              disabled={loading}
            >
              <View style={styles.sucursalContent}>
                <Text style={styles.sucursalNombre}>
                  {item.nombre}
                </Text>
                <Text style={styles.sucursalDireccion}>
                  {item.direccion}
                </Text>
                <Text style={styles.sucursalTelefono}>
                  {item.telefono}
                </Text>
              </View>

              {sucursalActual === item.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sucursalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  sucursalItemActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F7FF',
  },
  sucursalContent: {
    flex: 1,
  },
  sucursalNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sucursalDireccion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sucursalTelefono: {
    fontSize: 12,
    color: '#999',
  },
  checkmark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
```

### 6. Configuración API: `services/api.js`

```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const sucursalId = await AsyncStorage.getItem('sucursalId');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Agregar header de sucursal si existe
      if (sucursalId) {
        config.headers['X-Sucursal-Id'] = sucursalId;
      }

      return config;
    } catch (err) {
      console.error('Error en interceptor:', err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar y redirigir a login
      await AsyncStorage.removeItem('authToken');
      // TODO: Redirigir a pantalla de login
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔄 Flujo Completo - Frontend

```
1. Usuario abre app
   ↓
2. AuthContext verifica si hay token en AsyncStorage
   ↓
3. Si hay token, obtiene sucursal actual
   GET /api/sucursales/actual
   ↓
4. Muestra SucursalInfo con nombre y ubicación
   ↓
5. Carga MenuScreen con FlatList de productos
   GET /api/sucursales/productos
   ↓
6. Muestra ProductoCard por cada producto
   - Nombre
   - Precio (precioEfectivo puede ser diferente)
   - Categoría
   - Disponibilidad
   - Horario (si aplica)
   ↓
7. Si es admin:
   - Botón "Cambiar Sucursal"
   - Selecciona sucursal diferente
   - Header X-Sucursal-Id se envía en próximos requests
   ↓
8. Pull-to-refresh recarga datos
```

---

## 📱 Navegación Recomendada

```
App (Stack Navigator)
├── Auth Stack
│   ├── LoginScreen
│   └── RegisterScreen
└── Main Stack (después de autenticación)
    ├── MenuScreen (por defecto)
    ├── ProductoDetalle
    ├── CarritoScreen
    ├── VentasScreen
    ├── GastosScreen
    └── CambiarSucursalScreen (admin only)
```

---

## 🎨 Pantalla Visual

```
┌─────────────────────────────────────┐
│  Sucursal Centro          [ID: 1]    │
│  Calle Principal 123                │
│  555-0001                           │
│  ────────────────────────────────────│
│  Cambiar Sucursal (Admin)           │
└─────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Pull para refrescar                   │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ 📦 Jugo      │  │ 📦 Café      │ │
│  │ Naranja      │  │ Espreso      │ │
│  │ Bebidas      │  │ Bebidas      │ │
│  │ $2.50        │  │ $3.00        │ │
│  │ ✓ Disp.      │  │ ✓ Disp.      │ │
│  │ ⏰ 06:00     │  │ ⏰ 06:00     │ │
│  └──────────────┘  └──────────────┘ │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ 📦 Jugo      │  │ 📦 Croissant │ │
│  │ Fresa        │  │              │ │
│  │ Bebidas      │  │ Panadería    │ │
│  │ $2.50        │  │ $2.00        │ │
│  │ ✓ Disp.      │  │ ✓ Disp.      │ │
│  │ ⏰ 06:00     │  │              │ │
│  └──────────────┘  └──────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

---

## ✅ Checklist Frontend

- [ ] `useSucursal()` hook implementado
- [ ] `MenuScreen.jsx` con FlatList
- [ ] `SucursalInfo.jsx` con información
- [ ] `ProductoCard.jsx` con detalles
- [ ] `CambiarSucursalScreen.jsx` para admin
- [ ] Interceptor API con `X-Sucursal-Id`
- [ ] AsyncStorage para sucursal actual
- [ ] Pull-to-refresh funcional
- [ ] Manejo de errores
- [ ] Tests unitarios

---

## 🚀 Deploy

```bash
npm run android
npm run ios

# O con Expo Go
expo start
```

---

**¡Listo para integrar!** 🎉

