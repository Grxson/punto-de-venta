# Arquitectura de Contextos Frontend - Multi-Sucursal

## 📊 Descripción General

El sistema de contextos implementa una arquitectura de tres capas que gestiona el estado global de la aplicación con dependencias claras:

```
AppContextProvider
├── AuthContext (Capa 1: Autenticación)
│   ├── User authentication
│   ├── Token management
│   └── Role detection
│
├── MenuContext (Capa 2: Menú y Carrito) - Depende de Auth
│   ├── Productos por sucursal
│   ├── Categorías
│   └── Estado del carrito
│
└── ReporteContext (Capa 3: Reportes) - Depende de Auth
    ├── Reportes generales
    ├── Reportes por sucursal
    └── KPIs administrativos
```

## 🔐 Capa 1: AuthContext

### Ubicación
`frontend/src/contexts/AuthContext.tsx`

### Responsabilidades
- ✅ Gestión de autenticación (login/logout)
- ✅ Manejo de tokens JWT
- ✅ Renovación automática de tokens
- ✅ Detección de roles (ADMIN, GERENTE, VENDEDOR, USUARIO)
- ✅ Persistencia en AsyncStorage
- ✅ Auto-login al iniciar la app

### Tipos Relacionados
`frontend/src/types/auth.ts`:
```typescript
type UserRole = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'USUARIO';

interface UsuarioDTO {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
  sucursal_id: number;
  permisos: string[];
}

interface SucursalDTO {
  id: number;
  nombre: string;
  direccion: string;
  email: string;
  telefono: string;
  activa: boolean;
}

interface AuthContextType {
  // Estado
  user: UsuarioDTO | null;
  sucursal: SucursalDTO | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Propiedades derivadas
  isAdmin: boolean;
  isGerente: boolean;
  isVendedor: boolean;
  
  // Métodos
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
```

### Hook
`frontend/src/hooks/useAuth.ts`:
```typescript
import { useAuth, usePermission, useIsAdmin } from '@hooks/useAuth';

// Uso básico
const { user, sucursal, token, isAuthenticated } = useAuth();

// Verificar admin
const isAdmin = useIsAdmin();

// Verificar permisos
const canManageInventory = usePermission(['ADMIN', 'GERENTE']);
```

### Ciclo de Vida
1. **App Mount**: AuthContext llama `checkAuth()`
   - Lee token de AsyncStorage
   - Si existe y no está expirado: auto-login
   - Si está expirado: intenta refresh
   - Si falla: requiere login manual

2. **Login**: Usuario ingresa credenciales
   - POST `/api/auth/login` con username/password
   - Recibe token + usuario + sucursal
   - Guarda en AsyncStorage
   - AuthContext actualiza estado

3. **Token Refresh**: Automático via Axios interceptor
   - Cada 401 dispara POST `/api/auth/refresh-token`
   - Reintenta la solicitud original
   - Si falla: redirige a login

4. **Logout**: Usuario cierra sesión
   - POST `/api/auth/logout`
   - Limpia AsyncStorage
   - Cierra todas las sesiones
   - Redirige a LoginScreen

### Secuencia de Autenticación (Diagrama)
```
┌─────────────────────────────────────────────────────────────┐
│                     Flujo Completo JWT                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Usuario abre app                                          │
│     ↓                                                         │
│  2. AuthContext.checkAuth() en mount                         │
│     ├─ Lee token de AsyncStorage                            │
│     ├─ Si no existe: LoginScreen                            │
│     └─ Si existe: Verifica con jwtDecode()                  │
│        ├─ No expirado: usa token actual                     │
│        └─ Expirado: intenta refresh automático              │
│           ├─ Éxito: actualiza token                         │
│           └─ Falla: requiere login                          │
│     ↓                                                         │
│  3. Usuario logueado                                         │
│     ├─ MenuContext carga productos de su sucursal           │
│     ├─ ReporteContext carga sus reportes                    │
│     └─ Token automático en headers de requests              │
│        (via Axios interceptor)                              │
│     ↓                                                         │
│  4. Cada request a API                                       │
│     ├─ Axios agrega Authorization: Bearer {token}          │
│     └─ Si 401: interceptor intenta refresh automático       │
│        ├─ Éxito: reintenta request                          │
│        └─ Falla: logout automático                          │
│     ↓                                                         │
│  5. Usuario cierra sesión                                    │
│     ├─ POST /api/auth/logout                                │
│     ├─ Limpia AsyncStorage                                  │
│     └─ Redirige a LoginScreen                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Ejemplo de Uso en Componente
```typescript
import { useAuth } from '@hooks/useAuth';

