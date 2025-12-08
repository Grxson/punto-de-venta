# 🔍 DIAGNÓSTICO - Problemas de Categoría y Segregación

**Fecha:** 8 de Diciembre 2025
**Estado:** Diagnóstico completado

---

## 📋 PROBLEMAS REPORTADOS POR EL USUARIO

### 1️⃣ Componentes muestran `[CATEGORIA] - Nombre`
```
❌ Problema: Producto se muestra como "[SUB] prueba - Mediano"
❌ Impacto: Visualmente feo, confunde al usuario
❌ Ejemplo BD: producto_nombre = '[SUB] prueba - Mediano'
```

### 2️⃣ DailyStats mezclando datos de sucursales
```
❌ Problema: Usuario de sucursal 2 ve datos de sucursal 1
❌ Reporte: Venta $4 efectivo en sucursal 2, pero muestra en sucursal 1
❌ Afecta: Resumen del día, gastos, estadísticas
```

---

## 🔎 INVESTIGACIÓN REALIZADA

### Búsqueda de Código: `[CATEGORIA]`

**Ubicación encontrada:**
```
Archivo: /frontend-web/src/components/productos/ProductoForm.tsx
Línea:   320
Código:  nombreFinal = `[${subcategoria.toUpperCase()}] ${nombreFinal}`;
```

**Impacto:**
- Al crear producto, si selecciona subcategoría, prefija nombre con `[SUBCATEGORIA]`
- Ejemplo: "prueba" + subcategoria "SUB" → `[SUB] prueba`
- Se guarda así en BD, se muestra así en frontend

---

### Búsqueda de Segregación en BD

**Queries ejecutadas:**

#### Query 1: Ventas por sucursal
```
sucursal_id | ventas | monto    
    1       |   43   | 14230.00
    2       |    1   |     4.00
```

#### Query 2: Gastos por sucursal
```
sucursal_id | gastos | monto   
    1       |   36   | 3004.00
    2       |    0   |    0
```

#### Query 3: Venta sucursal 2
```
ID: 68
Sucursal: 2
Fecha: 2025-12-08 09:45:42
Total: $4.00
Producto: [SUB] prueba - Mediano (x2 a $2.00 c/u)
```

**✅ RESULTADO:** Datos en BD están CORRECTAMENTE SEGREGADOS
- Sucursal 2: 1 venta, $4.00
- Sucursal 1: 43 ventas, $14230.00
- NO hay mezcla en la BD

---

### Búsqueda de Segregación en Backend

**Endpoints analizados:**

1. **EstadisticasController.java**
   - `/api/estadisticas/ventas/dia` → Llama a `estadisticasService.resumenDia(fecha)`

2. **EstadisticasService.java** (línea 47)
   ```java
   public ResumenVentasDiaDTO resumenRango(...) {
       Long sucursalId = SucursalContext.getSucursalId();  // ✅ SEGREGACIÓN PRESENTE
       
       ResumenVentasAggregate agg = ventaRepository
           .aggregateResumenBySucursal(sucursalId, desde, hasta);  // ✅ Filtra por sucursal
       
       BigDecimal totalGastos = gastoRepository
           .sumMontoByTipoGastoAndSucursalAndFechaBetween(..., sucursalId, ...); // ✅ Filtra por sucursal
   }
   ```

**✅ RESULTADO:** Backend YA tiene segregación correcta en código

---

## 🎯 CONCLUSIONES

### Problema 1: `[CATEGORIA] - Nombre`
```
CAUSA:        ProductoForm.tsx línea 320 añade prefijo
UBICACIÓN:    Frontend (TypeScript)
ARCHIVO:      /frontend-web/src/components/productos/ProductoForm.tsx
LÍNEA:        320
GRAVEDAD:     MEDIA (cosmético, pero confuso)
SOLUCIÓN:     Quitar prefijo o hacerlo opcional
```

### Problema 2: Mezcla de datos en DailyStats
```
CAUSA:        ❌ MISTERIO - Los datos están segregados en BD y backend
UBICACIÓN:    ??? (investigación continúa)
ANÁLISIS:     
  ✅ BD: Datos segregados correctamente
  ✅ Backend: EstadisticasService filtra por SucursalContext
  ❓ Frontend: ¿Token correcto? ¿SucursalContext se inicializa bien?
  ❓ Network: ¿Request incluye header Authorization correcto?
GRAVEDAD:     ALTA (data leakage)
SOLUCIÓN:     Verificar logs del filter y frontend
```

---

## 📊 DATOS ACTUALES EN BD

