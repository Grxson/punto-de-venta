# ⚡ GUÍA RÁPIDA - Sistema Multi-Sucursal

## 🚀 Quick Start (5 minutos)

### 1. Compilar
```bash
cd backend
./mvnw clean compile
# ✅ BUILD SUCCESS
```

### 2. Ejecutar
```bash
./start.sh
# Aplicación en http://localhost:8080
# H2 Console en http://localhost:8080/h2-console
```

### 3. Verificar Swagger
```
http://localhost:8080/swagger-ui.html
Buscar: "Sucursales"
```

---

## 📋 Estructura de Archivos

```
backend/src/main/java/com/puntodeventa/backend/
├── context/
│   └── SucursalContext.java            ← ThreadLocal para sucursal actual
├── security/
│   └── SucursalContextFilter.java      ← Interceptor HTTP
├── model/
│   └── SucursalProducto.java           ← Tabla intermedia
├── repository/
│   └── SucursalProductoRepository.java ← Queries optimizadas
├── service/
│   └── SucursalProductoService.java    ← Lógica de negocio
└── controller/
    └── SucursalController.java         ← Endpoints REST

backend/src/main/resources/db/migration/
└── V5__Create_SucursalProductos.sql    ← SQL de tabla
```

---

## 🔌 Endpoints Principales

```bash
# Obtener productos de mi sucursal
GET /api/sucursales/productos

# Obtener productos de una sucursal específica
GET /api/sucursales/{sucursalId}/productos

# Admin: Ver todas las sucursales
GET /api/sucursales/productos/todos-sucursales

# Cambiar contexto (admin con header)
GET /api/sucursales/productos
Header: X-Sucursal-Id: 2
```

---

## 🔐 Headers Principales

```bash
# Autenticación (siempre requerido)
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Cambiar sucursal (solo admin)
X-Sucursal-Id: 2
```

---

## 💾 Datos de Prueba

### Insertar datos iniciales
```sql
-- Asignar todos los productos a todas las sucursales
INSERT INTO sucursal_productos (sucursal_id, producto_id, disponible, orden_visualizacion)
SELECT s.id, p.id, 1, 0
FROM sucursales s
CROSS JOIN productos p
WHERE s.activo = 1 AND p.activo = 1;

-- Sucursal 1: Jugos (L-S, mañana)
UPDATE sucursal_productos
SET dias_disponibilidad = '{"dias": [1,2,3,4,5,6]}',
    horario_disponibilidad = '{"inicio": "06:00", "fin": "12:00"}'
WHERE sucursal_id = 1;

-- Sucursal 2: Alitas (V-D, noche)
UPDATE sucursal_productos
SET dias_disponibilidad = '{"dias": [5,6,7]}',
    horario_disponibilidad = '{"inicio": "18:00", "fin": "23:59"}'
WHERE sucursal_id = 2;
```

---

## 🧪 Pruebas cURL

### 1. Autenticarse
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan_sucursal1","password":"password123"}'

# Copiar token de respuesta
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 2. Ver productos de mi sucursal
```bash
curl -X GET http://localhost:8080/api/sucursales/productos \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 3. Ver sucursal actual
```bash
curl -X GET http://localhost:8080/api/sucursales/actual \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 4. Admin ve sucursal 2
```bash
curl -X GET http://localhost:8080/api/sucursales/2/productos \
  -H "Authorization: Bearer admin_token" | jq .
```

### 5. Ver todas las sucursales
```bash
curl -X GET http://localhost:8080/api/sucursales/productos/todos-sucursales \
  -H "Authorization: Bearer admin_token" | jq .
```

---

## 🔄 Flujo de Autenticación

```
1. POST /api/auth/login
   → Retorna JWT Token + sucursal_id

2. GET /api/sucursales/productos
   Header: Authorization: Bearer <token>
   
3. SucursalContextFilter intercepta:
   ✓ Valida JWT
   ✓ Obtiene username del token
   ✓ Busca Usuario en BD
   ✓ Lee Usuario.sucursal_id
   ✓ Establece SucursalContext.setSucursal(id, nombre)
   
4. SucursalProductoService.obtenerProductosDisponibles():
   - Lee SucursalContext.getSucursalId()
   - Filtra por esa sucursal automáticamente
   - Retorna solo esos productos
   
5. Response devuelve ProductoSucursalDTO[]
```

---

## 🛠️ Configuración Común

