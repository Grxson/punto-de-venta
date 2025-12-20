# 🔧 DEBUGGING: Reportes sin Datos por Rango de Fechas

## 📋 Problema Reportado

- ❌ Los reportes no muestran datos del rango de fechas seleccionado
- ❌ El filtro por fechas no funciona
- ❌ El paginador "Días hacia Atrás" no carga datos
- ❌ No se ven reportes completos por día/semana/semana pasada

## 🔍 Investigación

### 1. VERIFICACIÓN EN CONSOLA DEL NAVEGADOR

**Abre DevTools** (F12) y ve a la pestaña **Network**:

1. Haz clic en **"← Atrás"** para cambiar el día
2. Observa las requests HTTP que aparecen
3. Busca requests a:
   - `/api/estadisticas/ventas/rango`
   - `/api/estadisticas/productos/rango`
   - `/api/ventas/rango`

**Para cada request, verifica**:
- ✅ **Status**: Debe ser `200 OK` (verde)
- ❌ **Si es 400, 404, 500**: Anota el error exacto
- ✅ **Headers**: Debe tener `Authorization: Bearer [token]`
- ✅ **Query Parameters**: Debe mostrar `desde=...&hasta=...`

### 2. VERIFICACIÓN EN CONSOLA DEL NAVEGADOR - Pestaña "Console"

Ejecuta este código en la consola:

```javascript
// Verificar que las fechas se están enviando correctamente
console.log('Fecha desde:', document.querySelector('input[type="date"]')?.value);
console.log('Fecha hasta:', document.querySelectorAll('input[type="date"]')[1]?.value);

// Ver si hay errores de API
console.log('Errores en el estado:', window.__errors);
```

### 3. REVISAR LOS LOGS DEL BACKEND

**Reinicia el backend y observa los logs** en la terminal:

```bash
cd backend && ./start.sh 2>&1 | grep -E "EstadisticasController|aggregateResumen|sumMontoBy"
```

**Busca lineas como**:
```
📊 [EstadisticasController.resumenRango] desde=2025-12-18T00:00:00, hasta=2025-12-18T23:59:59
📊 [EstadisticasService] resumenRango: desde=2025-12-18T00:00:00...
  ↳ Aggregate: cantidadVentas=2, totalVentas=150.00, totalCostos=50.00
```

**Si NO ves estos logs**:
- El request no está llegando al backend
- Problema: CORS, red, o la aplicación no está conectada

**Si ves logs pero con valores 0**:
- El request llega, pero no hay datos
- Problema: No hay ventas para esa fecha, o la fecha está mal

---

## ✅ FIX APLICADO (Hoy)

### Cambio 1: Pasar `fechaRepresentativa` al Servicio
**Archivo**: `EstadisticasController.java`

```java
// ANTES (línea 51):
return ResponseEntity.ok(estadisticasService.resumenRango(desde, hasta, null));
         // ↑ Pasaba null, por eso el DTO devolvía fecha nula

// DESPUÉS (línea 53-55):
LocalDate fechaRepresentativa = desde.toLocalDate();
return ResponseEntity.ok(estadisticasService.resumenRango(desde, hasta, fechaRepresentativa));
         // ↑ Ahora pasa la fecha extraída de "desde"
```

**Impacto**: El DTO `ResumenVentasDiaDTO` ahora devuelve la fecha correcta en la respuesta.

### Cambio 2: Agregar Logs Detallados para Debugging
**Archivo**: `EstadisticasController.java`

```java
org.slf4j.LoggerFactory.getLogger(this.getClass()).info(
    "📊 [EstadisticasController.resumenRango] desde={}, hasta={}", desde, hasta);
```

**Impacto**: Ahora podemos ver exactamente qué fechas está recibiendo el backend.

---

## 🚀 PASOS PARA VERIFICAR EL FIX

### PASO 1: Actualizar Backend

```bash
cd backend && ./start.sh
```

**Verifica que dice**:
```
✅ The application has started successfully
✅ Server running on http://localhost:8080
```

### PASO 2: Abrir la App y DevTools

1. Abre la app en `http://localhost:5173`
2. Abre **DevTools** (F12)
3. Ve a pestaña **Network**
4. Haz clic en **"← Atrás"** (cambiar día anterior)

### PASO 3: Observar el Network

Deberías ver requests como:

