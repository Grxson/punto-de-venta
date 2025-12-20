# 🔍 DIAGNÓSTICO: ERRORES EN REPORTES Y ESTADÍSTICAS

## 📋 PROBLEMAS REPORTADOS

1. **Cortes Generales**: No detecta todos los datos, números inconsistentes
2. **Corte por Producto**: No detecta gastos, cálculos incorrectos
3. **Razón**: Cambio de `precioUnitario` → `precioTotal` en compras

---

## 🔎 ANÁLISIS DE FLUJO

### 1. COMPRAS (Backend - CompraItem.java)
```
ANTES:
  cantidad = 1
  precioUnitario = $52 ❌ (ambiguo: ¿es total o unitario?)
  subtotal = cantidad × precioUnitario = $52

DESPUÉS:
  cantidad = 1
  precioTotal = $52.00 ✅ (claro: total gastado)
  precioUnitario = precioTotal ÷ cantidad = $52 (calculado automático)
  subtotal = precioTotal = $52
```

### 2. INGREDIENTES (Backend - Ingrediente.java)
```
Cuando se guarda una compra, se actualiza:
  ingrediente.costoUnitarioBase = compraItem.precioUnitario

Con el cambio:
  costoUnitarioBase se actualiza CORRECTAMENTE desde precioUnitario (calculado)
```

### 3. VENTAS (Backend - VentaItem.java)
```
Cuando se vende un producto, se calcula:
  costoEstimado = cantidad × ingrediente.costoUnitarioBase

Ejemplo:
  - Receta usa 0.5 kg Naranja
  - costoUnitarioBase = $9.00/kg
  - costoEstimado = 0.5 × $9.00 = $4.50 ✅
```

### 4. REPORTES (Backend - EstadisticasService.java)
```
Calcula totales de:
  - totalVentas = SUM(venta.total)
  - totalCostos = SUM(ventaItem.costoEstimado) + gastos operacionales
  - margenBruto = totalVentas - totalCostos
```

---

## 🐛 POSIBLES CAUSAS DE ERROR

### Causa 1: Compras Antiguas Sin precioUnitario Calculado
```
❌ PROBLEMA:
Si hay compras antiguas guardadas con precioUnitario = NULL:
  - costoUnitarioBase quedó sin actualizar
  - ventaItem.costoEstimado = 0
  - totalCostos aparece bajo artificialmente

✅ SOLUCIÓN:
Migrar BD: Recalcular precioUnitario = precioTotal ÷ cantidad
```

### Causa 2: Gastos No Se Suman Correctamente
```
❌ PROBLEMA:
EstadisticasService.resumenRango() suma:
  totalGastos = gastoRepository.sumMontoByTipoGastoAndSucursalAndFechaBetween(...)

Si hay más tipos de gasto (no solo "Operacional"):
  - Los otros gastos no se incluyen
  - totalGastos = bajo, margenBruto = alto artificialmente

✅ SOLUCIÓN:
Cambiar query para sumar TODOS los gastos, no solo "Operacional"
```

### Causa 3: Errores de Conversión de Tipos
```
❌ PROBLEMA:
En frontend, si parseFloat() falla en algún lado:
  - gastosDia = 0
  - totalCostos = 0
  - margenPorcentaje = NaN

✅ SOLUCIÓN:
Agregar logs y validaciones
```

---

## 🔧 ACCIONES CORRECTIVAS INMEDIATAS

### PASO 1: Verificar Datos en BD
```sql
-- Ver compras recientes
SELECT id, cantidad, precio_total, precio_unitario, created_at
FROM compra_items
ORDER BY created_at DESC
LIMIT 5;

-- Ver si precioUnitario está NULL
SELECT COUNT(*) as total, 
       SUM(CASE WHEN precio_unitario IS NULL THEN 1 ELSE 0 END) as sin_precioUnitario
FROM compra_items;

-- Ver ingredientes con costo = 0
SELECT id, nombre, costo_unitario_base
FROM ingredientes
WHERE costo_unitario_base = 0 OR costo_unitario_base IS NULL
LIMIT 10;

-- Ver gastos por tipo
SELECT tipo_gasto, COUNT(*) as cantidad, SUM(monto) as total
FROM gastos
GROUP BY tipo_gasto;
```

### PASO 2: Corregir Tipos de Gastos en EstadisticasService.java

**Archivo**: `backend/src/main/java/com/puntodeventa/backend/service/EstadisticasService.java`

**CAMBIO REQUERIDO**:
```java
// ANTES (solo suma "Operacional"):
BigDecimal totalGastos = gastoRepository.sumMontoByTipoGastoAndSucursalAndFechaBetween(
  "Operacional", sucursalId, desde, hasta
);

// DESPUÉS (suma TODOS los gastos):
BigDecimal totalGastos = gastoRepository.sumMontoByTipoYSucursalYFechaBetween(
  sucursalId, desde, hasta  // Sin filtro por tipo
);
```

### PASO 3: Migración BD (Si hay datos antiguos)

```sql
-- Actualizar precioUnitario en compra_items si está NULL
UPDATE compra_items
SET precio_unitario = ROUND(precio_total / NULLIF(cantidad, 0), 6)
WHERE precio_unitario IS NULL OR precio_unitario = 0;

-- Actualizar costoUnitarioBase en ingredientes si está 0
UPDATE ingredientes i
SET costo_unitario_base = (
  SELECT COALESCE(AVG(ci.precio_unitario), 0)
  FROM compra_items ci
  WHERE ci.ingrediente_id = i.id
  AND ci.precio_unitario > 0
)
WHERE costo_unitario_base = 0 OR costo_unitario_base IS NULL;
```

---

## 📊 VERIFICACIÓN POST-CORRECCIÓN

### Test 1: Crear Nueva Compra
```
1. Crear compra: Naranja 30 kg @ $270 total
2. Verificar BD:
   - precio_total = 270
   - precio_unitario = 9 (calculado)
   - ingrediente.costo_unitario_base = 9
3. Verificar Reporte:
   - Debe mostrar esta compra en gastos (Proveedores)
```

### Test 2: Crear Receta y Venta
```
1. Crear receta: Jugo = 0.5 kg Naranja
2. Vender 10 unidades de Jugo
3. Verificar en Reportes:
   - costoEstimado = 10 × 0.5 × $9 = $45
   - totalCostos debe incluir $45
   - margenBruto = ingresos - $45
```

### Test 3: Agregar Gasto Operacional
```
1. Crear gasto: "Renta" = $500
2. Generar reporte
3. Verificar:
   - totalGastos = $500
   - totalCostos = costos productos + $500
```

---

## 📝 CHECKLIST DE ARCHIVOS A REVISAR

- [ ] `EstadisticasService.java` - Suma de gastos por tipo
- [ ] `GastoRepository.java` - Métodos de suma de gastos
- [ ] `CompraItem.java` - Verificar que precioUnitario se calcula
- [ ] `CompraService.java` - Actualización de costoUnitarioBase
- [ ] `AdminReports.tsx` - Parseado correcto de gastos
- [ ] `GeneralCutTab.tsx` - Mostrar gastos correctamente
- [ ] Base de datos - Migración de datos antiguos

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Ejecutar queries SQL de diagnóstico
2. ⏳ Implementar correcciones en EstadisticasService
3. ⏳ Ejecutar migraciones BD si es necesario
4. ⏳ Compilar y packear backend
5. ⏳ Test end-to-end: Compra → Receta → Venta → Reporte