### Cambiar precio por sucursal
```sql
UPDATE sucursal_productos
SET precio_sucursal = 3.50
WHERE sucursal_id = 2 AND producto_id = 5;
```

### Deshabilitar producto en sucursal
```sql
UPDATE sucursal_productos
SET disponible = 0
WHERE sucursal_id = 1 AND producto_id = 3;
```

### Reordenar menú
```sql
UPDATE sucursal_productos
SET orden_visualizacion = 1
WHERE sucursal_id = 1 AND producto_id = 10;
```

---

## 🐛 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "No hay sucursal seleccionada" | Usuario sin autenticación | Verificar JWT token válido |
| 403 Forbidden | No es admin | Usar usuario ADMIN |
| Productos de otra sucursal | Caché vieja | Reiniciar app |
| Header X-Sucursal-Id ignorado | No es admin | Solo admins pueden cambiar |

---

## ✅ Checklist

- [x] SucursalContext.java creado
- [x] SucursalContextFilter.java creado  
- [x] SucursalProducto.java modelo
- [x] SucursalProductoRepository.java
- [x] SucursalProductoService.java
- [x] Endpoints en SucursalController
- [x] Migraciones SQL V5__Create_SucursalProductos.sql
- [x] SecurityConfig.java actualizado
- [x] Compilación ✅ BUILD SUCCESS
- [ ] Ejecutar migraciones
- [ ] Pruebas con datos reales
- [ ] Integración frontend

---

## 📊 Tablas de Base de Datos

### sucursal_productos
```
id              | sucursal_id | producto_id | precio_sucursal | disponible | orden_visualizacion
1               | 1           | 1           | NULL            | 1          | 0
2               | 1           | 2           | NULL            | 1          | 1
3               | 2           | 10          | 15.50           | 1          | 0
...
```

### ventas (con sucursal_id)
```
id | fecha | total | sucursal_id | estado
1  | ...   | 5.00  | 1           | cerrada
2  | ...   | 8.50  | 1           | cerrada
3  | ...   | 45.00 | 2           | cerrada
```

### gastos (con sucursal_id)
```
id | monto | sucursal_id | categoria_gasto_id
1  | 25.00 | 1           | 1
2  | 100.00| 2           | 3
```

---

## 🎯 Casos de Uso

### Caso 1: Empleado ve solo su sucursal
```
Usuario: juan_sucursal1 (sucursal_id=1)
GET /api/sucursales/productos
→ Solo ve productos de Sucursal 1
```

### Caso 2: Admin ve todas
```
Usuario: admin (sucursal_id=1, pero es ADMIN)
GET /api/sucursales/productos/todos-sucursales
→ Ve todas las sucursales y todos los productos

Con header X-Sucursal-Id: 2
→ Siguiente request filtra por Sucursal 2
```

### Caso 3: Venta se registra con sucursal
```
POST /api/v1/ventas
{items: [...], total: 5.00}

Se guarda automáticamente:
venta.sucursal_id = SucursalContext.getSucursalId() = 1
```

---

## 📞 Debugging

### Ver contexto de sucursal
```bash
# En logs, buscar:
# SucursalContextFilter: Estableciendo sucursal 1

# En endpoint:
GET /api/sucursales/actual
→ Retorna sucursal_id actual
```

### Verificar BD
```sql
-- Ver qué sucursal tiene cada usuario
SELECT username, sucursal_id FROM usuarios;

-- Ver productos de Sucursal 1
SELECT p.nombre FROM sucursal_productos sp
JOIN productos p ON sp.producto_id = p.id
WHERE sp.sucursal_id = 1 AND sp.disponible = 1;

-- Ver ventas por sucursal
SELECT COUNT(*) as cantidad, sucursal_id FROM ventas GROUP BY sucursal_id;
```

---

## 🔗 Relaciones

```
Usuario (N) ──→ (1) Sucursal
SucursalProducto (1) ←→ (1) Sucursal
SucursalProducto (1) ←→ (1) Producto
Venta (N) ──→ (1) Sucursal
Gasto (N) ──→ (1) Sucursal
```

---

## 🚀 Próximas Fases

1. **Tests unitarios** - Validar filtrado
2. **Integración frontend** - Cambiar sucursal en UI
3. **Reportes** - Ventas/gastos por sucursal
4. **WebSocket** - Notificaciones en tiempo real

---

**Listo para usar. ¡Buena suerte!** 🎉

