# 🎨 Frontend - Gestión de Categorías y Subcategorías

**Fecha**: 5 de diciembre de 2025  
**Status**: ✅ IMPLEMENTADO  
**Stack**: React Native + TypeScript

---

## 📚 Estructura de Archivos

```
frontend/src/
├── components/
│   └── CategoriaSelector.tsx          # Selector visual de categorías/subcategorías
├── hooks/
│   └── useCategorias.ts               # Hook personalizado para gestión de estado
├── screens/
│   └── AdminCategorias.tsx            # Pantalla de administración CRUD
├── services/
│   └── categorias.service.ts          # Servicio de API
└── types/
    └── categorias.types.ts            # Tipos e interfaces TypeScript
```

---

## 🔌 Integración con API Backend

### Servicio: `categorias.service.ts`

El servicio proporciona acceso a todos los endpoints del backend:

```typescript
import { categoriasService } from '../services/categorias.service';

// Obtener todas las categorías
const categorias = await categoriasService.obtenerCategorias();

// Obtener subcategorías de una categoría
const subcategorias = await categoriasService.obtenerSubcategorias(57);

// Crear subcategoría
const nueva = await categoriasService.crearSubcategoria(57, {
  nombre: 'BEBIDAS CALIENTES',
  descripcion: 'Café, té...',
  orden: 5,
});

// Actualizar subcategoría
const actualizada = await categoriasService.actualizarSubcategoria(57, 1, {
  nombre: 'DULCES Y POSTRES',
  orden: 1,
});

// Eliminar subcategoría
await categoriasService.eliminarSubcategoria(57, 1);

// Obtener todas las categorías con sus subcategorías
const todasConSubs = 
  await categoriasService.obtenerTodasCategoriasConSubcategorias();
```

---

## 🎯 Hook: `useCategorias`

Hook personalizado que maneja todo el estado y lógica de categorías/subcategorías.

### Uso Básico

```typescript
import { useCategorias } from '../hooks/useCategorias';

export const MiComponente = () => {
  const {
    categorias,           // Todas las categorías
    subcategorias,        // Subcategorías cargadas
    loading,              // Estado de carga
    error,                // Mensaje de error
    cargarCategorias,     // Función para cargar categorías
    cargarSubcategorias,  // Función para cargar subcategorías
    crearSubcategoria,    // Función para crear
    actualizarSubcategoria, // Función para actualizar
    eliminarSubcategoria, // Función para eliminar
    limpiarError,         // Limpiar mensajes de error
  } = useCategorias();

  // Cargar al montar
  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      {/* Tu UI */}
    </View>
  );
};
```

### Crear una Subcategoría

```typescript
try {
  const nueva = await crearSubcategoria(57, {
    nombre: 'NUEVA SUBCATEGORÍA',
    descripcion: 'Descripción',
    orden: 5,
    activa: true,
  });
  Alert.alert('✅ Éxito', 'Subcategoría creada');
} catch (error) {
  Alert.alert('❌ Error', 'Error al crear');
}
```

---

## 🎨 Componente: `CategoriaSelector`

Componente visual para mostrar categorías como tabs y subcategorías como botones horizontales.

### Uso en el Home

```typescript
import { CategoriaSelector } from '../components/CategoriaSelector';

export const HomeScreen = () => {
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = 
    useState<number | null>(null);

  return (
    <View>
      <CategoriaSelector
        onSelectSubcategoria={(id, nombre) => {
          console.log(`Seleccionada: ${nombre} (ID: ${id})`);
          setSubcategoriaSeleccionada(id);
          // Cargar productos de esta subcategoría
        }}
        selectedSubcategoriaId={subcategoriaSeleccionada}
      />
      {/* Mostrar productos basados en subcategoriaSeleccionada */}
    </View>
  );
};
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `onSelectSubcategoria` | `(id: number, nombre: string) => void` | Callback cuando se selecciona una subcategoría |
| `selectedSubcategoriaId` | `number \| null` | ID de la subcategoría seleccionada (para styling) |

---

## 📋 Pantalla: `AdminCategorias`

Interfaz completa para administrar categorías y subcategorías.

### Uso

```typescript
import { AdminCategorias } from '../screens/AdminCategorias';

export const AdminScreen = ({ navigation }) => {
  return (
    <AdminCategorias
      onClose={() => navigation.goBack()}
    />
  );
};
```

### Features

✅ Listar todas las categorías  
✅ Seleccionar una categoría  
✅ Ver subcategorías de la categoría seleccionada  
✅ Crear nueva subcategoría (modal)  
✅ Editar subcategoría existente (modal)  
✅ Eliminar subcategoría (con confirmación)  
✅ Validaciones de datos  
✅ Manejo de errores  
✅ Estados de carga  

---

## 📱 Flujo de Uso en la App

### 1. **Home Screen** - Mostrar productos por categoría

```typescript
import { CategoriaSelector } from '../components/CategoriaSelector';

