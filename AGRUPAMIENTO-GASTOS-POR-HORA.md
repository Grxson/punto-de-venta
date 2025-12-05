# ✅ Agrupamiento de Gastos por Hora - Implementación Completada

## 📋 Descripción General

Se ha implementado un sistema de **agrupamiento visual de gastos por hora** en las ventanas de `AdminExpenses` y `PosExpenses`, similar a cómo se muestran los productos en una venta con la opción "(ver todos)".

## 🎯 Objetivo

Mejorar la **organización visual** cuando se registran múltiples gastos al mismo tiempo, permitiendo:
- ✅ Vista compacta por defecto (mostrando el resumen del primer gasto)
- ✅ Expansión con un clic para ver todos los gastos del mismo minuto/hora
- ✅ Indicador visual claro con contador de gastos
- ✅ Muestra de total y promedio cuando hay múltiples gastos

## 📁 Archivos Creados/Modificados

### 1. **Componente: ExpandableExpenseRow.tsx** (NUEVO)
Ubicación: `frontend-web/src/components/expenses/ExpandableExpenseRow.tsx`

**Características:**
- Componente reutilizable para mostrar filas expandibles de gastos
- Agrupa múltiples gastos en una sola fila
- Permite expandir/contraer con un clic
- Muestra contador de gastos: `"3 gastos"` o similar
- Muestra total y promedio en vista contraída
- Muestra timestamp completo en vista expandida

**Props:**
```typescript
interface ExpandableExpenseRowProps {
  gastos: Gasto[];              // Array de gastos agrupados
  timeGroup: string;             // Hora/minuto (ej: "14:30")
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (gastoId: number) => void;
  isLoading?: boolean;
}
```

### 2. **Hook: useGroupExpensesByTime.ts** (NUEVO)
Ubicación: `frontend-web/src/hooks/useGroupExpensesByTime.ts`

**Características:**
- Agrupa gastos por hora (HH:mm)
- Retorna array de grupos ordenados por hora descendente (más recientes primero)
- Cada grupo incluye:
  - `timeGroup`: Hora del grupo
  - `gastos`: Array de gastos en esa hora
  - `totalMonto`: Suma total de los gastos

**Uso:**
```typescript
const gastoGrouped = useGroupExpensesByTime(gastos);
// Retorna:
// [
//   { timeGroup: "14:30", gastos: [...], totalMonto: 500 },
//   { timeGroup: "14:15", gastos: [...], totalMonto: 250 }
// ]
```

### 3. **AdminExpenses.tsx** (MODIFICADO)
Ubicación: `frontend-web/src/pages/admin/AdminExpenses.tsx`

**Cambios:**
- ✅ Importación del componente `ExpandableExpenseRow`
- ✅ Importación del hook `useGroupExpensesByTime`
- ✅ Reemplazo de renderizado individual a agrupado
- ✅ La tabla ahora usa `ExpandableExpenseRow` en lugar de `TableRow` simple

**Antes:**
```typescript
gastosFiltrados.map((gasto) => (
  <TableRow key={gasto.id}>
    {/* Detalles de cada gasto */}
  </TableRow>
))
```

**Después:**
```typescript
const gastoGrouped = useGroupExpensesByTime(gastosFiltrados);
gastoGrouped.map((group) => (
  <ExpandableExpenseRow
    key={group.timeGroup}
    gastos={group.gastos}
    timeGroup={group.timeGroup}
    onEdit={...}
    onDelete={...}
  />
))
```

### 4. **PosExpenses.tsx** (MODIFICADO)
Ubicación: `frontend-web/src/pages/pos/PosExpenses.tsx`

**Cambios:**
- ✅ Importación del componente `ExpandableExpenseRow`
- ✅ Importación del hook `useGroupExpensesByTime`
- ✅ Reemplazo de renderizado individual a agrupado
- ✅ Lógica de permisos (isAdmin) integrada en callbacks

## 🎨 Visualización

### Vista Contraída (Defecto)
```
┌─────────────────────────────────────────────────────────────────────┐
│ Fecha            │ Tipo         │ Categoría  │ Descripción          │ ...
├─────────────────────────────────────────────────────────────────────┤
│ ► 14:30 [3 gastos] │ Operacional │ Insumos  │ Birote              │ ...
│ ► 14:15 [2 gastos] │ Operacional │ Insumos  │ Leche               │ ...
│ ▼ 14:05 [1 gasto]  │ Operacional │ Servicios│ Limpieza            │ ...
│   14:05:32         │ Operacional │ Servicios│ Limpieza            │ ...
└─────────────────────────────────────────────────────────────────────┘
```

