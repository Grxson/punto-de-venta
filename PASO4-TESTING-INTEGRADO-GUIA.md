# PASO 4: Testing Integrado - Guía Completa

## Objetivo General
Validar que el flujo **Compra → Receta → Venta → Merma** funciona correctamente de extremo a extremo, incluyendo:
- ✅ Integración Backend-Frontend
- ✅ Segregación de datos por sucursal
- ✅ Cálculos precisos (descuentos, costos, totales)
- ✅ Gestión de inventario
- ✅ UX/Notificaciones

---

## Pre-requisitos

### 1. Backend Corriendo
```bash
cd /home/grxson/Documentos/Github/punto-de-venta/backend
./start.sh
```
**Verificar**:
- ✅ Log: "Application started in X seconds"
- ✅ Acceso a: `http://localhost:8080/swagger-ui.html`
- ✅ H2 Console: `http://localhost:8080/h2-console` (si está en desarrollo)

### 2. Frontend Corriendo
```bash
cd /home/grxson/Documentos/Github/punto-de-venta/frontend-web
npm start
```
**Verificar**:
- ✅ Browser abre en `http://localhost:5173`
- ✅ Puedo acceder a dashboard
- ✅ Sidebar con todos los menús visibles

### 3. Logged In con Sucursal
- ✅ Usuario logueado (ver nombre en AppBar)
- ✅ Sucursal seleccionada (SucursalContext activo)

---

## Test Scenario 1: CREAR COMPRA

### Paso 1.1: Navegar a Sistema de Compras
1. Click en **Sidebar → "Compras"**
2. **Esperado**: Tabla vacía o con compras existentes

### Paso 1.2: Abrir Diálogo de Nueva Compra
1. Click en botón **"+ Nueva Compra"** (FAB azul en esquina inferior derecha)
2. **Esperado**: Diálogo se abre con form vacío

### Paso 1.3: Llenar Formulario
```
Proveedor: "Cafés Premium S.A."
Código Compra: "CPR-2025-001"
Ingrediente: Seleccionar "Café" (autocomplete)
Cantidad: 10
Unidad: "kg"
Precio Unitario: 25.50
```
**Validación**:
- ✅ Subtotal calcula automáticamente: 10 × 25.50 = 255.00
- ✅ Campo "Costo Total" es readonly

### Paso 1.4: Guardar Compra
1. Click en **"Guardar"**
2. **Esperado**:
   - Snackbar: "Compra registrada exitosamente"
   - Diálogo se cierra
   - Nueva compra aparece en tabla
   - Tabla muestra: Proveedor, Código, Ingrediente, Cantidad, Precio, Total

### Paso 1.5: Verificar en Backend
```bash
curl -X GET "http://localhost:8080/api/compras" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Esperado**:
```json
[
  {
    "id": 1,
    "proveedor": "Cafés Premium S.A.",
    "codigoCompra": "CPR-2025-001",
    "ingrediente": { "id": 1, "nombre": "Café", ... },
    "cantidad": 10,
    "unidad": "kg",
    "precioUnitario": 25.50,
    "costoTotal": 255.00,
    "fecha": "2025-12-19T10:00:00",
    ...
  }
]
```

---

## Test Scenario 2: CREAR RECETA

### Paso 2.1: Navegar a Recetas
1. Click en **Sidebar → "Recetas"**
2. **Esperado**: Tabla de recetas (si existen)

### Paso 2.2: Crear Nueva Receta
1. Click en **"+ Nueva Receta"** (FAB)
2. Llenar:
```
Nombre: "Espresso Simple"
Descripción: "Espresso básico"
Ingredientes:
  - Café: 50g (de compra anterior)
  - Agua: 200ml
