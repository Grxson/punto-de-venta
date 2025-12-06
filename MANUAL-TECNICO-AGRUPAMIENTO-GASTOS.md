# 🔧 Manual Técnico: Agrupamiento de Gastos por Hora

## 📑 Índice
1. [Arquitectura](#arquitectura)
2. [Componentes](#componentes)
3. [Hooks](#hooks)
4. [Integración](#integración)
5. [API](#api)
6. [Ejemplos](#ejemplos)
7. [Troubleshooting](#troubleshooting)

---

## Arquitectura

### Diagrama de Flujo
```
┌─────────────────────────────────────────────────────────────────┐
│ Componente Página (AdminExpenses / PosExpenses)                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ↓
                   ┌────────────────────┐
                   │ useGroupExpensesByTime │  Hook de agrupación
                   │ (Agrupa por HH:mm)  │
                   └────────────────────┘
                            │
                    Retorna: GastoGroup[]
                    [
                      { 
                        timeGroup: "14:30",
                        gastos: [...],
                        totalMonto: 500
                      },
                      ...
                    ]
                            ↓
                   ┌────────────────────────┐
                   │ map() sobre grupos     │
                   └────────────────────────┘
                            │
                            ↓
              ┌──────────────────────────────┐
              │ ExpandableExpenseRow         │  Componente de fila
              │ (1 por grupo de gastos)      │
              └──────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │ Fila Contraída    │ Fila Expandida    │
        ├───────────────────┼───────────────────┤
        │ • 1 fila          │ • n filas         │
        │ • Resumen         │ • Detalles        │
        │ • Total/Promedio  │ • Botones ind.    │
        └───────────────────┴───────────────────┘
```

---

## Componentes

### ExpandableExpenseRow.tsx

**Ubicación:** `frontend-web/src/components/expenses/ExpandableExpenseRow.tsx`

**Responsabilidades:**
1. Renderizar fila principal (contraída)
2. Gestionar estado de expansión (useState)
3. Renderizar filas expandidas (detalles)
4. Manejo de eventos (click, editar, eliminar)

**Estructura de Props:**
```typescript
interface ExpandableExpenseRowProps {
  gastos: Gasto[];              // Array de gastos agrupados
  timeGroup: string;             // Hora del grupo (HH:mm)
  onEdit?: (gasto: Gasto) => void;
  onDelete?: (gastoId: number) => void;
  isLoading?: boolean;           // Estado de carga
}
```

**Estados Internos:**
```typescript
const [expanded, setExpanded] = useState(false);
```

**Renderizado:**
- **Si gastos.length === 1:**
  - Fila simple sin icono expandible
  - Botones de acción siempre visibles

- **Si gastos.length > 1:**
  - Fila con icono expandible (► / ▼)
  - Chip contador: `[3 gastos]`
  - Al expandir: renderiza filas adicionales

**Lógica de Click:**
```typescript
onClick={() => hasDetails && setExpanded(!expanded)}
```

---

## Hooks

### useGroupExpensesByTime.ts

**Ubicación:** `frontend-web/src/hooks/useGroupExpensesByTime.ts`

**Propósito:** Agrupar array de gastos por hora de registro

**Entrada:**
```typescript
const gastos: Gasto[] = [
  { id: 1, fecha: "2025-12-04T14:30:12", ... },
  { id: 2, fecha: "2025-12-04T14:30:15", ... },
  { id: 3, fecha: "2025-12-04T14:15:30", ... },
]
```

**Salida:**
```typescript
const gastoGrouped = useGroupExpensesByTime(gastos);
// Retorna:
[
  {
    timeGroup: "14:30",
    gastos: [
      { id: 1, fecha: "2025-12-04T14:30:12", ... },
      { id: 2, fecha: "2025-12-04T14:30:15", ... }
    ],
    totalMonto: 500
  },
  {
    timeGroup: "14:15",
    gastos: [
      { id: 3, fecha: "2025-12-04T14:15:30", ... }
    ],
    totalMonto: 250
  }
]
```

**Algoritmo:**
```
1. Verificar si array vacío → retornar []
2. Crear objeto Record<string, Gasto[]>
3. Iterar gastos:
   a. Extraer hora con format(fecha, 'HH:mm')
   b. Si no existe timeGroup → crear array
   c. Push gasto al array de su timeGroup
4. Convertir Record a array de GastoGroup
5. Ordenar gastos dentro de cada grupo por fecha DESC
6. Ordenar grupos por hora DESC (más recientes primero)
7. Retornar array ordenado
```

**Complejidad:**
- Tiempo: O(n log n) en el peor caso (por ordenamientos)
- Espacio: O(n)
- Optimizado con useMemo para evitar recálculos

---

## Integración

### AdminExpenses.tsx

**Cambios:**
```typescript
// 1. Imports
import ExpandableExpenseRow from '../../components/expenses/ExpandableExpenseRow';
import { useGroupExpensesByTime } from '../../hooks/useGroupExpensesByTime';

// 2. En el render de tabla
{(() => {
  const gastoGrouped = useGroupExpensesByTime(gastosFiltrados);
  return (
    <TableBody>
      {gastoGrouped.length > 0 ? (
        gastoGrouped.map((group) => (
          <ExpandableExpenseRow
            key={group.timeGroup}
            gastos={group.gastos}
            timeGroup={group.timeGroup}
            onEdit={(gasto) => { /* Lógica de edición */ }}
            onDelete={handleDelete}
            isLoading={loading}
          />
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={8}>No hay gastos</TableCell>
        </TableRow>
      )}
    </TableBody>
  );
})()}
```

### PosExpenses.tsx

**Cambios similares:**
```typescript
// Con lógica de permisos (isAdmin) en callbacks
onEdit={(gasto) => {
  if (isAdmin) {
    handleOpenDialog(gasto);
  }
}}
```

---

## API

### Hook: useGroupExpensesByTime

```typescript
/**
 * Agrupa gastos por hora de registro (HH:mm)
 * @param gastos - Array de gastos a agrupar
 * @returns Array de grupos ordenados por hora descendente
 */
export function useGroupExpensesByTime(gastos: Gasto[]): GastoGroup[]
```

### Componente: ExpandableExpenseRow

```typescript
/**
 * Fila expandible de gastos agrupados por hora
 * Muestra resumen compacto y permite expandir para ver detalles
 */
export default function ExpandableExpenseRow({
  gastos,           // Array de gastos agrupados
  timeGroup,        // Hora del grupo (HH:mm)
  onEdit,           // Callback al editar gasto
  onDelete,         // Callback al eliminar gasto
  isLoading         // Estado de carga
}: ExpandableExpenseRowProps)
```

---

## Ejemplos

### Ejemplo 1: Uso Básico en AdminExpenses

```typescript
// En el componente principal
const gastosFiltrados = [...] // Datos del API

return (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Fecha</TableCell>
        <TableCell>Tipo</TableCell>
        {/* ... otras columnas ... */}
      </TableRow>
    </TableHead>
    <TableBody>
      {(() => {
        const grouped = useGroupExpensesByTime(gastosFiltrados);
        return grouped.length > 0 ? (
          grouped.map(group => (
            <ExpandableExpenseRow
              key={group.timeGroup}
              gastos={group.gastos}
              timeGroup={group.timeGroup}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8}>Sin gastos</TableCell>
          </TableRow>
        );
      })()}
    </TableBody>
  </Table>
);
```

### Ejemplo 2: Con Filtros

```typescript
// Agrupar solo gastos operacionales
const gastosOperacionales = gastos.filter(
  g => g.tipoGasto === 'Operacional'
);
const grouped = useGroupExpensesByTime(gastosOperacionales);
```

### Ejemplo 3: Con Ordenamiento Personalizado

```typescript
// Hook ya retorna ordenado por hora DESC
// Si necesitas cambiar:
const grouped = useGroupExpensesByTime(gastos)
  .sort((a, b) => a.totalMonto - b.totalMonto); // Por monto ASC
```

---

## Troubleshooting

### Problema 1: Gastos no se agrupan correctamente

**Síntoma:** Gastos en la misma hora aparecen en filas separadas

**Causa:** Probables diferencias en formato de fecha

**Solución:**
```typescript
// Verificar que todos los gastos tienen fecha en formato ISO
console.log(gasto.fecha); // Debe ser: "2025-12-04T14:30:12"

// Si está en otro formato, normalizar en el API o antes de agrupar
const gastosNormalizados = gastos.map(g => ({
  ...g,
  fecha: new Date(g.fecha).toISOString()
}));
```

### Problema 2: Componente no se re-renderiza al expandir

**Síntoma:** Click en expandible no hace nada

**Causa:** Estado `expanded` local no se actualizando

**Solución:**
```typescript
// Verificar que el onClick no está siendo bloqueado
onClick={(e) => {
  e.stopPropagation(); // Detener propagación si es necesario
  setExpanded(!expanded);
}}
```

### Problema 3: Estilos inconsistentes

**Síntoma:** Filas expandidas no alineadas correctamente

**Causa:** Diferentes sx props en filas principales vs expandidas

**Solución:**
```typescript
// Mantener consistencia en sx props
const rowStyles = {
  py: 1.5,
  px: 2,
  borderBottom: 1,
  borderColor: 'divider',
};

// Usar en ambos
<TableRow sx={rowStyles} /> // Fila principal
<TableRow sx={{...rowStyles, backgroundColor: 'action.hover'}} /> // Expandida
```

### Problema 4: Performance lenta con muchos gastos

**Síntoma:** Tabla lenta al renderizar 1000+ gastos

**Causa:** Renderizado innecesario de detalles expandidos

**Solución:**
```typescript
// El hook ya usa useMemo, pero verificar:
1. Usar key={group.timeGroup} en map (no índice)
2. No duplicar llamadas a useGroupExpensesByTime
3. Considerar virtualización si > 500 gastos
```

### Problema 5: Timestamps incompletos en vista expandida

**Síntoma:** Filas expandidas muestran "HH:mm" en lugar de "HH:mm:ss"

**Causa:** Formato de date-fns incorrecto

**Solución:**
```typescript
// Verificar que está usando:
format(new Date(gasto.fecha), 'dd/MM/yyyy HH:mm:ss', { locale: es })

// No:
format(new Date(gasto.fecha), 'dd/MM/yyyy HH:mm', { locale: es })
```

---

## 📝 Notas de Mantenimiento

### Si necesitas...

**Cambiar granularidad de agrupamiento (de minuto a hora):**
```typescript
// En useGroupExpensesByTime.ts, cambiar formato:
const timeKey = format(new Date(gasto.fecha), 'HH', { locale: es }); // Hora
// En lugar de:
const timeKey = format(new Date(gasto.fecha), 'HH:mm', { locale: es }); // Hora:minuto
```

**Agregar más información en vista contraída:**
```typescript
// En ExpandableExpenseRow, agregar props adicionales
interface ExpandableExpenseRowProps {
  // ... propiedades existentes ...
  showUser?: boolean;    // Mostrar usuario que registró
  showCategory?: boolean; // Mostrar categoría resaltada
}
```

**Hacer el componente completamente personalizable:**
```typescript
// Extraer estilos a variables de configuración
const STYLES = {
  rowExpanded: { backgroundColor: 'action.selected' },
  rowHover: { backgroundColor: 'action.hover' },
  detailsRow: { backgroundColor: 'action.hover' },
};
```

---

## ✅ Checklist para Nuevos Desarrolladores

- [ ] Leer este documento completamente
- [ ] Entender el flujo en "Arquitectura"
- [ ] Revisar código de ExpandableExpenseRow.tsx
- [ ] Revisar código de useGroupExpensesByTime.ts
- [ ] Ejecutar proyecto localmente
- [ ] Probar agrupamiento con gastos múltiples
- [ ] Probar expansión/contracción
- [ ] Probar edición/eliminación en detalles
- [ ] Revisar build sin errores
- [ ] Documentar cualquier cambio realizado

---

**Última actualización:** 5 de diciembre de 2025  
**Versión:** 1.0  
**Autor:** GitHub Copilot  
**Rama:** develop  
