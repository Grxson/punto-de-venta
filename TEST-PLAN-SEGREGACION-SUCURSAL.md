# 🧪 PLAN DE TESTS - VERIFICACIÓN PRÁCTICA DE SEGREGACIÓN

**Objetivo:** Confirmar prácticamente que cada acción se guarda con el sucursal_id correcto

---

## TEST 1: CREAR GASTO CON USUARIO SUCURSAL 2

### Paso 1: Login
```bash
# Terminal - GET el token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vendedor_sucursal_2",
    "password": "password"
  }'
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "usuario": {
      "id": 15,
      "username": "vendedor_sucursal_2",
      "rol": { "id": 2, "nombre": "VENDEDOR" },
      "sucursalId": 2,
      "idSucursal": 2,
      "nombre": "Vendedor Sucursal 2"
    }
  }
}
```

**⭐ Verificar:** `sucursalId: 2` ✅

### Paso 2: Crear Gasto
```bash
# Guardar el token en variable
TOKEN="eyJhbGciOiJIUzI1NiJ9..."

# Crear gasto CON sucursalId incorrecto en body (será ignorado)
curl -X POST http://localhost:8080/api/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "monto": 75000,
    "categoriaGastoId": 1,
    "nota": "Test gasto sucursal 2",
    "fecha": "2025-12-08T10:00:00",
    "sucursalId": 999
  }'
```

**Response esperado:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "monto": 75000,
    "nota": "Test gasto sucursal 2",
    "sucursal": {
      "id": 2,
      "nombre": "Sucursal 2"
    }
  }
}
```

**⭐ Verificar:** `sucursal.id: 2` (NO 999) ✅

### Paso 3: Verificar en BD
```sql
SELECT id, monto, nota, sucursal_id FROM gastos 
WHERE id = 1;

-- Resultado esperado:
-- | id | monto | nota                      | sucursal_id |
-- | 1  | 75000 | Test gasto sucursal 2     | 2           |
```

**⭐ Verificar:** `sucursal_id = 2` ✅

---

## TEST 2: CREAR GASTO CON USUARIO SUCURSAL 1

### Paso 1: Login con otro usuario
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vendedor_sucursal_1",
    "password": "password"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "eyJ...",
    "usuario": {
      "sucursalId": 1
    }
  }
}
```

**⭐ Verificar:** `sucursalId: 1` ✅

### Paso 2: Crear Gasto
```bash
TOKEN="nuevo_token..."

# Mismo gasto, CON sucursalId: 999 (será ignorado)
curl -X POST http://localhost:8080/api/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "monto": 50000,
    "categoriaGastoId": 2,
    "nota": "Test gasto sucursal 1",
    "fecha": "2025-12-08T11:00:00",
    "sucursalId": 999
  }'
```

### Paso 3: Verificar en BD
```sql
SELECT id, monto, nota, sucursal_id FROM gastos 
WHERE nota LIKE 'Test gasto sucursal 1';

-- Resultado esperado:
-- | id | monto | nota                      | sucursal_id |
-- | 2  | 50000 | Test gasto sucursal 1     | 1           |
```

**⭐ Verificar:** `sucursal_id = 1` (NO 999) ✅

---

## TEST 3: USUARIO SUCURSAL 2 INTENTA VER DATOS DE SUCURSAL 1

### Paso 1: Login con usuario sucursal 2
```bash
TOKEN_S2="eyJ..." # Token de sucursal 2
```

### Paso 2: Intentar listar gastos
```bash
curl -X GET http://localhost:8080/api/gastos \
  -H "Authorization: Bearer $TOKEN_S2"
```

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "monto": 75000,
      "sucursal": { "id": 2, "nombre": "Sucursal 2" }
    }
  ]
}
```

**⭐ Verificar:** 
- Solo aparece el gasto con id=1 (sucursal_id=2) ✅
- El gasto con id=2 (sucursal_id=1) NO aparece ✅

---

## TEST 4: EDITAR GASTO (VERIFICAR PROPIEDAD)

### Paso 1: Usuario sucursal 2 intenta editar gasto de sucursal 1
```bash
TOKEN_S2="eyJ..."

curl -X PUT http://localhost:8080/api/gastos/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_S2" \
  -d '{
    "monto": 999999,
    "categoriaGastoId": 1,
    "nota": "Intento de hack",
    "fecha": "2025-12-08T11:00:00"
  }'
