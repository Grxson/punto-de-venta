# 📊 Reporte Dinámico de Movimiento de Inventario - Guía de Implementación

## ✨ Características principales

### Backend
- ✅ Query optimizado con EntityGraph (sin N+1)
- ✅ Detección automática de días con operación
- ✅ Caché por sucursal + rango de fechas
- ✅ Una sola pasada por datos para máxima eficiencia
- ✅ Respuesta en estructura dinámica sin días vacíos

### Frontend
- ✅ Tabla con columnas dinámicas (solo días operacionales)
- ✅ React.memo en todos los subcomponentes
- ✅ Hook personalizado con caché automático
- ✅ Evita requests duplicados
- ✅ Renderizado eficiente sin columnas vacías

---

## 📌 Cómo integrar en AdminReports.tsx

### 1. **Importar el Tab**

```tsx
import { InventarioMovimientoTab } from './tabs/InventarioMovimientoTab';
```

### 2. **Agregar a la estructura de Tabs**

En la sección donde están los Tabs de AdminReports, agregar:

```tsx
<Tabs value={tabActivo} onChange={(e, valor) => setTabActivo(valor)}>
  <Tab label="Resumen Semanal" />
  <Tab label="Productos - Inventario" />
  <Tab label="📊 Movimiento de Inventario" />  {/* ← NUEVO */}
  <Tab label="Cortes Generales" />
</Tabs>
```

### 3. **Renderizar el contenido del Tab**

```tsx
{tabActivo === 2 && (
  <InventarioMovimientoTab />
)}
```

---

## 🔌 Estructura de respuesta del backend

```json
{
  "diasOperacion": ["2025-12-05", "2025-12-06", "2025-12-07"],
  "productos": [
    {
      "id": 1,
      "nombre": "ALITAS",
      "datos": {
        "2025-12-05": {
          "inicio": 0,
          "compra": 24,
          "venta": 13,
          "merma": 0,
          "queda": 11
        },
        "2025-12-06": {
          "inicio": 11,
          "compra": 25,
          "venta": 5,
          "merma": 0,
          "queda": 31
        },
        "2025-12-07": {
          "inicio": 31,
          "compra": 0,
          "venta": 12,
          "merma": 0,
          "queda": 19
        }
      },
      "totales": {
        "compra": 49,
        "venta": 30,
        "merma": 0,
        "queda": 19
      }
    }
  ]
}
```

---

## 🚀 Endpoints disponibles

### GET /api/reportes/inventario-movimiento

**Parámetros:**
- `fechaInicio` (query): ISO DateTime (ej: `2025-12-05T00:00:00`)
- `fechaFin` (query): ISO DateTime (ej: `2025-12-07T23:59:59`)

**Respuesta:**
- `InventarioMovimientoReporteDTO` con estructura dinámica

**RBAC:** ADMIN, SUPERVISOR

**Ejemplo de request:**
```bash
GET /api/reportes/inventario-movimiento?fechaInicio=2025-12-05T00:00:00&fechaFin=2025-12-07T23:59:59
```

---

## 💡 Optimizaciones implementadas

### Backend (Java 21 + Spring Boot)

**1. Query optimizado:**
```java
@EntityGraph(attributePaths = {"items", "items.producto"})
@Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.fecha BETWEEN :fechaInicio AND :fechaFin")
```
- Una sola query con eager loading
- Evita problema N+1
- Proyección de datos mínimos necesarios

**2. Caché estratégico:**
```java
@Cacheable(
    value = "reportes_inventario_movimiento",
    key = "#sucursalId + '_' + #fechaInicio.toLocalDate() + '_' + #fechaFin.toLocalDate()"
)
public InventarioMovimientoReporteDTO obtenerReporte(...)
```
- Cachea por sucursal + rango
- Evita cálculos repetidos

**3. Procesamiento eficiente:**
- Una sola pasada por datos
- HashMap para O(1) lookups
- Acumulación de totales en paralelo

### Frontend (React 18 + TypeScript)

**1. React.memo:**
```tsx
const InventarioMovimientoTabla = memo(({ reporte, cargando, error }) => {
  // Solo re-renderiza si props cambian
});
```

**2. Columnas dinámicas:**
```tsx
{diasOperacion.map(dia => (
  // Solo renderiza días con datos
  <TableCell colSpan={5} key={dia}>
    {format(new Date(dia), 'EEE')}
  </TableCell>
))}
```

**3. Hook con caché:**
```tsx
const { reporte, cargando, error, refetch } = useInventarioMovimiento();
// Evita requests duplicados si las fechas no cambian
```

---

## 📊 Comparativa: Antes vs. Después

### Antes (sin optimizar)
- ❌ Todas las columnas de la semana, incluso sin datos
- ❌ Múltiples queries (N+1 problem)
- ❌ Sin caché
- ❌ Re-renderizado innecesario

### Después (optimizado)
- ✅ Solo columnas de días con operación
- ✅ Query único con EntityGraph
- ✅ Caché automático
- ✅ Renderizado con React.memo

---

## 🎯 Próximos pasos

1. **Integrar en AdminReports.tsx:**
   - Agregar import del Tab
   - Agregar Tab en el componente Tabs
   - Renderizar el contenido

2. **Personalizar estilos (opcional):**
   - Ajustar colores del encabezado (ahora naranja #FF9800)
   - Cambiar tamaños de fuente
   - Agregar botones de exportación a Excel

3. **Agregar funcionalidades (optional):**
   - Exportar a Excel
   - Filtro por categoría de producto
   - Gráficos de tendencia
   - Alertas de stock bajo

---

## 🧪 Testing

Para verificar que funciona correctamente:

1. **Backend:**
   ```bash
   GET /api/reportes/inventario-movimiento?fechaInicio=2025-12-05T00:00:00&fechaFin=2025-12-07T23:59:59
   ```
   - Verificar que solo devuelve días con datos
   - Verificar que los totales son correctos

2. **Frontend:**
   - Abrir AdminReports
   - Ir al tab "Movimiento de Inventario"
   - Cambiar rango de fechas
   - Verificar que las columnas se actualizan dinámicamente
   - Cambiar a otro rango y volver (verificar caché)

---

## 📚 Archivos relacionados

- **Backend:**
  - `InventarioMovimientoReporteService.java` - Lógica de reporte
  - `InventarioMovimientoReporteDTO.java` - DTOs
  - `ReporteController.java` - Endpoints
  - `VentaRepository.java` - Query optimizado

- **Frontend:**
  - `InventarioMovimientoTabla.tsx` - Componente de tabla
  - `useInventarioMovimiento.ts` - Hook personalizado
  - `InventarioMovimientoTab.tsx` - Tab completo
  - `reportes.types.ts` - Tipos TypeScript

- **Documentación:**
  - `.github/copilot-instructions.md` - Nueva sección de optimización

---

## 💬 Notas importantes

- El endpoint requiere rol ADMIN o SUPERVISOR
- Las fechas deben ser ISO DateTime (incluyen hora)
- El caché se invalida automáticamente (30 minutos por defecto)
- La tabla es completamente responsive
- Los movimientos negativos se resaltan en rojo