export const HomeScreen = () => {
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<number | null>(null);

  return (
    <View style={{ flex: 1 }}>
      {/* Selector de categorías y subcategorías */}
      <CategoriaSelector
        onSelectSubcategoria={(id) => {
          setFiltroSubcategoria(id);
          // Aquí filtrar productos por esta subcategoría
        }}
        selectedSubcategoriaId={filtroSubcategoria}
      />

      {/* Mostrar productos filtrados */}
      <ProductosListado subcategoriaId={filtroSubcategoria} />
    </View>
  );
};
```

### 2. **Admin Screen** - Gestionar categorías

```typescript
import { AdminCategorias } from '../screens/AdminCategorias';

export const AdminScreen = ({ navigation }) => {
  return (
    <AdminCategorias onClose={() => navigation.goBack()} />
  );
};
```

### 3. **Navegación** - Agregar a App.tsx

```typescript
import { AdminCategorias } from './screens/AdminCategorias';
import { CategoriaSelector } from './components/CategoriaSelector';

// En tu Navigator:
<Stack.Screen name="AdminCategorias" component={AdminCategorias} />
<Stack.Screen name="Home" component={HomeScreen} />
```

---

## 🧪 Testing Manual

### Test 1: Cargar categorías en Home

```bash
# Abre la app, ve al Home
# Deberías ver las categorías como tabs:
# TODAS | JUGOS | LICUADOS Y CHOCOMILES | DESAYUNOS | ADICIONALES | POSTRES | BEBIDAS
```

### Test 2: Seleccionar categoria

```bash
# Click en "DESAYUNOS"
# Deberías ver las subcategorías:
# DULCES | LONCHES | SANDWICHES | PLATOS PRINCIPALES
```

### Test 3: Ir a Admin

```bash
# Navega a AdminCategorias
# Selecciona una categoría
# Verás todas sus subcategorías
# Prueba crear, editar, eliminar
```

---

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React Native)             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AdminCategorias.tsx (Admin UI)                  │  │
│  │  ↓                                               │  │
│  │  CategoriaSelector.tsx (Home UI)                │  │
│  │  ↓                                               │  │
│  │  useCategorias() Hook                           │  │
│  │  ↓                                               │  │
│  │  categorias.service.ts                          │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓ HTTP                          │
├─────────────────────────────────────────────────────────┤
│              Backend (Java + Spring Boot)               │
│                                                          │
│  GET  /api/categorias-productos                        │
│  GET  /api/categorias/{id}/subcategorias              │
│  POST /api/categorias/{id}/subcategorias              │
│  PUT  /api/categorias/{id}/subcategorias/{id}         │
│  DELETE /api/categorias/{id}/subcategorias/{id}       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Autenticación

El servicio usa el token de autenticación automáticamente:

```typescript
// En api.service.ts, el método buildHeaders() agrega:
headers['Authorization'] = `Bearer ${token}`;
```

Asegúrate de que el token se almacena en el storage:

```typescript
// Configurar en tu servicio de auth
localStorage.setItem('authToken', token);
```

---

## 🎨 Estilos

Los componentes incluyen estilos completos y responsivos:

- ✅ Colores coherentes (azul #0066cc, verde #4caf50)
- ✅ Tipografía clara y legible
- ✅ Espaciado consistente
- ✅ Diseño mobile-first
- ✅ Estados visuales (hover, selected, disabled)
- ✅ Feedback visual (loading, error)

---

## ⚠️ Manejo de Errores

Los componentes incluyen manejo completo de errores:

```typescript
{error && (
  <View style={styles.errorBanner}>
    <Text>{error}</Text>
    <TouchableOpacity onPress={limpiarError}>
      <Text>✕</Text>
    </TouchableOpacity>
  </View>
)}
```

---

## 📈 Próximos Pasos

1. ✅ **Componentes CRUD**: Implementados
2. ✅ **Hook de estado**: Implementado
3. ✅ **Servicio de API**: Implementado
4. ⏳ **Integración con Home Screen**: Pendiente
5. ⏳ **Integración con Admin Screen**: Pendiente
6. ⏳ **Tests unitarios**: Pendiente
7. ⏳ **Caching local**: Pendiente

---

## 📝 Ejemplos Completos

### Ejemplo 1: Mostrar categorías en FlatList

```typescript
import { useCategorias } from '../hooks/useCategorias';

export const CategoriasListado = () => {
  const { categorias, loading } = useCategorias();

  useEffect(() => {
    categoriasService.obtenerCategorias();
  }, []);

  return (
    <FlatList
      data={categorias}
      renderItem={({ item }) => <Text>{item.nombre}</Text>}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

### Ejemplo 2: Crear subcategoría

```typescript
const [nombre, setNombre] = useState('');
const { crearSubcategoria } = useCategorias();

const handleCrear = async () => {
  try {
    await crearSubcategoria(57, {
      nombre,
      orden: 5,
    });
    Alert.alert('✅ Éxito');
  } catch (error) {
    Alert.alert('❌ Error', error.message);
  }
};
```

---

**Cambios realizados por**: GitHub Copilot  
**Stack**: React Native 0.76.5 + TypeScript 5.0.4  
**Status**: ✅ Listo para integración