```
GET /api/estadisticas/ventas/rango?desde=2025-12-19T00%3A00%3A00&hasta=2025-12-19T23%3A59%3A59
  Status: 200 ✅
  
GET /api/estadisticas/productos/rango?desde=2025-12-19T00%3A00%3A00&hasta=2025-12-19T23%3A59%3A59&limite=10
  Status: 200 ✅
  
GET /api/ventas/rango?desde=2025-12-19T00%3A00%3A00&hasta=2025-12-19T23%3A59%3A59
  Status: 200 ✅
```

### PASO 4: Observar los Datos

Los requests deberían devolver datos:

```json
{
  "fecha": "2025-12-19",
  "totalVentas": 150.00,
  "totalCostos": 50.00,
  "totalGastos": 30.00,
  "margenBruto": 70.00,
  "cantidadVentas": 3,
  "itemsVendidos": 5,
  "ticketPromedio": 50.00,
  "margenPorcentaje": 46.67
}
```

**Verifica**:
- ✅ `fecha` no es null
- ✅ `totalVentas` > 0 (si hay ventas)
- ✅ `totalCostos` > 0 (si hay costos)
- ✅ `totalGastos` > 0 (si hay gastos)

### PASO 5: Observar la UI

Después del fix, debería ver:
- ✅ "Resumen del Período Seleccionado" actualizado con la fecha correcta
- ✅ Métricas (Total Ventas, Costos, Gastos) actualizadas
- ✅ Gráficos con datos del período seleccionado
- ✅ Cuando haces "← Atrás", cambia a día anterior

---

## 🚨 SI AÚN NO FUNCIONA...

### Causa 1: Las fechas están en formato incorrecto

**En DevTools → Network**, haz clic en la request `/estadisticas/ventas/rango`

Verifica la URL:
```
desde=2025-12-19T00:00:00    ✅ CORRECTO
desde=2025-12-19T00%3A00%3A00 ✅ TAMBIÉN CORRECTO (URL encoded)

desde=2025-12-19             ❌ INCORRECTO (sin hora)
desde=2025-12-19T00:00:00Z   ❌ INCORRECTO (Z de UTC, no se usa)
```

### Causa 2: El backend está rechazando las fechas

**En DevTools → Network → Response**, verifica el error:

```json
{
  "error": "Failed to convert parameter from string to LocalDateTime",
  "message": "Invalid format"
}
```

Si ves esto, hay un problema con cómo Spring está parseando las fechas. Reinicia el backend:

```bash
cd backend && ./mvnw clean package -DskipTests && ./start.sh
```

### Causa 3: No hay datos para esa fecha

**En los logs del backend**, verifica:

```
📊 [EstadisticasService] resumenRango: desde=2025-12-19T00:00:00...
  ↳ Aggregate: cantidadVentas=0, totalVentas=0, totalCostos=0
```

Si `cantidadVentas=0`, no hay ventas registradas para esa fecha. Crea una venta en esa fecha y prueba de nuevo.

### Causa 4: Problema de Zona Horaria

Si tienes zona horaria CST (-6:00) y el servidor está en UTC:

**Problema**: Envías `desde=2025-12-19T00:00:00` (tu zona local)
Pero el servidor lo interpreta como `2025-12-19T00:00:00 UTC` (zona UTC)
Resultado: Compara con datos de `2025-12-18` o `2025-12-19` UTC

**Solución**: Verificar que el servidor tiene la zona horaria correcta

```bash
# Ver zona horaria del sistema
date
# Output: Fri Dec 20 12:59:09 CST 2025

# Ver zona horaria de Java en el backend
# Debería usar la zona horaria del sistema (CST)
```

---

## 📝 CAMBIOS TÉCNICOS

| Archivo | Cambio | Línea |
|---------|--------|-------|
| `EstadisticasController.java` | Extraer `fechaRepresentativa` de `desde` | 51-55 |
| `EstadisticasController.java` | Agregar logs detallados | 47-48 |

---

## ✨ Resumen

- **Problema**: El backend no pasaba `fechaRepresentativa` al servicio
- **Impacto**: El DTO devolvía `fecha=null`
- **Fix**: Extraer fecha de parámetro `desde` y pasarla al servicio
- **Verificación**: Observar logs del backend y Network en DevTools

**Próximo paso**: Ejecutar backend y verificar logs mientras cambias las fechas en la UI.

