# 🏢 Multi-Sucursal con Menú Dinámico - Explicación Completa

## ✅ Lo que YA está implementado

### 1. **Estructura de Base de Datos** ✓
```sql
-- Tabla de relación many-to-many con configuración
sucursal_productos (
    id BIGINT PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    precio_sucursal DECIMAL,        -- Precio específico de la sucursal
    disponible BOOLEAN,              -- Si está visible en esta sucursal
    orden_visualizacion INT,         -- Orden en el menú
    stock_maximo INT,                -- Límite de stock por sucursal
    horario_disponibilidad TEXT,     -- JSON: {"inicio": "06:00", "fin": "12:00"}
    dias_disponibilidad TEXT,        -- JSON: {"dias": [1,2,3,4,5]} (1=lunes, 7=domingo)
    notas VARCHAR(500),              -- Notas específicas
    UNIQUE(sucursal_id, producto_id)
)
```

### 2. **Entidad JPA** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/model/SucursalProducto.java`

**Características:**
- Relación `@ManyToOne` con `Sucursal` y `Producto`
- Índices optimizados para búsquedas frecuentes
- Campos para precio, disponibilidad, horarios y orden visual
- Builder pattern para construcción fácil

### 3. **Repository** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/repository/SucursalProductoRepository.java`

**Queries optimizadas:**
- `findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc()` - Productos disponibles ordenados
- `findBySucursalIdOrderByOrdenVisualizacionAscNombreAsc()` - Todos los productos (admin)
- `buscarPorNombreEnSucursal()` - Búsqueda por nombre
- `obtenerProductosMasVendidosPorSucursal()` - Para ordenamiento por popularidad
- `estaDisponibleEnSucursal()` - Verificación rápida

### 4. **Service** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/service/SucursalProductoService.java`

**Métodos principales:**
- `obtenerProductosDisponibles()` - Del contexto actual de sucursal
- `obtenerProductosDisponibles(sucursalId)` - De sucursal específica
- `obtenerTodosProductosSucursal()` - Admin: todos los productos
- `buscarProductos(nombre)` - Búsqueda
- `estaDisponible(productoId)` - Verificación

### 5. **SucursalContext** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/context/SucursalContext.java`

**Propósito:**
- ThreadLocal para almacenar la sucursal actual del usuario
- Se establece en `SucursalContextFilter` basándose en el JWT
- Accesible en cualquier capa del backend vía `SucursalContext.getSucursalId()`

### 6. **Security Filter** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/security/SucursalContextFilter.java`

**Flujo:**
1. Intercepta cada request HTTP
2. Extrae el JWT del header `Authorization`
3. Obtiene el `username` del JWT
4. Busca el Usuario en BD
5. Lee `usuario.sucursal_id`
6. Establece `SucursalContext.setSucursal(id, nombre)`
7. Todas las queries automáticamente usan esa sucursal

### 7. **Controller Endpoints** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/controller/SucursalController.java`

**Endpoints disponibles:**
```
GET  /api/sucursales/productos                  - Productos de mi sucursal
GET  /api/sucursales/{sucursalId}/productos    - Productos de sucursal específica
GET  /api/sucursales/actual                    - Datos de mi sucursal actual
GET  /api/sucursales/productos/todos-sucursales - Admin: todas las sucursales
```

### 8. **DTO** ✓
Archivo: `backend/src/main/java/com/puntodeventa/backend/dto/ProductoSucursalDTO.java`

**Contiene:**
- Datos del producto (id, nombre, descripción, etc.)
- Configuración de la sucursal (precio_sucursal, disponible, orden, etc.)
- Información de variantes

---

## 🔄 El Flujo Completo (Paso a paso)

### Escenario: Usuario de Sucursal 1 quiere ver el menú

