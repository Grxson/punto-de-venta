# 📊 VISUAL: Cómo Funciona el Agrupamiento de Gastos

## 🔄 Flujo de Datos

```
AdminExpenses / PosExpenses
        │
        ├─ gastosFiltrados (por fecha, tipo)
        │
        ├─ useGroupExpensesByTime (Hook)
        │   │
        │   ├─ Extrae HH:mm de cada fecha
        │   │
        │   ├─ Agrupa por timeGroup
        │   │  ├─ 18:45 → [Gasto1, Gasto2]
        │   │  ├─ 18:50 → [Gasto3]
        │   │  └─ 18:51 → [Gasto4, Gasto5, Gasto6]
        │   │
        │   └─ Retorna GastoGroup[]
        │
        ├─ Renderiza ExpandableExpenseRow
        │   │
        │   ├─ 18:45 [2 gastos] ► ┐
        │   │                      ├─ Total: $108.00
        │   │                      └─ Promedio: $54.00
        │   │
        │   ├─ 18:50 [1 gasto]    (sin expandible)
        │   │                      └─ Total: $52.00
        │   │
        │   └─ 18:51 [3 gastos] ▼ ┐
        │      ├─ 18:51:00 ...     │
        │      ├─ 18:51:15 ...     ├─ Expandido
        │      └─ 18:51:45 ...     └─ Total: $295.00
```

---

## 🎨 Interfaz Visual

### Estado Contraído (Por Defecto)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Fecha      │ Tipo        │ Categoría │ Descripción │ Proveedor  │ Monto   │
├───────────────────────────────────────────────────────────────────────────┤
│ ► 18:45    │ Operacional │ Insumos   │ Multipack   │ CREMERIA   │ $108.00 │
│ [2 gastos] │             │           │ +1 más...   │            │ ($54 p) │
├───────────────────────────────────────────────────────────────────────────┤
│ 18:50      │ Operacional │ Insumos   │ Bimbo       │ CREMERIA   │ $52.00  │
├───────────────────────────────────────────────────────────────────────────┤
│ ▼ 18:51    │ Operacional │ Insumos   │ Leche       │ SELLO ROJO │ $295.00 │
│ [3 gastos] │             │           │ +2 más...   │            │ ($98 p) │
└───────────────────────────────────────────────────────────────────────────┘
```

### Estado Expandido (Click en 18:45)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Fecha        │ Tipo        │ Categoría │ Descripción │ Proveedor  │ Monto  │
├───────────────────────────────────────────────────────────────────────────┤
│ ▼ 18:45      │ Operacional │ Insumos   │ Multipack   │ CREMERIA   │ $108   │
│ [2 gastos]   │             │           │ +1 más...   │            │ ($54p) │
├───────────────────────────────────────────────────────────────────────────┤
│ [DETALLES EXPANDIDOS]                                                     │
├───────────────────────────────────────────────────────────────────────────┤
│  18:45:12    │ Operacional │ Insumos   │ Multipack   │ CREMERIA   │ $56.00 │
│  [EDIT] [DEL]                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│  18:45:47    │ Operacional │ Insumos   │ Pan blanco  │ PANADERIA  │ $52.00 │
│  [EDIT] [DEL]                                                              │
├───────────────────────────────────────────────────────────────────────────┤
│ 18:50      │ Operacional │ Insumos   │ Bimbo       │ CREMERIA   │ $52.00  │
├───────────────────────────────────────────────────────────────────────────┤
│ ▼ 18:51    │ Operacional │ Insumos   │ Leche       │ SELLO ROJO │ $295.00 │
│ [3 gastos] │             │           │ +2 más...   │            │ ($98 p) │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 Componentes

### ExpandableExpenseRow

**Props:**
```tsx
{
  gastos: Gasto[];           // Array de gastos en esta hora
  timeGroup: "18:45";        // Hora del grupo
  onEdit: (gasto) => void;   // Callback para editar
  onDelete: (id) => void;    // Callback para eliminar
  isLoading: boolean;        // Estado de carga
}
```

**Estados:**
1. **Múltiples gastos, contraído**
   - Icono: ►
   - Badge: "[2 gastos]"
   - Muestra primer gasto
   - Total calculado
   - Promedio calculado

2. **Múltiples gastos, expandido**
   - Icono: ▼
   - Muestra todos los gastos
   - Timestamps completos
   - Acciones individuales

3. **Un solo gasto**
   - Sin icono expandible
   - Sin badge
   - Fila normal
   - Acciones disponibles

---

## 🔍 Ejemplo Práctico

### Datos Originales (3 registros)
```json
[
  {
    "id": 101,
    "fecha": "2025-12-05T18:45:12.000Z",
    "monto": 56.00,
    "categoriaGastoNombre": "Insumos",
    "proveedorNombre": "CREMERIA"
  },
  {
    "id": 102,
    "fecha": "2025-12-05T18:45:47.000Z",
    "monto": 52.00,
    "categoriaGastoNombre": "Insumos",
    "proveedorNombre": "PANADERIA"
  },
  {
    "id": 103,
    "fecha": "2025-12-05T18:50:15.000Z",
    "monto": 100.00,
    "categoriaGastoNombre": "Insumos",
    "proveedorNombre": "CREMERIA"
  }
]
```

### Resultado de Hook
```tsx
const gastoGrouped = [
  {
    timeGroup: "18:50",
    gastos: [{ id: 103, ... }],
    totalMonto: 100.00
  },
  {
    timeGroup: "18:45",
    gastos: [
      { id: 102, ... },  // DESC por fecha
      { id: 101, ... }
    ],
    totalMonto: 108.00
  }
]
```

### Renderizado
```jsx
<ExpandableExpenseRow
  gastos={[{id:103}]}
  timeGroup="18:50"
