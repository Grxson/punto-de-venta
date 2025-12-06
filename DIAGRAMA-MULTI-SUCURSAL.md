# Arquitectura Multi-Sucursal Visual

## Flujo de Datos

```
┌──────────────────────────────────────────────────────────┐
│                    App Principal                         │
│                   (RootNavigator)                        │
└───────────────────────┬──────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
            ▼           ▼           ▼
      ┌─────────┐ ┌──────────┐ ┌─────────────┐
      │  Login  │ │  User    │ │   Admin     │
      │         │ │ Navigator│ │ Navigator   │
      └─────────┘ └──────────┘ └─────────────┘
                        │
        ┌───────────────┼────────────────────┐
        │               │                    │
        ▼               ▼                    ▼
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │   Menú     │ │ Carrito  │ │   Ventas     │
   │ (Productos)│ │          │ │              │
   └─────┬──────┘ └──────────┘ └──────────────┘
         │
         │ (Lee de MenuContext)
         │
   ┌─────▼─────────────────────────────┐
   │  MenuContext                      │
   │  ┌──────────────────────────────┐ │
   │  │ productos = []               │ │
   │  │ carrito = []                 │ │
   │  │ totalCarrito = 0             │ │
   │  └──────────────────────────────┘ │
   │                                   │
   │  useEffect(() => {                │
   │    if (sucursal) {                │
   │      cargarProductos(sucursal.id) │ ← CLAVE
   │    }                              │
   │  }, [sucursal])                   │
   └─────┬─────────────────────────────┘
         │
         │ (Monitorea)
         │
   ┌─────▼──────────────────────────────────────┐
   │  AuthContext                               │
   │  ┌────────────────────────────────────────┐│
   │  │ user: UsuarioDTO                       ││
   │  │ sucursal: SucursalDTO  ◄───────┐      ││
   │  │ token: string                   │      ││
   │  │ isAdmin: boolean                │      ││
   │  └────────────────────────────────────────┘│
   │  ┌────────────────────────────────────────┐│
   │  │ Métodos:                               ││
   │  │ • login()                              ││
   │  │ • logout()                             ││
   │  │ • changeSucursal() ◄──────┐            ││
   │  │ • refreshToken()          │            ││
   │  └────────────────────────────────────────┘│
   └──────────────┬───────────────────┬──────────┘
                  │                   │
                  │                   │
                  ▼                   │
          ┌──────────────┐            │
          │ ProfileScreen│            │
          │              │            │
          │ "Sucursal: X▼"│────────────┘
          │  (Modal)     │
          │              │
          │ Si ADMIN:    │
          │  - Cargar    │
          │    sucursales│
          │  - Mostrar   │
          │    selector  │
          │  - Al tocar: │
          │    changeSuc │
          │    ursal()   │
          └──────────────┘
```

## Componentes y Sus Dependencias

```
┌─────────────────────────────────────────────────────┐
│              COMPONENTES REUTILIZABLES              │
│                  (Sin duplicación)                  │
└─────────────────────────────────────────────────────┘

MenuScreen
  ├─ Usa: MenuContext
  │   ├─ productos (de sucursal actual)
  │   ├─ categorias
  │   └─ agregarAlCarrito()
  └─ Monitora: sucursal (a través de MenuContext)

CarritoScreen
  ├─ Usa: MenuContext
  │   ├─ carrito
  │   ├─ actualizarCantidad()
  │   └─ limpiarCarrito()
  └─ NO depende directamente de sucursal
    (pero carrito refleja productos de sucursal actual)

VentasScreen
  ├─ Usa: MenuContext
  │   └─ carrito
  ├─ Usa: AuthContext
  │   └─ sucursal (para enviar en POST)
  └─ POST /api/ventas (sucursal_id automático)

GastosScreen
  ├─ Usa: AuthContext
  │   └─ sucursal (para enviar en POST)
  └─ POST /api/gastos (sucursal_id automático)

AdminDashboard
  ├─ Usa: ReporteContext
  │   ├─ reporteGeneral (TODAS las sucursales)
  │   ├─ reportesPorSucursal (individual)
  │   └─ kpis
  └─ Monitora: sucursal (para filtros)

ProfileScreen ⭐ NUEVO SELECTOR
  ├─ Usa: AuthContext
  │   ├─ user
  │   ├─ sucursal
  │   └─ changeSucursal() ◄──── TRIGGEA TODO
  ├─ Carga: GET /api/sucursales (si isAdmin)
  └─ Al cambiar:
      ├─ AuthContext.sucursal = nueva
      ├─ MenuContext detecta cambio
      ├─ Recargas productos automáticamente
      ├─ ReporteContext se actualiza
      └─ Todo el sistema sin recargar la app
```

## Estado en AsyncStorage