Precio de Venta: 3.50
```
**Validación**:
- ✅ Costo base calcula: (50g/1000g × 25.50 × cantidad_agua_proporcion) + ...
- ✅ Se puede editar cantidad de ingredientes

### Paso 2.3: Guardar Receta
1. Click **"Guardar"**
2. **Esperado**: Snackbar + receta aparece en tabla

### Paso 2.4: Verificar Inventario
1. Click en **Sidebar → "Inventario"**
2. **Esperado**:
   - Ingrediente "Café" ahora muestra cantidad disponible
   - Después de crear compra: debería mostrar 10kg
   - (Cantidad no se resta hasta que se crea una VENTA)

---

## Test Scenario 3: CREAR VENTA CON DESCUENTO

### Paso 3.1: Navegar a Ventas (POS)
1. Click en **Sidebar → "Ventas"**
2. **Esperado**: Interfaz de POS con productos disponibles

### Paso 3.2: Agregar Producto a Venta
1. Click en **"Espresso Simple"** (receta creada en PASO 2)
2. **Esperado**:
   - Diálogo con opciones de cantidad
   - Precio unitario muestra: 3.50
   - Cantidad por defecto: 1

### Paso 3.3: Establecer Cantidad
```
Cantidad: 2
```
**Esperado**:
- Subtotal = 2 × 3.50 = 7.00
- Item aparece en tabla de "Venta Actual"

### Paso 3.4: Abrir Diálogo de Edición/Descuento
1. Click en ítem de venta (o botón edit)
2. Click en **"Editar Venta"**
3. **Esperado**: Diálogo se abre con opciones de edición

### Paso 3.5: Aplicar Descuento
```
Descuento: 1.00 (descuento de $1.00)
```
**Validación**:
- ✅ Campo acepta números decimales
- ✅ Descuento NO puede ser > Subtotal
- ✅ Resumen muestra:
  ```
  Subtotal: $7.00
  - Descuento: $1.00
  ─────────────────
  Total: $6.00
  ```

### Paso 3.6: Guardar Venta
1. Click **"Guardar"**
2. **Esperado**:
   - Snackbar: "Venta registrada exitosamente"
   - Venta se agrega a lista de ventas
   - Tabla en PosSales muestra: Producto, Cantidad, Precio, Descuento, Total
   - Inventario de "Café" se reduce en 100g (50g × 2 espressos)

### Paso 3.7: Verificar en Backend
```bash
curl -X GET "http://localhost:8080/api/ventas" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Esperado**:
```json
[
  {
    "id": 1,
    "productos": [...],
    "subtotal": 7.00,
    "descuento": 1.00,
    "total": 6.00,
    "fecha": "2025-12-19T10:05:00",
    ...
  }
]
```

### Paso 3.8: Verificar Inventario Reducido
1. Ir a **Sidebar → "Inventario"**
2. **Esperado**: 
   - Café: 9.95 kg (era 10kg, se restó 0.05kg = 50g × 2)
   - Agua: cantidad reducida según receta

---

## Test Scenario 4: REGISTRAR MERMA

### Paso 4.1: Navegar a Mermas
1. Click en **Sidebar → "Mermas"**
2. **Esperado**: Tabla vacía o con mermas previas

### Paso 4.2: Abrir Diálogo de Nueva Merma
1. Click en **"+ Registrar Merma"** (FAB)
2. **Esperado**: Diálogo con form vacío

### Paso 4.3: Llenar Formulario
```
Ingrediente: "Café" (autocomplete)
Cantidad: 0.5
Unidad: "kg"
Costo Unitario: 25.50 (autofill del ingrediente)
Motivo: "Grano defectuoso"
Fecha: 2025-12-19 (hoy)
```
**Validación**:
- ✅ Al seleccionar "Café", se auto-llena "Costo Unitario" con 25.50
- ✅ Costo Total calcula automáticamente: 0.5 × 25.50 = 12.75
- ✅ Campo "Costo Total" es readonly

### Paso 4.4: Guardar Merma
1. Click **"Guardar"**
2. **Esperado**:
   - Snackbar: "Merma registrada exitosamente"
   - Diálogo se cierra
   - Nueva merma aparece en tabla
   - Tabla muestra: Ingrediente, Cantidad, Unidad, Motivo, Costo Total, Fecha

### Paso 4.5: Verificar Inventario Nuevamente
1. Ir a **Sidebar → "Inventario"**
2. **Esperado**:
   - Café: 9.45 kg (era 9.95kg, se restó 0.5kg por merma)
   - Costo total de merma aparecer en reportes