```

**Response esperado:**
```json
{
  "success": false,
  "error": "403 Forbidden - No tienes acceso a este gasto"
}
```

**⭐ Verificar:** Retorna 403, no 200 ✅

### Paso 2: Verificar BD no cambió
```sql
SELECT id, monto, sucursal_id FROM gastos WHERE id = 2;
-- Resultado: monto sigue siendo 50000 ✅
```

---

## TEST 5: CREAR PRODUCTO (SUCURSAL AUTO-ASIGNADA)

### Paso 1: Login usuario sucursal 2
```bash
TOKEN_S2="eyJ..."

curl -X POST http://localhost:8080/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_S2" \
  -d '{
    "nombre": "Café Premium",
    "descripcion": "Café 100% arabica",
    "precio": 45000,
    "categoriaProductoId": 1,
    "subcategoriaId": 1,
    "sucursalId": 999
  }'
```

### Paso 2: Verificar Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Café Premium",
    "sucursal": {
      "id": 2,
      "nombre": "Sucursal 2"
    }
  }
}
```

**⭐ Verificar:** Producto asignado a sucursal_id=2 (NO 999) ✅

---

## TEST 6: CREAR VENTA (SUCURSAL AUTO-ASIGNADA)

### Paso 1: Login usuario sucursal 1
```bash
TOKEN_S1="eyJ..."

curl -X POST http://localhost:8080/api/ventas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_S1" \
  -d '{
    "clienteId": 1,
    "items": [
      {
        "productoVarianteId": 1,
        "cantidad": 2,
        "precioUnitario": 5000
      }
    ],
    "metodoPago": "EFECTIVO",
    "total": 10000,
    "descuento": 0,
    "sucursalId": 999
  }'
```

### Paso 2: Verificar en BD
```sql
SELECT id, total, sucursal_id FROM ventas ORDER BY id DESC LIMIT 1;

-- Resultado esperado:
-- | id | total | sucursal_id |
-- | 1  | 10000 | 1           |
```

**⭐ Verificar:** `sucursal_id = 1` (NO 999) ✅

---

## TEST 7: VERIFICAR LOGS DEL BACKEND

### Buscar en logs:
```
[SucursalContextFilter] ✅ Sucursal obtenida del JWT: 2
[SucursalContextFilter] 📍 SucursalContextFilter establecido: ID=2, Nombre=Sucursal 2

[GastoService] 📝 Creando gasto en sucursal 2
[GastoService] 💾 Gasto 1 confirmado en BD. Tiempo transacción: 45ms

[SucursalContextFilter] 🧹 Limpiando SucursalContext
```

**⭐ Verificar:** Cada operación logea sucursal correcta ✅

---

## CHECKLIST DE VERIFICACIÓN FINAL

```
┌─────────────────────────────────────────────┬────────┐
│ VERIFICACIÓN                                │ STATUS │
├─────────────────────────────────────────────┼────────┤
│ Test 1: Gasto S2 con request 999 = 2       │ ✅     │
│ Test 2: Gasto S1 con request 999 = 1       │ ✅     │
│ Test 3: S2 solo ve sus datos               │ ✅     │
│ Test 4: S2 no puede editar datos de S1     │ ✅     │
│ Test 5: Producto auto-asignado a S2        │ ✅     │
│ Test 6: Venta auto-asignada a S1           │ ✅     │
│ Test 7: Logs muestran segregación correcta │ ✅     │
├─────────────────────────────────────────────┼────────┤
│ TOTAL                                       │ 7/7    │
└─────────────────────────────────────────────┴────────┘

Si todos los tests pasan: ✅ SEGREGACIÓN COMPLETAMENTE FUNCIONAL
```

---

## RESULTADO ESPERADO

Si ejecutas los tests y TODOS pasan, puedes confirmar:

✅ **El sistema está 100% segregado por sucursal**
✅ **Cualquier acción se guarda automáticamente con sucursal_id correcto**
✅ **No hay forma de acceder/modificar datos de otra sucursal**
✅ **El backend ignora sucursalId enviado en request (usa JWT)**
✅ **La segregación es a nivel de código y BD**

---

**Nota:** Estos tests asumen que tienes:
- Backend corriendo en http://localhost:8080
- BD con usuarios en sucursales 1 y 2
- Usuarios: `vendedor_sucursal_1`, `vendedor_sucursal_2` con password: `password`
- La app está compilada: `BUILD SUCCESS`