### Vista Expandida (Al hacer clic)
```
┌──────────────────────────────────────────────────────────────────┐
│ Fecha            │ Tipo         │ Categoría  │ Descripción       │ ...
├──────────────────────────────────────────────────────────────────┤
│ ▼ 14:30 [3 gastos] │ Operacional │ Insumos   │ Birote            │ ...
│   14:30:12       │ Operacional │ Insumos  │ Birote            │ ...
│   14:30:15       │ Operacional │ Insumos  │ Chocorrizo        │ ...
│   14:30:22       │ Operacional │ Insumos  │ Leche              │ ...
└──────────────────────────────────────────────────────────────────┘
```

## 💾 Datos Mostrados

### Fila Contraída (Resumen)
```
Columna 1: Hora + Chip contador
           Ejemplo: "14:30 [3 gastos]"
           
Columna 2-7: Info del primer gasto + nota adicional
             Nota: "+2 más..."
             
Monto: Total $500.00 (promedio: $166.67)
```

### Fila Expandida (Detalles)
```
Por cada gasto en el grupo:
- Timestamp completo: "14:30:12"
- Todos los detalles individuales
- Botones de edición/eliminación independientes
```

## ✨ Características Destacadas

✅ **Agrupamiento Automático:**
- Los gastos se agrupan automáticamente por la hora de registro
- No requiere configuración manual
- Funciona con datos existentes

✅ **Indicadores Visuales:**
- Iconos ► y ▼ para indicar estado expandible
- Contador de gastos: `"3 gastos"`
- Cambio de color de fondo en hover y expandido
- Transiciones suaves

✅ **Información Útil:**
- Total del grupo en vista contraída
- Promedio por gasto en vista contraída
- Timestamp completo en vista expandida (HH:mm:ss)

✅ **Interactividad:**
- Click en la fila para expandir/contraer
- Botones de edición/eliminación funcionan por gasto individual
- Compatible con permisos de usuario (isAdmin)

✅ **Rendimiento:**
- Usa `useMemo` en el hook para optimizar cálculos
- Renderizado condicional de detalles
- Build exitoso: 23.02s
- Tamaño sin cambios significativos

## 🔧 Cómo Funciona

### Flujo de Datos

```
1. Usuario navega a AdminExpenses o PosExpenses
   ↓
2. Se carga la lista de gastos (gastosFiltrados o gastosVisiblesEnTabla)
   ↓
3. Hook useGroupExpensesByTime() agrupa por hora
   ↓
4. Se renderiza ExpandableExpenseRow por cada grupo
   ↓
5. Usuario puede hacer clic para expandir/contraer
```

### Agrupamiento (Algoritmo)

```
1. Recorrer cada gasto
2. Extraer hora (HH:mm) del timestamp
3. Agrupar por hora en un objeto Record<string, Gasto[]>
4. Convertir a array de grupos
5. Ordenar grupos por hora descendente (más recientes primero)
6. Retornar array de grupos
```

## 🧪 Pruebas Realizadas

✅ **Compilación:** Build exitoso sin errores
✅ **TypeScript:** Tipo checking completo
✅ **Componentes:** Sin errores de sintaxis
✅ **Imports:** Todos resueltos correctamente
✅ **Performance:** Sin cambio significativo en tamaño

## 📊 Impacto Visual

**Antes:**
- Tabla con 20+ filas para 20+ gastos
- Difícil de identificar gastos registrados al mismo tiempo
- Tabla muy larga y desorganizada

**Después:**
- Tabla con 5-7 filas agrupadas (si hay gastos en diferentes horas)
- Fácil identificar gastos del mismo minuto/hora
- Información compacta con opción de expandir
- Similar a cómo se ven los productos en una venta

## 🎯 Próximos Pasos (Opcional)

1. **Configuración de agrupamiento:**
   - Agregar opción para agrupar por minuto exacto en lugar de hora
   - Agregar opción para agrupar por fecha completa

2. **Mejoras visuales:**
   - Animación de expansión/contracción
   - Colores diferentes por tipo de gasto
   - Iconos adicionales para mejor identificación

3. **Funcionalidades avanzadas:**
   - Selección múltiple de gastos agrupados
   - Acciones en lote (editar/eliminar grupos)
   - Exportar gastos agrupados

## ✅ Checklist de Verificación

- [x] Componente ExpandableExpenseRow creado
- [x] Hook useGroupExpensesByTime creado
- [x] AdminExpenses integrado
- [x] PosExpenses integrado
- [x] Sin errores TypeScript
- [x] Build exitoso
- [x] Documentación completada

---

**Status:** ✅ COMPLETADO Y LISTO PARA USAR

**Rama:** develop  
**Fecha:** 5 de diciembre de 2025  
**Build Time:** 23.02s  