export function ProfileScreen() {
  const { user, sucursal, logout } = useAuth();
  
  if (!user) return <Text>No autenticado</Text>;
  
  return (
    <View>
      <Text>Usuario: {user.nombre}</Text>
      <Text>Sucursal: {sucursal?.nombre}</Text>
      <Text>Rol: {user.rol}</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

---

## 🍽️ Capa 2: MenuContext

### Ubicación
`frontend/src/contexts/MenuContext.tsx`

### Responsabilidades
- ✅ Cargar productos de la sucursal del usuario
- ✅ Cargar categorías disponibles
- ✅ Gestionar carrito de compras
- ✅ Filtrar productos por categoría
- ✅ Búsqueda de productos
- ✅ Agrupar productos por categoría

### Dependencias
- **Debe estar dentro de**: AuthProvider (usa `useAuth()`)
- **Depende de**: Token y sucursal_id del usuario

### Tipos Relacionados
`frontend/src/types/menu.ts`:
```typescript
interface ProductoDTO {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  categoria_id: number;
  precio_base: number;
  activo: boolean;
}

interface ProductoSucursalDTO extends ProductoDTO {
  precio_sucursal: number;
  disponible: number;
  orden_visualizacion: number;
}

interface CategoriaDTO {
  id: number;
  nombre: string;
  icono: string;
  orden: number;
  activa: boolean;
}

interface CarritoItem {
  producto: ProductoSucursalDTO;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface MenuContextType {
  // Estado
  productos: ProductoSucursalDTO[];
  categorias: CategoriaDTO[];
  carrito: CarritoItem[];
  isLoading: boolean;
  error: string | null;
  
  // Propiedades derivadas
  productosAgrupados: Map<number, ProductoSucursalDTO[]>;
  totalCarrito: number;
  cantidadCarrito: number;
  
  // Métodos
  cargarProductos: (sucursalId: number) => Promise<void>;
  cargarCategorias: () => Promise<void>;
  agregarAlCarrito: (producto: ProductoSucursalDTO, cantidad: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  limpiarCarrito: () => void;
  buscarProducto: (texto: string) => ProductoSucursalDTO[];
  filtrarPorCategoria: (categoriaId: number) => ProductoSucursalDTO[];
}
```

### Hook
`frontend/src/hooks/useMenu.ts`:
```typescript
import { useMenu } from '@hooks/useMenu';

const {
  productos,
  categorias,
  carrito,
  totalCarrito,
  agregarAlCarrito,
  actualizarCantidad,
  buscarProducto
} = useMenu();
```

### Ciclo de Vida
1. **Init**: MenuContext monta, lee sucursal de AuthContext
2. **Load**: Carga paralela
   - GET `/api/sucursales/{sucursal_id}/productos`
   - GET `/api/categorias`
3. **Mantiene**: Productos y categorías en memoria
4. **Update**: Cuando sucursal cambia en AuthContext → recarga automáticamente
5. **Carrito**: Estado ephemeral, se vacía al hacer venta o logout

### Productos Agrupados
```typescript
// Estructura interna
productosAgrupados: Map<
  number,  // categoria_id
  ProductoSucursalDTO[]  // productos de esa categoría
>

// Uso
const productosDesayuno = menuContext.productosAgrupados.get(1);
// [{ id: 1, nombre: "Pan", precio: 2.5 }, { id: 2, nombre: "Café", precio: 3 }]
```

### Ejemplo de Uso en Componente
```typescript
import { useMenu } from '@hooks/useMenu';
import { useAuth } from '@hooks/useAuth';

export function MenuScreen() {
  const { sucursal } = useAuth();
  const { categorias, productosAgrupados, agregarAlCarrito } = useMenu();
  
  return (
    <View>
      <Text>Menú de {sucursal?.nombre}</Text>
      
      {categorias.map((cat) => (
        <View key={cat.id}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>
            {cat.icono} {cat.nombre}
          </Text>
          {productosAgrupados.get(cat.id)?.map((prod) => (
            <View key={prod.id}>
              <Text>{prod.nombre}</Text>
              <Text>${prod.precio_sucursal}</Text>
              <Button
                title="Agregar"
                onPress={() => agregarAlCarrito(prod, 1)}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
```

---

## 📊 Capa 3: ReporteContext

### Ubicación
`frontend/src/contexts/ReporteContext.tsx`

### Responsabilidades
- ✅ Cargar reportes generales (usuario)
- ✅ Cargar reportes por sucursal (admin)
- ✅ Calcular KPIs administrativos
- ✅ Filtrar por período (fechaInicio, fechaFin)
- ✅ Filtrar por sucursal (solo admin)
- ✅ Proporcionar datos para gráficos

### Dependencias
- **Debe estar dentro de**: AuthProvider (usa `useAuth()`)
- **Depende de**: rol del usuario (ADMIN vs USER)
- **Token requerido**: Sí, para API calls

### Tipos Relacionados
`frontend/src/types/reportes.ts`:
```typescript
interface VentasResumen {
  total: number;
  cantidad: number;
  promedio: number;
  porCategoria: { [categoria: string]: number };
}

interface GastosResumen {
  total: number;
  cantidad: number;
  promedio: number;
  porCategoria: { [categoria: string]: number };
}

interface GananciasResumen {
  neto: number;
  margen: number;
  gananciaPromedioDia: number;
}

interface ReporteDTO {
  periodo: { inicio: string; fin: string };
  ventas: VentasResumen;
  gastos: GastosResumen;
  ganancias: GananciasResumen;
  detalles: {
    mejorProducto: string;
    productoMenorVenta: string;
    gastoPrincipal: string;
  };
}

interface KPIAdmin {
  ventasTotales: number;
  gastosTotales: number;
  sucursalMasVendedora: string;
  mejorProducto: string;
  tendencia: 'ARRIBA' | 'ABAJO' | 'ESTABLE';
}

interface ReporteContextType {
  // Estado
  reporteGeneral: ReporteDTO | null;
  reportesPorSucursal: Map<number, ReporteDTO>;
  kpis: KPIAdmin | null;
  isLoading: boolean;
  error: string | null;
  
  // Filtros
  fechaInicio: Date;
  fechaFin: Date;
  sucursalFiltro: number | null; // null = todas (admin only)
  
  // Métodos
  cargarReportes: () => Promise<void>;
  setFechas: (inicio: Date, fin: Date) => void;
  setSucursalFiltro: (sucursalId: number | null) => void;
  obtenerReporteActual: () => ReporteDTO | null;
}
```

### Hook
`frontend/src/hooks/useReportes.ts`:
```typescript
import { useReportes } from '@hooks/useReportes';

const {
  reporteGeneral,
  kpis,
  fechaInicio,
  fechaFin,
  setFechas,
  setSucursalFiltro
} = useReportes();
```

### Diferencia Usuario vs Admin

#### Usuario Común
```typescript
// Carga SOLO su reporte
// GET /api/reportes/por-fecha?inicio=2024-01-01&fin=2024-01-31

// Acceso:
- reporteGeneral: objeto con su reporte
- reportesPorSucursal: Map vacio
- kpis: null
- setSucursalFiltro: deshabilitado (no hace nada)
```

#### Usuario Admin
```typescript
// Carga TODOS los reportes en paralelo:
// GET /api/reportes/general?inicio=2024-01-01&fin=2024-01-31
// GET /api/reportes/por-sucursal?inicio=2024-01-01&fin=2024-01-31
// GET /api/reportes/kpis?inicio=2024-01-01&fin=2024-01-31

// Acceso:
- reporteGeneral: reporte consolidado de todas sucursales
- reportesPorSucursal: Map<sucursal_id, ReporteDTO>
- kpis: KPIs generales
- setSucursalFiltro: permite filtrar a una sucursal específica
  - null = mostrar general
  - 1 = mostrar solo sucursal 1
```

### Filtrado Automático
```typescript
// El contexto ofrece método para obtener reporte actual
const reporte = reporteContext.obtenerReporteActual();

// Si usuario es ADMIN y sucursalFiltro = 1:
// Retorna reportesPorSucursal.get(1)

// Si usuario es ADMIN y sucursalFiltro = null:
// Retorna reporteGeneral

// Si usuario es USER:
// Siempre retorna su reporteGeneral
```

### Ejemplo de Uso - Usuario
```typescript
import { useReportes } from '@hooks/useReportes';
import { useIsAdmin } from '@hooks/useAuth';

export function DashboardVendedor() {
  const isAdmin = useIsAdmin();
  const { reporteGeneral, fechaInicio, fechaFin, setFechas } = useReportes();
  
  if (isAdmin) return <AdminDashboard />;
  
  if (!reporteGeneral) return <Text>Cargando reportes...</Text>;
  
  return (
    <ScrollView>
      <Text>Mis Ventas: ${reporteGeneral.ventas.total}</Text>
      <Text>Mis Gastos: ${reporteGeneral.gastos.total}</Text>
      <Text>Ganancia: ${reporteGeneral.ganancias.neto}</Text>
      
      <Text>Período: {reporteGeneral.periodo.inicio} a {reporteGeneral.periodo.fin}</Text>
      <Button
        title="Ver mes anterior"
        onPress={() => {
          const nuevaFin = new Date(fechaInicio);
          const nuevaInicio = new Date(nuevaFin.setDate(nuevaFin.getDate() - 30));
          setFechas(nuevaInicio, nuevaFin);
        }}
      />
    </ScrollView>
  );
}
```

### Ejemplo de Uso - Admin
```typescript
import { useReportes } from '@hooks/useReportes';
import { useIsAdmin } from '@hooks/useAuth';

export function AdminDashboard() {
  const isAdmin = useIsAdmin();
  const { 
    reporteGeneral, 
    reportesPorSucursal,
    kpis,
    sucursalFiltro,
    setSucursalFiltro 
  } = useReportes();
  
  if (!isAdmin) return <Text>No tienes acceso</Text>;
  
  // Obtener reporte actual basado en filtro
  const reporteActual = sucursalFiltro
    ? reportesPorSucursal.get(sucursalFiltro)
    : reporteGeneral;
  
  return (
    <ScrollView>
      <Text style={{fontSize: 20, fontWeight: 'bold'}}>
        Dashboard General
      </Text>
      
      {/* Selector de sucursal */}
      <Picker
        selectedValue={sucursalFiltro || 'todos'}
        onValueChange={(val) => setSucursalFiltro(val === 'todos' ? null : parseInt(val))}
      >
        <Picker.Item label="Todas las sucursales" value="todos" />
        {Array.from(reportesPorSucursal.keys()).map(sucId => (
          <Picker.Item 
            key={sucId}
            label={`Sucursal ${sucId}`}
            value={sucId.toString()}
          />
        ))}
      </Picker>
      
      {/* KPIs */}
      <Text>Ventas Totales: ${kpis?.ventasTotales}</Text>
      <Text>Gastos Totales: ${kpis?.gastosTotales}</Text>
      <Text>Mejor Producto: {kpis?.mejorProducto}</Text>
      <Text>Sucursal más vendedora: {kpis?.sucursalMasVendedora}</Text>
      
      {/* Detalle del reporte actual */}
      {reporteActual && (
        <>
          <Text>Ventas: ${reporteActual.ventas.total}</Text>
          <Text>Gastos: ${reporteActual.gastos.total}</Text>
          <Text>Ganancia: ${reporteActual.ganancias.neto}</Text>
        </>
      )}
    </ScrollView>
  );
}
```

---

## 🔗 AppContextProvider

### Ubicación
`frontend/src/contexts/AppContextProvider.tsx`

### Propósito
Punto único de entrada que envuelve toda la aplicación con los tres contextos en el orden correcto.

### Orden Importa
```typescript
export function AppContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* MenuContext DEBE estar dentro de AuthProvider porque depende del token */}
      <MenuProvider>
        {/* ReporteContext DEBE estar dentro de AuthProvider porque depende del rol */}
        <ReporteProvider>
          {children}
        </ReporteProvider>
      </MenuProvider>
    </AuthProvider>
  );
}
```

### Uso en App.tsx
```typescript
import { AppContextProvider } from '@contexts/AppContextProvider';
import { RootNavigator } from '@navigation/RootNavigator';

export default function App() {
  return (
    <AppContextProvider>
      <RootNavigator />
    </AppContextProvider>
  );
}
```

---

## 📝 Resumen de Dependencias y Datos

### Flujo de Datos Principales

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLUJO DE DATOS GLOBAL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  LoginScreen                                                      │
│  ├─ AuthContext.login()                                          │
│  └─ ✅ user, sucursal, token guardados                           │
│     ↓                                                             │
│  Componentes                                                      │
│  ├─ useAuth() → acceso a user, sucursal, rol                    │
│  │  └─ Decide qué UI mostrar (user vs admin)                    │
│  │                                                                │
│  ├─ useMenu() → acceso a productos, carrito                     │
│  │  └─ MenuContext automáticamente cargó productos de           │
│  │     la sucursal del usuario                                   │
│  │  └─ Componen menú dinámico con categorías                    │
│  │                                                                │
│  └─ useReportes() → acceso a reportes                           │
│     └─ Si USER: solo su reporte                                 │
│     └─ Si ADMIN: general + por sucursal + KPIs                  │
│                                                                   │
│  Cambio de Datos                                                 │
│  ├─ Usuario hace una venta → se envía al backend                │
│  ├─ Carrito se vacía automáticamente                            │
│  ├─ ReporteContext se recarga (setFechas dispara carga)         │
│  └─ Dashboards se actualizan automáticamente                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Qué Contexto Usar Para Qué

| Funcionalidad | Contexto | Hook |
|---|---|---|
| Mostrar nombre de usuario | AuthContext | `useAuth()` → `user.nombre` |
| Mostrar sucursal actual | AuthContext | `useAuth()` → `sucursal.nombre` |
| Verificar si es admin | AuthContext | `useIsAdmin()` |
| Mostrar menú de productos | MenuContext | `useMenu()` → `productosAgrupados` |
| Agregar al carrito | MenuContext | `useMenu()` → `agregarAlCarrito()` |
| Ver carrito | MenuContext | `useMenu()` → `carrito`, `totalCarrito` |
| Ver ventas del período | ReporteContext | `useReportes()` → `reporteGeneral.ventas` |
| Ver KPIs generales (admin) | ReporteContext | `useReportes()` → `kpis` |
| Comparar sucursales (admin) | ReporteContext | `useReportes()` → `reportesPorSucursal` |
| Hacer logout | AuthContext | `useAuth()` → `logout()` |

---

## 🚀 Próximos Pasos

### Fase Inmediata (Implementar)
1. **LoginScreen** - Usa `useAuth()` para login
2. **MenuScreen** - Usa `useMenu()` para mostrar productos
3. **VentasScreen** - Usa `useMenu()` (carrito) + AuthContext + ReporteContext
4. **GastosScreen** - Usa ReporteContext para mostrar gastos
5. **AdminDashboard** - Usa `useReportes()` para KPIs
6. **AdminReportesScreen** - Usa `useReportes()` con setSucursalFiltro()

### Verificación de Requisitos
- ✅ Todos los contextos implementados
- ✅ Todos los hooks creados
- ✅ Tipos TypeScript definidos
- ✅ Axios con JWT interceptor
- ✅ Token refresh automático
- ✅ Role detection
- ⏳ Componentes de pantalla (PRÓXIMO)

### Testing
Después de cada pantalla:
1. Verificar que se carga correctamente
2. Verificar que usa el contexto correcto
3. Verificar que actualiza estado correctamente
4. Verificar que funciona para user y admin

---

## 📚 Archivos de Referencia

### Tipos (TypeScript)
- `frontend/src/types/auth.ts` - UsuarioDTO, SucursalDTO, AuthContextType
- `frontend/src/types/menu.ts` - ProductoDTO, CarritoItem, MenuContextType
- `frontend/src/types/reportes.ts` - ReporteDTO, KPIAdmin, ReporteContextType

### Contextos
- `frontend/src/contexts/AuthContext.tsx` - Lógica de autenticación
- `frontend/src/contexts/MenuContext.tsx` - Lógica de menú y carrito
- `frontend/src/contexts/ReporteContext.tsx` - Lógica de reportes
- `frontend/src/contexts/AppContextProvider.tsx` - Punto de entrada

### Hooks
- `frontend/src/hooks/useAuth.ts` - useAuth(), usePermission(), useIsAdmin()
- `frontend/src/hooks/useMenu.ts` - useMenu()
- `frontend/src/hooks/useReportes.ts` - useReportes()

### Servicios
- `frontend/src/services/api/axiosInstance.ts` - Axios con JWT interceptor

---

## 🎯 Guía Rápida para Nuevos Desarrolladores

### "¿Cómo muestro el nombre del usuario?"
```typescript
import { useAuth } from '@hooks/useAuth';
const { user } = useAuth();
return <Text>{user?.nombre}</Text>;
```

### "¿Cómo cargo productos del menú?"
```typescript
import { useMenu } from '@hooks/useMenu';
const { productosAgrupados, categorias } = useMenu();
// Ya están cargados automáticamente por MenuContext
```

### "¿Cómo verifico si el usuario es admin?"
```typescript
import { useIsAdmin } from '@hooks/useAuth';
const isAdmin = useIsAdmin();
if (isAdmin) { /* mostrar admin UI */ }
```

### "¿Cómo agrego algo al carrito?"
```typescript
import { useMenu } from '@hooks/useMenu';
const { agregarAlCarrito } = useMenu();
agregarAlCarrito(producto, cantidad);
```

### "¿Cómo veo los reportes?"
```typescript
import { useReportes } from '@hooks/useReportes';
const { reporteGeneral } = useReportes();
return <Text>${reporteGeneral?.ventas.total}</Text>;
```

### "¿Cómo filtro reportes por sucursal (admin)?"
```typescript
import { useReportes } from '@hooks/useReportes';
const { setSucursalFiltro } = useReportes();
setSucursalFiltro(2); // Ver sucursal 2
setSucursalFiltro(null); // Ver todas
```

---

**Estado**: ✅ COMPLETADO - Toda la arquitectura de contextos está implementada y lista para usar
**Archivo**: `FRONTEND-CONTEXTS-ARQUITECTURA-COMPLETA.md`
**Última actualización**: [timestamp]