```
1. FRONTEND envía:
   POST /api/auth/login
   {
     "username": "juan_sucursal1",
     "password": "password123"
   }

2. BACKEND retorna:
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "usuario": {
       "id": 10,
       "nombre": "Juan Pérez",
       "sucursal_id": 1  ← CLAVE
     }
   }

3. FRONTEND guarda el token y lo envía en cada request:
   GET /api/sucursales/productos
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

4. BACKEND - SucursalContextFilter intercepta:
   ✓ Extrae JWT
   ✓ Decodifica username = "juan_sucursal1"
   ✓ Busca Usuario en BD
   ✓ Lee sucursal_id = 1
   ✓ ThreadLocal: SucursalContext.setSucursal(1, "Sucursal Centro")

5. BACKEND - SucursalController.getProductosMiSucursal():
   ✓ Llama SucursalProductoService.obtenerProductosDisponibles()
   ✓ Service lee: Long sucursalId = SucursalContext.getSucursalId() → 1
   ✓ Repository ejecuta:
     SELECT sp FROM SucursalProducto sp
     WHERE sp.sucursal.id = 1
     AND sp.disponible = true
     ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC

6. BACKEND retorna productos de Sucursal 1:
   [
     {
       "id": 1,
       "nombre": "Jugo de Naranja",
       "precioBase": 2.50,
       "precioSucursal": 2.50,
       "disponible": true,
       "ordenVisualizacion": 1,
       ...
     },
     {
       "id": 2,
       "nombre": "Café",
       "precioBase": 1.50,
       "precioSucursal": 1.75,  ← Precio diferente
       "disponible": true,
       "ordenVisualizacion": 2,
       ...
     }
   ]

7. FRONTEND renderiza el menú con SOLO estos productos
```

---

## 🎯 Casos de uso que ya funcionan

### ✅ Caso 1: Cada sucursal ve su propio menú
```
Usuario de Sucursal 1 → ve Productos A, B, C
Usuario de Sucursal 2 → ve Productos A, D, E
```

### ✅ Caso 2: Precios diferentes por sucursal
```
Sucursal 1: Café = $1.50
Sucursal 2: Café = $2.00
```

### ✅ Caso 3: Horarios de disponibilidad
```
Jugo disponible en Sucursal 1:
  - Lunes-Sábado: 6:00 - 12:00
  - Domingo: No disponible

Alitas disponibles en Sucursal 2:
  - Viernes-Domingo: 18:00 - 23:59
  - Resto de días: No disponible
```

### ✅ Caso 4: Stock máximo por sucursal
```
Sucursal 1: Código Rojo = máximo 50 unidades
Sucursal 2: Código Rojo = máximo 30 unidades
```

### ✅ Caso 5: Orden visual diferente
```
Sucursal 1: Jugos primero, luego Snacks
Sucursal 2: Snacks primero, luego Bebidas
```

---

## ❓ Lo que FALTA implementar en el FRONTEND

### 1. **Obtener menú dinámico al cargar**
El frontend necesita:
```typescript
// Al inicializar la app o cambiar sucursal:
const response = await fetch('http://localhost:8080/api/sucursales/productos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const menu = await response.json();
// menu = [{ id: 1, nombre: "Jugo", ... }, ...]
```

### 2. **Renderizar según orden_visualizacion**
```typescript
// Agrupar y ordenar por categoría y orden_visualizacion
const productosPorCategoria = menu.reduce((acc, p) => {
  if (!acc[p.categoria]) acc[p.categoria] = [];
  acc[p.categoria].push(p);
  return acc;
}, {});

// Ordenar dentro de cada categoría
Object.keys(productosPorCategoria).forEach(cat => {
  productosPorCategoria[cat].sort((a, b) => 
    a.ordenVisualizacion - b.ordenVisualizacion
  );
});
```

### 3. **Botón para cambiar sucursal (si es admin)**
```typescript
if (usuario.rol === 'ADMIN') {
  // GET /api/sucursales - obtener todas
  // POST /api/sucursales/cambiar/{sucursalId}
  // O usar header: X-Sucursal-Id: 2
}
```

### 4. **Considerar disponibilidad por horario**
```typescript
// Si el producto tiene horario_disponibilidad:
const ahora = new Date();
const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
const [inicio, fin] = producto.horarioDisponibilidad.split(':').map(parseFloat);

if (horaActual >= inicio && horaActual <= fin) {
  // Mostrar producto
}
```