### Paso 4.6: Verificar en Backend
```bash
curl -X GET "http://localhost:8080/api/inventario/mermas" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
**Esperado**:
```json
[
  {
    "id": 1,
    "ingrediente": { "id": 1, "nombre": "Café", ... },
    "cantidad": 0.5,
    "unidad": "kg",
    "motivo": "Grano defectuoso",
    "costoUnitario": 25.50,
    "costoTotal": 12.75,
    "fecha": "2025-12-19T10:10:00",
    ...
  }
]
```

---

## Test Scenario 5: FLUJO SEGREGADO POR SUCURSAL

### Paso 5.1: Cambiar Sucursal
1. Si hay múltiples sucursales:
   - Selector de sucursal en AppBar o Sidebar
   - Click en Sucursal B
2. **Esperado**:
   - Todos los datos (Ventas, Compras, Mermas) son DIFERENTES
   - Inventario está segregado

### Paso 5.2: Crear Compra en Sucursal B
1. Sistema de Compras → Nueva Compra
2. Mismo ingrediente (Café) pero diferente cantidad
3. **Esperado**:
   - Sucursal A sigue mostrando sus 9.45kg
   - Sucursal B muestra su cantidad propia
   - Backend retorna datos segregados por sucursal

---

## Test Scenario 6: VALIDACIONES Y EDGE CASES

### Test 6.1: Descuento Mayor a Subtotal
1. En PosSales, crear venta con Subtotal = 5.00
2. Intentar aplicar Descuento = 10.00
3. **Esperado**: 
   - Campo NO permite valor > subtotal (validación)
   - O reduce automáticamente a máximo permitido (5.00)
   - Total nunca es negativo

### Test 6.2: Cantidad Negativa en Merma
1. En AdminMermas, intentar registrar Cantidad = -1
2. **Esperado**: Validación rechaza cantidad negativa

### Test 6.3: Ingrediente Inexistente en Receta
1. Crear receta sin ingredientes
2. **Esperado**: Validación requiere al menos 1 ingrediente

### Test 6.4: Duplicado de Compra
1. Crear 2 compras con mismo "Código Compra"
2. **Esperado**: Sistema permite o rechaza según negocio
   - Si rechaza: Snackbar "Código de compra ya existe"
   - Si permite: Crear 2 registros (sistema usa ID único)

---

## Checklist de Validación

### Backend Checks
- [ ] Todo endpoint `/api/` retorna 200 o error apropiado
- [ ] Datos segregados correctamente por `sucursalId`
- [ ] Cálculos (descuentos, costos, totales) son precisos
- [ ] Validaciones previenen datos inválidos
- [ ] Timestamps (fecha/hora) se guardan correctamente
- [ ] Logs muestran operaciones (ej: "💰 Venta: Subtotal=..., Descuento=..., Total=...")

### Frontend Checks
- [ ] Formularios validan antes de enviar
- [ ] Snackbars notifican éxito/error
- [ ] Tablas actualizan sin recargar página
- [ ] Cálculos locales (descuento, total) son correctos
- [ ] Autocompletions funcionan
- [ ] Campos readonly están protegidos
- [ ] Confirmaciones de delete funcionan

### Integración Checks
- [ ] Crear en Backend → aparece en Frontend
- [ ] Editar en Frontend → se persiste en Backend
- [ ] Eliminar en Frontend → se elimina en Backend
- [ ] Inventario se actualiza en tiempo real
- [ ] Reportes muestran datos correctos

### UX Checks
- [ ] Botones FAB son visibles
- [ ] Diálogos se cierran correctamente
- [ ] Errores se muestran claros
- [ ] No hay console errors (F12 → Console)
- [ ] Responsive en mobile (si aplica)

---

## Comandos útiles para Testing

### Ver Logs del Backend
```bash
# Terminal donde corre backend
# O:
curl -X GET "http://localhost:8080/actuator/health" \
  -H "Authorization: Bearer TOKEN"
```

### Ver BD en Desarrollo (H2)
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb
User: sa
Password: (blank)
```

### Limpiar Datos para Restart
```bash
# Si está usando H2 en-memory, restart backend limpia automáticamente
# Si está usando DB persistente:
DELETE FROM merma;
DELETE FROM venta;
DELETE FROM compra;
DELETE FROM receta;
DELETE FROM ingrediente;
```

### Verificar Endpoint con curl
```bash
# Obtener todas las mermas (requiere token)
curl -X GET "http://localhost:8080/api/inventario/mermas" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Crear nueva merma
curl -X POST "http://localhost:8080/api/inventario/mermas" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredienteId": 1,
    "cantidad": 0.5,
    "unidad": "kg",
    "motivo": "Grano defectuoso",
    "costoUnitario": 25.50
  }'
```

---

## Problemas Comunes y Soluciones

### Problema: "Backend no accesible (Connection refused)"
**Solución**:
1. Verificar que `./start.sh` está corriendo
2. Verificar puerto 8080 está libre: `netstat -an | grep 8080`
3. Revisar logs del backend para errores

### Problema: "Token inválido o expirado"
**Solución**:
1. Logout → Login nuevamente
2. Verificar token en LocalStorage (F12 → Application → Local Storage)
3. Si sigue error, backend rechaza token

### Problema: "Datos no actualizan en tabla"
**Solución**:
1. Hacer F5 (refresh página)
2. Revisar console del browser (F12 → Console)
3. Verificar API response en Network tab

### Problema: "Validación rechaza descuento válido"
**Solución**:
1. Verificar que descuento es número (no string)
2. Verificar que subtotal se calculó correctamente
3. Revisar logs backend para error de validación

### Problema: "Inventario no se reduce tras venta"
**Solución**:
1. Verificar que receta tiene ingredientes correctos
2. Verificar que ingrediente tiene cantidad disponible
3. Revisar logs backend para cálculos de inventario

---

## Resultado Esperado Final

Después de completar todos los tests:

✅ **Sistema de Compras**
- Crear, leer, actualizar, eliminar compras
- Tabla muestra datos correctamente
- Backend persiste datos

✅ **Sistema de Ventas**
- Crear ventas con múltiples productos
- Aplicar descuentos
- Cálculos de total son precisos
- Inventario se reduce

✅ **Sistema de Mermas**
- Registrar mermas por ingrediente
- Cálculo automático de costo
- Inventario afectado correctamente

✅ **Segregación**
- Datos separados por sucursal
- User solo ve su sucursal

✅ **Integridad**
- No hay errores en console
- Logs muestran operaciones esperadas
- BD consistente con UI

---

**Fecha**: 2025-12-19  
**Versión**: 1.0
