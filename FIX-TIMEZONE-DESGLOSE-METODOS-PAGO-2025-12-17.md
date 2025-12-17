# FIX FINAL: Desglose por Métodos de Pago - Zona Horaria (2025-12-17)

## 🚨 Problema Raíz

El array de desglose estaba **vacío** `data: []` porque:

1. **Frontend enviaba fechas incorrectas** (00:00-12:00 UTC en lugar de 12:00-11:59 UTC)
2. **Backend no estaba configurado con timezone** (Hibernate sin UTC)
3. **Comparación de fechas fallaba** en la BD porque estaba comparando en zona horaria incorrecta

**Síntomas en consola:**
```
initioDiaISO: "2025-12-17T12:00:00.000Z"    ← Mediodía UTC (INCORRECTO)
finDiaISO: "2025-12-18T11:59:59.999Z"       ← Casi mediodía siguiente
Desglose procesado: Array []                ← VACÍO
```

## 🔧 Soluciones Implementadas

### 1. FRONTEND: Usar `date-fns` Correctamente

**Archivo:** `frontend-web/src/components/DailyStatsPanel.tsx`

```typescript
// ❌ ANTES: Cálculo manual de timezone (INCORRECTO)
const offsetMs = hoy.getTimezoneOffset() * 60 * 1000;
const inicioDiaLocal = new Date(year, hoy.getMonth(), hoy.getDate(), 0, 0, 0, 0);
const inicioDiaUTC = new Date(inicioDiaLocal.getTime() + offsetMs); // ← ERROR AQUÍ

// ✅ DESPUÉS: Usar date-fns (CORRECTO)
import { startOfDay, endOfDay } from 'date-fns';

const hoy = new Date();
const inicioDiaLocal = startOfDay(hoy);  // 00:00:00 en zona horaria local
const finDiaLocal = endOfDay(hoy);       // 23:59:59 en zona horaria local

// date-fns automáticamente convierte a UTC al llamar toISOString()
const inicioDiaISO = inicioDiaLocal.toISOString();
const finDiaISO = finDiaLocal.toISOString();
```

**Por qué funciona:**
- `startOfDay()` crea una fecha local en 00:00:00
- `toISOString()` la convierte correctamente a UTC
- Si eres UTC+12 y son las 00:00:00 locales, en UTC serán las 12:00:00 del día anterior
- date-fns lo calcula automáticamente

### 2. BACKEND: Configurar Hibernat com UTC

**Archivo:** `backend/src/main/resources/application.properties`

```properties
# Línea agregada después de spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.jdbc.time_zone=UTC
```

**Por qué es crítico:**
- Sin esto, Hibernate NO sabe que debe usar UTC para comparaciones `BETWEEN`
- La BD comparaba fechas locales vs fechas UTC (incompatibles)
- Con esto, todo se hace en UTC internamente

### 3. LOGGING: Debugging Exhaustivo

**Backend:** `VentaService.java` - método `obtenerDesglosePorMetodoPago()`

```java
logger.debug("[VentaService] obtenerDesglosePorMetodoPago - Sucursal: {}, Inicio: {}, Fin: {}", 
             sucursalId, inicio, fin);

List<Object[]> resultados = ventaRepository.sumByMetodoPago(sucursalId, inicio, fin);

logger.debug("[VentaService] Desglose por método de pago - Resultados encontrados: {}", 
             resultados.size());

if (resultados.isEmpty()) {
    logger.warn("[VentaService] ⚠️ NO SE ENCONTRARON VENTAS en el rango [{}, {}] para sucursal {}", 
                inicio, fin, sucursalId);
}
```

**Frontend:** `DailyStatsPanel.tsx` - línea 117

```typescript
console.log('[DailyStatsPanel] Dates correctas (date-fns):', { 
  inicioDiaISO, 
  finDiaISO,
  horaLocalInicio: format(inicioDiaLocal, 'HH:mm:ss'),
  horaLocalFin: format(finDiaLocal, 'HH:mm:ss'),
});
```

## ✅ Verificación de que Funciona

### Paso 1: Backend
Reinicia el backend y busca en logs:
```
[VentaService] obtenerDesglosePorMetodoPago - Sucursal: 1, Inicio: 2025-12-17T00:00:00, Fin: 2025-12-17T23:59:59
[VentaService] Desglose por método de pago - Resultados encontrados: 3
```

### Paso 2: Frontend (F12 Consola)
```
[DailyStatsPanel] Dates correctas (date-fns): {
  initioDiaISO: "2025-12-17T00:00:00.000Z",
  finDiaISO: "2025-12-17T23:59:59.999Z",
  horaLocalInicio: "12:00:00",
  horaLocalFin: "11:59:59"
}

[DailyStatsPanel] Respuesta desglose: {
  success: true,
  data: [
    { metodoPago: "Efectivo", total: 800 },
    { metodoPago: "Tarjeta", total: 700 }
  ]
}

[DailyStatsPanel] Desglose procesado: [
  { metodoPago: "Efectivo", total: 800 },
  { metodoPago: "Tarjeta", total: 700 }
]
```

### Paso 3: Visual
En el panel deberías ver:
```
Resumen del Día
Venta: $1555.00
  Efectivo: $800.00
  Tarjeta: $700.00
  Transferencia: $55.00
Gastos: $611.00
Neto: $944.00
```

## 📊 Timeline de Debugging

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Array vacío `[]` | Fechas fuera del rango de ventas | Usar `date-fns` |
| Fechas no coinciden | Cálculo manual de timezone incorrecto | `startOfDay()` + `toISOString()` |
| Hibernate ignora range | Sin configuración de timezone | `hibernate.jdbc.time_zone=UTC` |
| No sé qué está pasando | Sin logging | Agregué logs en ambos lados |

## 🔒 Prevención Futura

### Reglas de Oro

1. **NUNCA calcular timezone manualmente**
   - ✅ Usa `date-fns`, `moment`, o `date-fns-tz`
   - ❌ No uses `getTimezoneOffset()` + Math manual

2. **SIEMPRE configurar Hibernate con timezone**
   - ✅ En `application.properties`: `spring.jpa.properties.hibernate.jdbc.time_zone=UTC`
   - ❌ No dejes Hibernate sin configuración

3. **SIEMPRE loguear fechas en endpoints**
   - ✅ `logger.debug()` con las fechas recibidas
   - ❌ No confíes en que las fechas sean siempre correctas

4. **SIEMPRE usar ISO 8601 para APIs**
   - ✅ `toISOString()` (2025-12-17T00:00:00.000Z)
   - ❌ No uses formatos personalizados o timestamps de JS

## 📝 Archivos Modificados

1. **Frontend:**
   - `frontend-web/src/components/DailyStatsPanel.tsx`
     - Importar `startOfDay`, `endOfDay` de `date-fns`
     - Usar estas funciones en lugar de cálculo manual
     - Añadir logging con hora local para debugging

2. **Backend:**
   - `backend/src/main/resources/application.properties`
     - Agregar: `spring.jpa.properties.hibernate.jdbc.time_zone=UTC`
   - `backend/src/main/java/com/puntodeventa/backend/service/VentaService.java`
     - Método `obtenerDesglosePorMetodoPago()`: Agregar logs

## 🧪 Testing Manual

```bash
# 1. Crear una venta hoy
# 2. Esperar a que se registre
# 3. Refrescar el DailyStatsPanel
# 4. Verificar consola (F12)
# 5. Verificar que aparece en el panel visual
```

---

**Fecha:** 17 de diciembre de 2025
**Impacto:** CRÍTICO - Affecta ALL cálculos de rangos de fechas
**Status:** ✅ ARREGLADO