```
┌────────────────────────────────────────────┐
│         AsyncStorage (Persistencia)        │
├────────────────────────────────────────────┤
│ authToken: "eyJhbGc..."                    │
│ authUser: {                                │
│   id: 1,                                   │
│   nombre: "Admin User",                    │
│   rol: "ADMIN",                            │
│   ...                                      │
│ }                                          │
│ authSucursal: {                            │
│   id: 2,           ◄──── GUARDADO AQUÍ    │
│   nombre: "Negocio 2",                     │
│   ...                                      │
│ }                                          │
└────────────────────────────────────────────┘
         │
         │ (Al reiniciar app)
         │
         ▼
    checkAuth()
         │
         └─► Restaura sucursal anterior
             │
             └─► MenuContext recarga
                 productos de esa sucursal
```

## Llamadas API por Sucursal

```
Sucursal A (id: 1)
│
├─ GET /sucursales/1/productos
│  ├─ Producto A1 (precio: 100)
│  ├─ Producto A2 (precio: 200)
│  └─ Producto A3 (precio: 150)
│
├─ POST /api/ventas (sucursal_id: 1)
│  └─ Venta registrada en Sucursal A
│
└─ GET /reportes/por-fecha?sucursal=1
   └─ Reportes de Sucursal A


Sucursal B (id: 2)
│
├─ GET /sucursales/2/productos
│  ├─ Producto B1 (precio: 110)  ◄── Puede variar precio
│  ├─ Producto B2 (precio: 220)
│  └─ Producto B3 (precio: 160)
│
├─ POST /api/ventas (sucursal_id: 2)
│  └─ Venta registrada en Sucursal B
│
└─ GET /reportes/por-fecha?sucursal=2
   └─ Reportes de Sucursal B
```

## Timeline: Cambio de Sucursal

```
Tiempo │ Evento                    │ Estado
─────────────────────────────────────────────────
  0    │ Usuario abre ProfileScreen│
       │                           │ sucursal: A
       │                           │ productos: A
─────────────────────────────────────────────────
  1    │ Toca "Sucursal A ▼"       │
       │                           │ (sin cambio)
─────────────────────────────────────────────────
  2    │ Modal abre                │
       │ Muestra: [A✓, B]          │
─────────────────────────────────────────────────
  3    │ Selecciona B              │
       │                           │
─────────────────────────────────────────────────
  4    │ changeSucursal(B)         │
       │                           │ sucursal: B
       │ AuthContext actualiza     │
       │ AsyncStorage actualiza    │
─────────────────────────────────────────────────
  5    │ MenuContext detecta       │
       │ cambio en sucursal        │ (observador)
       │                           │
─────────────────────────────────────────────────
  6    │ useEffect triggers        │
       │ cargarProductos(B.id)     │ Llamada API
       │                           │
─────────────────────────────────────────────────
  7    │ API retorna productos B   │
       │                           │
─────────────────────────────────────────────────
  8    │ MenuContext.productos = B │
       │                           │ productos: B
─────────────────────────────────────────────────
  9    │ MenuScreen re-renderiza   │
       │ con productos B           │
       │                           │
─────────────────────────────────────────────────
  10   │ Usuario ve nuevos         │
       │ productos de Sucursal B   │ ✅ HECHO
─────────────────────────────────────────────────
```

## Control de Visibilidad

```
┌─────────────────────────────────────────┐
│        PROFILESCREEN - SELECTOR          │
├─────────────────────────────────────────┤
│                                         │
│ {isAdmin && sucursales.length > 0 ? (  │
│   ┌─────────────────────────────────┐  │
│   │ Sucursal: X ▼  (CLICKEABLE)     │  │ ← ADMIN
│   └─────────────────────────────────┘  │
│ ) : (                                   │
│   ┌─────────────────────────────────┐  │
│   │ Sucursal: X  (FIJO)             │  │ ← USUARIO
│   └─────────────────────────────────┘  │
│ )}                                      │
│                                         │
└─────────────────────────────────────────┘
```

## Escalabilidad

```
Caso: Usuario ADMIN con 5 sucursales

Estructura:
┌────────────────────────────────────────────┐
│  Usuario: admin@example.com                │
│  Rol: ADMIN                                │
│  Sucursales asignadas: [1, 2, 3, 4, 5]   │
└────────────────────────────────────────────┘
         │
         ├─ GET /api/sucursales
         │  └─ [{id: 1, nombre: "A"}, 
         │     {id: 2, nombre: "B"},
         │     {id: 3, nombre: "C"},
         │     {id: 4, nombre: "D"},
         │     {id: 5, nombre: "E"}]
         │
         └─ ProfileScreen muestra todas
            en un ScrollView (si necesario)

Selector Modal:
┌──────────────────────┐
│ Cambiar Sucursal     │
├──────────────────────┤
│ ✓ A (actual)         │ ◄─ Puede scrollear
│   B                  │   sin problema
│   C                  │
│   D                  │
│   E                  │
└──────────────────────┘
```

---

**Nota**: Este documento visual corresponde a la implementación de multi-sucursal completada el 6 de diciembre de 2025.