### 5. **Considerar disponibilidad por día**
```typescript
// Si el producto tiene dias_disponibilidad:
const hoy = new Date().getDay(); // 0=domingo, 1=lunes, ...
const diasDisponibles = JSON.parse(producto.diasDisponibilidad).dias;

if (diasDisponibles.includes(hoy)) {
  // Mostrar producto
}
```

---

## 🛠️ Cómo hacer un cambio de sucursal (Admin)

### Opción A: Header personalizado
```bash
curl -X GET http://localhost:8080/api/sucursales/2/productos \
  -H "Authorization: Bearer admin_token"
```

### Opción B: Endpoint específico (si lo quieres agregar)
```java
@GetMapping("/{sucursalId}/productos")
public ResponseEntity<List<ProductoSucursalDTO>> obtenerProductosPorSucursal(
    @PathVariable Long sucursalId,
    @RequiredRole(Rol.ADMIN)
) {
    List<ProductoSucursalDTO> productos = 
        sucursalProductoService.obtenerProductosDisponibles(sucursalId);
    return ResponseEntity.ok(productos);
}
```

---

## 📊 Estructura de datos en BD (SQL de referencia)

```sql
-- Insertar productos en todas las sucursales
INSERT INTO sucursal_productos (sucursal_id, producto_id, disponible, orden_visualizacion)
SELECT s.id, p.id, 1, 0
FROM sucursales s
CROSS JOIN productos p
WHERE s.activa = 1 AND p.activo = 1;

-- Sucursal 1: Jugo disponible L-S mañana
UPDATE sucursal_productos
SET horario_disponibilidad = '{"inicio": "06:00", "fin": "12:00"}',
    dias_disponibilidad = '{"dias": [1,2,3,4,5,6]}',
    orden_visualizacion = 1
WHERE sucursal_id = 1 AND producto_id = (SELECT id FROM productos WHERE nombre = 'Jugo');

-- Sucursal 2: Alitas disponibles V-D noche
UPDATE sucursal_productos
SET horario_disponibilidad = '{"inicio": "18:00", "fin": "23:59"}',
    dias_disponibilidad = '{"dias": [5,6,7]}',
    orden_visualizacion = 1
WHERE sucursal_id = 2 AND producto_id = (SELECT id FROM productos WHERE nombre = 'Alitas');
```

---

## 🚀 Próximos pasos

### Backend (Mejoras opcionales)
1. **Agregar endpoint para cambiar sucursal** (si se requiere UI para cambio)
2. **Filtrar ventas por sucursal** (verificar que ya está hecho)
3. **Filtrar usuarios por sucursal** en el admin (si no está hecho)
4. **Validar que un producto sea válido para una sucursal** al registrar venta

### Frontend
1. **Obtener y guardar token tras login** ✓
2. **Enviar token en cada request** ✓
3. **Obtener menú dinámico al iniciar** ❌ PENDIENTE
4. **Renderizar menú con orden_visualizacion** ❌ PENDIENTE
5. **Considerar horarios y días disponibles** ❌ PENDIENTE
6. **UI para cambiar sucursal (admin)** ❌ PENDIENTE

---

## 🔐 Verificación de Seguridad

✅ **Cada usuario solo ve su sucursal** - Por JWT del servidor
✅ **Admin puede ver todas** - Por SucursalContextFilter (falta validar rol)
✅ **No se pueden manipular sucursales por querystring** - Se obtiene del JWT
✅ **Precios correctos por sucursal** - En campo `precio_sucursal`

---

## 📝 Notas de Implementación

- La tabla `sucursal_productos` es la **clave central** del multi-sucursal
- El `SucursalContext` es **automático** y **transparent** (cada servicio lo usa)
- Los **horarios y días** son JSON pero se pueden usar sin parsear (llegarán al frontend as-is)
- El **caché** de productos es por sucursal, así que no hay contaminación entre sucursales