```
TABLA: ventas
┌────┬─────────────┬──────────┬────────┐
│ id │ sucursal_id │ total    │ estado │
├────┼─────────────┼──────────┼────────┤
│ 68 │      2      │  4.00    │ cierre │
│ 67 │      1      │ 125.00   │ cierre │
│ 66 │      1      │ 845.00   │ cierre │
│... │     ...     │   ...    │  ...   │
└────┴─────────────┴──────────┴────────┘

TABLA: gastos
┌────┬─────────────┬─────────┐
│ id │ sucursal_id │ monto   │
├────┼─────────────┼─────────┤
│ .. │      1      │ 3004.00 │
│ .. │      1      │  ...    │
│ .. │      1      │  ...    │
└────┴─────────────┴─────────┘

Sucursal 2: 0 gastos registrados
```

---

## 🔄 FLUJO CUANDO USUARIO ACCEDE A DailyStats

```
1. Frontend login (usuario dev, sucursal 2)
   ├─ Lee: username=dev, password=xxx
   └─ Token JWT contiene: sucursal_id=2

2. Frontend llama: GET /api/estadisticas/ventas/dia
   ├─ Header: Authorization: Bearer <JWT con sucursal_id=2>
   └─ Query params: fecha=2025-12-08

3. Backend SucursalContextFilter intercepta
   ├─ Extrae JWT
   ├─ Obtiene sucursal_id=2 del token
   ├─ Establece SucursalContext.setSucursal(2, "Sucursal 2")
   └─ Continúa request

4. EstadisticasService.resumenDia(fecha)
   ├─ Lee: Long sucursalId = SucursalContext.getSucursalId()  // Debe ser 2
   ├─ Query: SELECT ... WHERE v.sucursal_id = 2  // BD retorna 1 venta $4
   └─ Response: totalVentas=4.00, totalGastos=0

5. Frontend recibe respuesta
   ├─ totalVentas=4.00
   ├─ totalGastos=0
   └─ Muestra en DailyStats
```

**¿Dónde falla?** Si muestra $0 venta y ves datos de sucursal 1, significa:
- SucursalContext NO está siendo 2
- O JWT no contiene sucursal_id
- O SucursalContextFilter no inicializa correctamente

---

## 📝 PASOS PARA REPRODUCIR EL BUG

1. Login como **dev** (sucursal 2)
2. Ir a **Admin → Resumen del Día**
3. **Esperado:** Venta $4.00, Gastos $0
4. **Real:** ??? (usuario reportó que ve datos de sucursal 1)

---

## 🛠️ FIXES REQUERIDOS

### Fix 1: Quitar prefijo `[CATEGORIA]`
- **Archivo:** `/frontend-web/src/components/productos/ProductoForm.tsx`
- **Línea:** 320
- **Cambio:** Remover o comentar la línea del prefijo
- **Impacto:** Productos se mostrarán como "prueba - Mediano" en lugar de "[SUB] prueba - Mediano"

### Fix 2: Investigar segregación en DailyStats
- **Pasos:**
  1. Revisar logs de `SucursalContextFilter` cuando dev hace login
  2. Confirmar que SucursalContext.setSucursal(2, ...) se ejecuta
  3. Verificar token JWT tiene sucursal_id=2
  4. Validar que EstadisticasService recibe sucursalId=2

---

## 📦 ARCHIVOS RELEVANTES

### Frontend
- `/frontend-web/src/components/productos/ProductoForm.tsx` (línea 320) - PREFIJO
- `/frontend-web/src/components/DailyStatsPanel.tsx` (línea 69) - Llama a STATS_DAILY
- `/frontend-web/src/config/api.config.ts` (línea 107) - Endpoint `/estadisticas/ventas/dia`

### Backend
- `/backend/src/main/java/.../security/SucursalContextFilter.java` - FILTRO DE CONTEXTO
- `/backend/src/main/java/.../controller/EstadisticasController.java` - ENDPOINT
- `/backend/src/main/java/.../service/EstadisticasService.java` (línea 47) - SEGREGACIÓN
- `/backend/src/main/java/.../security/JwtUtil.java` - EXTRACCIÓN DE TOKEN

---

## ✅ PRÓXIMOS PASOS

1. **Fix Inmediato:** Quitar prefijo `[CATEGORIA]` en ProductoForm.tsx
2. **Investigación:** Revisar logs de SucursalContextFilter
3. **Verificación:** Ejecutar test manual con credenciales dev
4. **Documentación:** Crear guía de segregación para futuros desarrolladores

---

**Diagnóstico completado. Listos para fixes.**