/>
// ↓ Fila única, sin expandible

<ExpandableExpenseRow
  gastos={[{id:102}, {id:101}]}
  timeGroup="18:45"
/>
// ↓ Expandible con 2 gastos
```

---

## 🎯 Casos de Uso

### Caso 1: Un solo gasto a las 18:45
```
18:45 │ Operacional │ Insumos │ Leche │ CREMERIA │ $56.00
```
✅ Sin icono expandible  
✅ Acciones disponibles  

### Caso 2: Dos gastos a las 18:45
```
► 18:45 │ Operacional │ Insumos │ Leche │ CREMERIA │ $108.00
[2]     │             │         │ +1... │          │ ($54 p)
```
✅ Con icono expandible  
✅ Badge mostrando cantidad  
✅ Total y promedio  

### Caso 3: Expandido
```
▼ 18:45 │ Operacional │ Insumos │ Leche │ CREMERIA │ $108.00
[2]     │             │         │ +1... │          │ ($54 p)
  18:45:12 │ Operacional │ Insumos │ Leche     │ CREMERIA   │ $56.00
  18:45:47 │ Operacional │ Insumos │ Pan blanco│ PANADERIA  │ $52.00
```
✅ Icono cambió a ▼  
✅ Todos los detalles visibles  
✅ Timestamps completos  

---

## 🔗 Conexión con Código

### En AdminExpenses.tsx

```tsx
// Hook en nivel superior (línea 594)
const gastoGrouped = useGroupExpensesByTime(gastosFiltrados);

// En TableBody
{gastoGrouped.length > 0 ? (
  gastoGrouped.map((group) => (
    <ExpandableExpenseRow
      key={group.timeGroup}
      gastos={group.gastos}
      timeGroup={group.timeGroup}
      onEdit={(gasto) => {
        // Editar lógica
      }}
      onDelete={handleDelete}
      isLoading={loading}
    />
  ))
) : (
  <TableRow>
    <TableCell colSpan={8}>No hay gastos</TableCell>
  </TableRow>
)}
```

### En useGroupExpensesByTime.ts

```tsx
export function useGroupExpensesByTime(gastos: Gasto[]): GastoGroup[] {
  return useMemo(() => {
    // 1. Agrupar por HH:mm
    const grouped = gastos.reduce((acc, gasto) => {
      const timeKey = format(new Date(gasto.fecha), 'HH:mm');
      if (!acc[timeKey]) acc[timeKey] = [];
      acc[timeKey].push(gasto);
      return acc;
    }, {});

    // 2. Convertir a array
    const groups: GastoGroup[] = Object.entries(grouped).map(([timeGroup, groupedGastos]) => ({
      timeGroup,
      gastos: groupedGastos.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ),
      totalMonto: groupedGastos.reduce((sum, g) => sum + g.monto, 0)
    }));

    // 3. Ordenar por hora DESC
    return groups.sort((a, b) => {
      const minutesA = parseInt(a.timeGroup.split(':')[0]) * 60 + parseInt(a.timeGroup.split(':')[1]);
      const minutesB = parseInt(b.timeGroup.split(':')[0]) * 60 + parseInt(b.timeGroup.split(':')[1]);
      return minutesB - minutesA;
    });
  }, [gastos]);
}
```

---

## ✨ Ventajas del Diseño

| Aspecto | Ventaja |
|---------|---------|
| **Escalabilidad** | Fácil agregar más gastos sin abarrotamiento |
| **Rendimiento** | O(n log n) solo se calcula si gastos cambiar |
| **UX** | Información progresiva: resumen → detalles |
| **Mobile** | Tabla más compacta en pantallas pequeñas |
| **Consistencia** | Mismo patrón que ventas/productos |
| **Accesibilidad** | Todos los gastos siguen siendo accesibles |

---

## 🚀 Mejoras Futuras

1. **Persistencia de estado expandido**
   - Recordar qué horas están expandidas
   
2. **Temas por tipo**
   - Colores diferentes para Operacional vs Administrativo
   
3. **Filtros dentro del grupo**
   - Buscar dentro de gastos expandidos
   
4. **Exportar por grupo**
   - Descargar gastos de una hora específica
   
5. **Animaciones mejoradas**
   - Transiciones suaves al expandir

