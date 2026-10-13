# 🏪 SISTEMA MULTI-SUCURSAL - Arquitectura Completa

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Modelos de Datos](#modelos-de-datos)
4. [Flujos de Funcionamiento](#flujos-de-funcionamiento)
5. [Endpoints REST](#endpoints-rest)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Filtrado Automático](#filtrado-automático)
8. [Casos de Uso Implementados](#casos-de-uso-implementados)
9. [Configuración por Sucursal](#configuración-por-sucursal)

---

## 🎯 Visión General

### Problema
El negocio tiene **2 sucursales con operaciones completamente independientes**:
- **Sucursal 1**: Vende jugos L-S (lunes-sábado) en la mañana (6am-12pm)
- **Sucursal 2**: Vende alitas V-D (viernes-domingo) en la noche (6pm-11:59pm)

Cada sucursal necesita:
- ✅ **Menú diferente** (sin mezclar productos)
- ✅ **Ventas independientes** (sin contar ventas de la otra sucursal)
- ✅ **Gastos independientes** (sin mezclar)
- ✅ **Reportes separados**
- ✅ **Admin puede ver todo**

### Solución
**Sistema Multi-Sucursal con Contexto Automático**:
- El usuario se autentica y se asigna automáticamente a su sucursal
- El `SucursalContext` mantiene la sucursal actual en **ThreadLocal**
- Cada request filtra datos automáticamente por sucursal
- Admin puede cambiar de sucursal con header `X-Sucursal-Id`

---

## 🏗️ Arquitectura

### Capas del Sistema

```
┌─────────────────────────────────────────────┐
│        Frontend (React Native)              │
│  - Muestra menú de sucursal actual          │
│  - Registra ventas/gastos                   │
│  - Envía header X-Sucursal-Id (si admin)    │
└──────────────┬──────────────────────────────┘
               │ HTTP Request + JWT Token
               ↓
┌──────────────────────────────────────────────┐
│  SecurityConfig + SecurityContextHolder      │
│  - Valida JWT Token                          │
│  - Autentifica usuario                       │
└──────────────┬───────────────────────────────┘
               │ Usuario autenticado
               ↓
┌──────────────────────────────────────────────┐
│    SucursalContextFilter                     │
│  - Obtiene usuario de BD                     │
│  - Lee su sucursal                           │
│  - Establece SucursalContext.setSucursal()   │
│  - Limpia al final del request               │
└──────────────┬───────────────────────────────┘
               │ SucursalContext listo
               ↓
┌──────────────────────────────────────────────┐
│     Controller / Service / Repository        │
│  - Llama SucursalContext.getSucursalId()     │
│  - Filtra queries por sucursal automáticamente
│  - Retorna solo datos de esa sucursal        │
└──────────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────┐
│      Base de Datos (PostgreSQL/MySQL)        │
│  - venta.sucursal_id = 1 o 2                 │
│  - gasto.sucursal_id = 1 o 2                 │
│  - sucursal_productos define qué vende cada una
└──────────────────────────────────────────────┘
```

### Componentes Principales

| Componente | Responsabilidad |
|-----------|-----------------|
| **SucursalContext** | ThreadLocal que mantiene sucursal actual |
| **SucursalContextFilter** | Establece contexto basado en usuario |
| **SucursalProducto** | Tabla intermedia: qué vende cada sucursal |
| **SucursalProductoRepository** | Queries optimizadas por sucursal |
| **SucursalProductoService** | Lógica de negocio |
| **SucursalController** | Endpoints REST |

---

## 📊 Modelos de Datos

### Tabla: `sucursal_productos`

Tabla intermedia **muchos a muchos** entre sucursales y productos.

```sql
CREATE TABLE sucursal_productos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id BIGINT NOT NULL,           -- Sucursal
    producto_id BIGINT NOT NULL,           -- Producto
    
    -- Configuración por sucursal
    precio_sucursal DECIMAL(12,2),         -- NULL = usa precio base
    disponible BOOLEAN DEFAULT 1,          -- Puedo deshabilitar sin eliminar
    orden_visualizacion INT,               -- Orden en menú
    stock_maximo INT,                      -- Límite de existencias
    
    -- Disponibilidad temporal
    horario_disponibilidad TEXT,           -- JSON {"inicio":"06:00","fin":"12:00"}
    dias_disponibilidad TEXT,              -- JSON {"dias":[1,2,3,4,5,6]} (lunes-sábado)
    
    notas VARCHAR(500),                    -- Ej: "Solo mañana", "Con helado"
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Restricciones
    UNIQUE(sucursal_id, producto_id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

### Relaciones

```
Sucursal (1) ←──→ (N) SucursalProducto (N) ←──→ (1) Producto

Resultado:
- Sucursal 1 vende: [Jugo Naranja, Jugo Fresa, Café]
- Sucursal 2 vende: [Alitas BBQ, Alitas Picantes, Cerveza]

Venta (N) ──→ (1) Sucursal (relacionado en Venta.java)
Gasto (N) ──→ (1) Sucursal (relacionado en Gasto.java)
```

---

## 🔄 Flujos de Funcionamiento

### Flujo 1: Empleado se autentica

```
1. Empleado (Sucursal 1) se conecta
   POST /api/auth/login
   {
     "username": "juan_sucursal1",
     "password": "***"
   }

2. Backend valida credenciales
   ↓
   Obtiene Usuario de BD
   - Usuario.sucursal_id = 1

3. Retorna JWT Token
   ↓
   Frontend almacena token

4. En siguiente request:
   GET /api/sucursales/productos
   Headers: Authorization: Bearer <jwt_token>

5. SucursalContextFilter intercepta:
   - Lee el JWT del header
   - Obtiene username del JWT
   - Busca Usuario en BD
   - Lee Usuario.sucursal_id = 1
   - Establece SucursalContext.setSucursal(1, "Sucursal 1")

6. ProductoService.obtenerProductosDisponibles():
   SELECT * FROM sucursal_productos
   WHERE sucursal_id = 1    ← Automático de SucursalContext
   AND disponible = 1

7. Retorna solo productos de Sucursal 1
```

### Flujo 2: Registrar venta

```
1. Empleado vende 2 jugos
   POST /api/v1/ventas
   {
     "items": [
       {"productoId": 1, "cantidad": 2, "precio": 2.50}
     ],
     "total": 5.00
   }

2. VentaService crea venta:
   Venta venta = new Venta();
   venta.setFecha(LocalDateTime.now());
   venta.setTotal(BigDecimal.valueOf(5.00));
   venta.setSucursal(
     Sucursal.findById(SucursalContext.getSucursalId())  ← De contexto
   );

3. Venta se guarda con sucursal_id = 1

4. En Sucursal 2, no ven esta venta
   (porque venta.sucursal_id ≠ 2)
```

### Flujo 3: Admin ve todas las sucursales

```
1. Admin se conecta
   POST /api/auth/login { "username": "admin", ... }
   
2. Backend obtiene:
   Usuario.sucursal_id = 1  (su sucursal por defecto)
   Usuario.rol = "ADMIN"

3. Admin quiere ver Sucursal 2
   GET /api/sucursales/2/productos
   Headers: 
     Authorization: Bearer <jwt_token>
     X-Sucursal-Id: 2        ← Header para cambiar contexto

4. SucursalContextFilter:
   - Valida que es ADMIN
   - Lee header X-Sucursal-Id: 2
   - Establece SucursalContext.setSucursal(2, "Sucursal 2")

5. Obtiene productos de Sucursal 2

6. Si admin hace:
   GET /api/sucursales/productos/todos-sucursales
   
   Obtiene TODOS los productos de TODAS las sucursales
   (porque ese endpoint no filtra)
```

---

## 📡 Endpoints REST

### 🔐 Autenticación (Sin cambio)

```bash
POST /api/auth/login
POST /api/auth/register
```

### 🏪 Información de Sucursal

#### GET `/api/sucursales/actual`
```bash
Obtiene información de la sucursal actual del usuario

GET /api/sucursales/actual
Headers: Authorization: Bearer <token>

Respuesta:
{
  "sucursalId": 1,
  "sucursalNombre": "Sucursal Centro",
  "direccion": "Calle Principal 123",
  "telefono": "555-0001",
  "email": "centro@ejemplo.com",
  "timestamp": "2025-12-06T10:30:00"
}
```

### 📦 Productos por Sucursal

#### GET `/api/sucursales/productos`
```bash
Obtiene productos disponibles de la sucursal ACTUAL del usuario

GET /api/sucursales/productos
Headers: Authorization: Bearer <token>

Respuesta (array de ProductoSucursalDTO):
[
  {
    "id": 1,
    "nombre": "Jugo Naranja",
    "precio": 2.50,
    "precioEfectivo": 2.50,
    "categoriaNombre": "Bebidas",
    "disponible": true,
    "ordenVisualizacion": 0,
    "diasDisponibilidad": "{\"dias\": [1,2,3,4,5,6]}",
    "horarioDisponibilidad": "{\"inicio\": \"06:00\", \"fin\": \"12:00\"}"
  }
]
```

#### GET `/api/sucursales/{sucursalId}/productos`
```bash
Obtiene productos de una sucursal específica

GET /api/sucursales/2/productos
Headers: Authorization: Bearer <token>

Nota: Cualquier usuario autenticado puede ver
(El filtrado real ocurre en la BD)
```

#### GET `/api/sucursales/{sucursalId}/productos/todos`
```bash
Obtiene TODOS los productos (incluyendo no disponibles)
⚠️  SOLO ADMIN

GET /api/sucursales/1/productos/todos
Headers: Authorization: Bearer <token>

Retorna también productos con disponible=false
```

#### GET `/api/sucursales/{sucursalId}/producto/{productoId}`
```bash
Obtiene detalle de un producto en una sucursal

GET /api/sucursales/1/producto/5
Headers: Authorization: Bearer <token>

Retorna ProductoSucursalDTO con información completa
```

#### GET `/api/sucursales/productos/todos-sucursales`
```bash
Obtiene TODOS los productos de TODAS las sucursales
⚠️  SOLO ADMIN

GET /api/sucursales/productos/todos-sucursales
Headers: Authorization: Bearer <token>

Retorna array con productos agrupados por sucursal
```

### 🔄 Cambio de Sucursal

#### POST `/api/sucursales/cambiar/{sucursalId}`
```bash
Cambia el contexto de sucursal (solo admin)

POST /api/sucursales/cambiar/2
Headers: Authorization: Bearer <token>

Respuesta:
{
  "sucursalId": 2,
  "sucursalNombre": "Sucursal Centro",
  "mensaje": "Contexto cambiado. Usa header: X-Sucursal-Id: 2"
}

Nota: El contexto se establece en el SIGUIENTE request
      si envías el header X-Sucursal-Id: 2
```

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Empleado de Sucursal 1

```bash
# 1. Se autentica
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juan_sucursal1",
    "password": "password123"
  }'

# Respuesta:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "username": "juan_sucursal1",
#   "sucursal_id": 1
# }

# 2. Guarda el token
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 3. Obtiene sus productos (automáticamente Sucursal 1)
curl -X GET http://localhost:8080/api/sucursales/productos \
  -H "Authorization: Bearer $TOKEN"

# Retorna solo productos de Sucursal 1

# 4. Registra una venta
curl -X POST http://localhost:8080/api/v1/ventas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productoId": 1, "cantidad": 2, "precio": 2.50}
    ],
    "total": 5.00,
    "estado": "cerrada"
  }'

# Venta se registra automáticamente con sucursal_id = 1
```

### Ejemplo 2: Admin viendo Sucursal 2

```bash
# 1. Admin se autentica
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# 2. Guarda el token
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 3. Por defecto, ve su sucursal (supongamos Sucursal 1)
curl -X GET http://localhost:8080/api/sucursales/productos \
  -H "Authorization: Bearer $TOKEN"

# 4. Quiere ver Sucursal 2
#    Opción A: Usar endpoint específico
curl -X GET http://localhost:8080/api/sucursales/2/productos \
  -H "Authorization: Bearer $TOKEN"

#    Opción B: Cambiar contexto con header (próximos requests)
curl -X GET http://localhost:8080/api/sucursales/productos \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Sucursal-Id: 2"

# 5. Ver TODAS las sucursales
curl -X GET http://localhost:8080/api/sucursales/productos/todos-sucursales \
  -H "Authorization: Bearer $TOKEN"
```

### Ejemplo 3: Configurar productos por sucursal

```sql
-- SQL directo en la BD

-- Sucursal 1: Jugos de lunes a sábado, mañana
INSERT INTO sucursal_productos 
(sucursal_id, producto_id, disponible, orden_visualizacion, 
 dias_disponibilidad, horario_disponibilidad)
VALUES 
(1, 1, 1, 0, 
 '{"dias": [1,2,3,4,5,6]}',           -- Lunes a Sábado
 '{"inicio": "06:00", "fin": "12:00"}' -- 6am a 12pm
);

-- Sucursal 2: Alitas de viernes a domingo, noche
INSERT INTO sucursal_productos 
(sucursal_id, producto_id, disponible, orden_visualizacion,
 dias_disponibilidad, horario_disponibilidad)
VALUES 
(2, 10, 1, 0,
 '{"dias": [5,6,7]}',                 -- Viernes a Domingo
 '{"inicio": "18:00", "fin": "23:59"}' -- 6pm a 11:59pm
);

-- Precio diferente en sucursal 2
UPDATE sucursal_productos
SET precio_sucursal = 15.50
WHERE sucursal_id = 2 AND producto_id = 10;

-- Deshabilitar producto en sucursal 1
UPDATE sucursal_productos
SET disponible = 0
WHERE sucursal_id = 1 AND producto_id = 5;
```

---

## 🔒 Filtrado Automático

### Cómo funciona

```java
// En SucursalProductoService
@Transactional(readOnly = true)
public List<ProductoSucursalDTO> obtenerProductosDisponibles() {
    // Este método SIEMPRE obtiene la sucursal del contexto
    Long sucursalId = SucursalContext.getSucursalId();  // ← Automático
    
    // La query filtra por esa sucursal
    return sucursalProductoRepository
        .findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc(sucursalId)
        .stream()
        .map(this::mapToDTO)
        .toList();
}

// En ProductoService
@Transactional(readOnly = true)
public List<Producto> obtenerProductosMenuActual() {
    Long sucursalId = SucursalContext.getSucursalId();  // ← Automático
    // Filtra productos de esa sucursal
    return productoRepository.findBySucursalId(sucursalId);
}

// En VentaService
public void registrarVenta(VentaDTO dto) {
    Long sucursalId = SucursalContext.getSucursalId();  // ← Automático
    
    Venta venta = new Venta();
    venta.setSucursal(sucursalRepository.findById(sucursalId).orElseThrow());
    // La venta se guarda con sucursal_id automáticamente
    ventaRepository.save(venta);
}
```

### Beneficios

✅ **Seguridad**: Imposible ver datos de otra sucursal sin permiso admin  
✅ **Automatización**: No necesitas pasar `sucursalId` en cada llamada  
✅ **Escalabilidad**: Funciona igual con 2 sucursales o 100  
✅ **Performance**: ThreadLocal es muy rápido  

---

## 📊 Casos de Uso Implementados

### Caso 1: Sucursales con productos diferentes
```
Sucursal 1 (Centro):
  - Jugo Naranja
  - Jugo Fresa
  - Café Espreso
  
Sucursal 2 (Noche):
  - Alitas BBQ
  - Alitas Picantes
  - Cerveza
```

### Caso 2: Mismos productos, horarios diferentes
```
Café disponible:
  Sucursal 1: Lunes-Sábado, 6am-12pm (mañana)
  Sucursal 2: Viernes-Domingo, 6pm-11pm (noche)
```

### Caso 3: Precios diferentes por sucursal
```
Jugo Naranja:
  Sucursal 1: $2.50
  Sucursal 2: $3.00 (con descuento de volumen en esta sucursal)
```

### Caso 4: Stock limitado
```
Alitas (stock_maximo):
  Sucursal 1: NULL (sin límite)
  Sucursal 2: 50 (solo 50 alitas por noche)
```

---

## ⚙️ Configuración por Sucursal

### Usando SQL

```sql
-- Insertar producto en sucursal
INSERT INTO sucursal_productos 
(sucursal_id, producto_id, precio_sucursal, disponible, orden_visualizacion)
VALUES (1, 5, 2.50, 1, 10);

-- Actualizar configuración
UPDATE sucursal_productos
SET precio_sucursal = 3.00, orden_visualizacion = 5
WHERE sucursal_id = 2 AND producto_id = 10;

-- Deshabilitar
UPDATE sucursal_productos
SET disponible = 0
WHERE sucursal_id = 1 AND producto_id = 3;
```

### Usando API (futuro)

```bash
# POST para asignar producto a sucursal
POST /api/sucursales/1/productos/asignar
{
  "productoId": 5,
  "precio": 2.50,
  "orden": 10
}

# PATCH para actualizar
PATCH /api/sucursales/1/productos/5
{
  "precio": 3.00,
  "disponible": false
}
```

---

## 🔧 Configuración en Backend

### Registrar filtro en SecurityConfig

```java
// Ya está hecho en SecurityConfig.java
http.addFilterAfter(sucursalContextFilter, JwtAuthenticationFilter.class);
```

### ThreadLocal - Cómo funciona

```java
// Establecer en el filtro
SucursalContext.setSucursal(1L, "Sucursal Centro");

// Obtener en cualquier servicio
Long sucursalId = SucursalContext.getSucursalId();
Optional<String> nombre = SucursalContext.getSucursalNombre();

// Limpiar al final (automático)
SucursalContext.clear();
```

### Caché - Invalidación automática

```java
@Cacheable(value = "productosSucursal", key = "#root.target.getSucursalIdFromContext()")
public List<ProductoSucursalDTO> obtenerProductosDisponibles() {
    // Se cachea por sucursal
    // Admin ve caché de Sucursal 1
    // Empleado de Sucursal 2 ve caché diferente
}
```

---

## 🎨 Integración Frontend (React Native)

```javascript
// src/hooks/useSucursal.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export function useSucursalActual() {
  const [sucursal, setSucursal] = useState(null);
  const [productos, setProductos] = useState([]);
  
  useEffect(() => {
    // Obtener sucursal actual
    api.get('/api/sucursales/actual')
      .then(res => setSucursal(res.data));
      
    // Obtener productos
    api.get('/api/sucursales/productos')
      .then(res => setProductos(res.data));
  }, []);
  
  return { sucursal, productos };
}

// En componente
export function MenuScreen() {
  const { sucursal, productos } = useSucursalActual();
  
  return (
    <View>
      <Text>Sucursal: {sucursal?.sucursalNombre}</Text>
      <FlatList
        data={productos}
        renderItem={({item}) => <ProductoCard producto={item} />}
      />
    </View>
  );
}
```

---

## ✅ Lista de Verificación de Implementación

- [x] Modelo `SucursalProducto` creado
- [x] Tabla `sucursal_productos` con migraciones
- [x] `SucursalContext` (ThreadLocal)
- [x] `SucursalContextFilter` en security chain
- [x] `SucursalProductoRepository` con queries
- [x] `SucursalProductoService` con caché
- [x] Endpoints REST en `SucursalController`
- [x] DTOs (`ProductoSucursalDTO`, `CambioSucursalDTO`)
- [x] Compilación exitosa ✅ BUILD SUCCESS
- [ ] Tests unitarios
- [ ] Integración frontend
- [ ] Testing con datos reales

---

## 🚀 Próximos Pasos

1. **Ejecutar migraciones** 
   ```bash
   ./start.sh
   ```

2. **Probar endpoints**
   ```bash
   curl http://localhost:8080/api/sucursales/productos
   ```

3. **Integrar en frontend React Native**

4. **Crear tests unitarios** para lógica de filtrado

5. **Validar con datos reales** de ambas sucursales

---

## 📞 Soporte

**Preguntas frecuentes:**

P: ¿Cómo cambio de sucursal siendo empleado?  
R: No puedes. Solo ADMIN puede cambiar con `X-Sucursal-Id` header.

P: ¿Dónde se guarda la sucursal actual?  
R: En ThreadLocal durante el request. Se limpia automáticamente.

P: ¿Qué pasa si elimino un usuario?  
R: Sus ventas/gastos se mantienen (borrado lógico del usuario).

P: ¿Puedo usar precios dinámicos?  
R: Sí, `sucursal_productos.precio_sucursal` sobreescribe el precio base.

P: ¿Cómo desabilito un producto en una sucursal?  
R: `UPDATE sucursal_productos SET disponible=0 WHERE...`

---

## 📚 Documentos Relacionados

- `docs/admin/operacion.md` - Operación diaria por sucursal
- `docs/admin/inventario.md` - Inventario independiente
- `docs/datos/modelo-datos.md` - Estructura de datos

