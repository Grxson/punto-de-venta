# 🏗️ Plan de Refactorización - Arquitectura de Componentes Reutilizables

## 📊 Estado Actual

### Archivos Grandes (necesitan refactorización)
- **AdminSales.tsx** - 1734 líneas ❌
- **PosSales.tsx** - 1469 líneas ❌
- **AdminExpenses.tsx** - 1096 líneas ⚠️
- **PosHome.tsx** - 971 líneas ⚠️
- **PosExpenses.tsx** - 959 líneas ⚠️
- **AdminReports.tsx** - 855 líneas ⚠️

### Problemas Identificados

#### 1. **Duplicación de Lógica de Dialogs (50+ líneas por diálogo)**
Patrón que se repite en 6+ archivos:
```tsx
// ❌ DUPLICADO EN MÚLTIPLES ARCHIVOS
const [dialogoCancelacion, setDialogoCancelacion] = useState(false);
const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
const [motivoCancelacion, setMotivoCancelacion] = useState('');
const [errorMotivo, setErrorMotivo] = useState<string | null>(null);

const handleAbrirDialogoCancelacion = (venta: Venta) => { /*...*/ };
const handleCerrarDialogoCancelacion = () => { /*...*/ };
const handleCancelarVenta = async () => { /*...*/ };
```

#### 2. **Duplicación de UI de Dialogs (200+ líneas por página)**
- Dialog de confirmación (cancelación, eliminación)
- Dialog de edición (ventas, gastos)
- Dialog de creación (productos, gastos)

#### 3. **Duplicación de Validación de Formularios**
- Validación de campos obligatorios
- Validación de montos/cantidades
- Validación de estados

#### 4. **Componentes Monolíticos**
- AdminSales mezcla: tabla, dialogs, lógica de API, cálculos, UI
- Difícil de testear, mantener y reutilizar

---

## ✅ Solución: Arquitectura de Componentes Reutilizables

### Nivel 1: Hooks Personalizados (Lógica)

#### `useConfirmDialog` - Hook para diálogos de confirmación
```typescript
// Location: frontend-web/src/hooks/useConfirmDialog.ts
interface ConfirmDialogState {
  open: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useConfirmDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    open,
    isLoading,
    error,
    openDialog: () => setOpen(true),
    closeDialog: () => !isLoading && setOpen(false),
    setLoading: (loading: boolean) => setIsLoading(loading),
    setError: (err: string | null) => setError(err),
  };
};
```

**Beneficios:**
- Elimina 40+ líneas de state declarations
- Reutilizable en 10+ componentes
- Lógica centralizada

#### `useFormDialog` - Hook para diálogos de formulario
```typescript
// Location: frontend-web/src/hooks/useFormDialog.ts
interface FormDialogState<T> {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  data: T | null;
}

export const useFormDialog = <T,>(initialData?: T) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(initialData || null);

  return {
    open,
    isLoading,
    error,
    data,
    openDialog: (item?: T) => { setOpen(true); setData(item || null); },
    closeDialog: () => !isLoading && setOpen(false),
    setLoading: (loading: boolean) => setIsLoading(loading),
    setError: (err: string | null) => setError(err),
    setData: (newData: T | null) => setData(newData),
  };
};
```

#### `useVentaManagement` - Hook centralizado para ventas
```typescript
// Location: frontend-web/src/hooks/useVentaManagement.ts
// Centraliza: obtener ventas, cancelar, editar, eliminar
// Usado por: AdminSales, PosSales
```

#### `useGastoManagement` - Hook centralizado para gastos
```typescript
// Location: frontend-web/src/hooks/useGastoManagement.ts
// Centraliza: obtener gastos, crear, editar, eliminar
// Usado por: AdminExpenses, PosExpenses
```

---

### Nivel 2: Componentes Reutilizables (UI)

#### `ConfirmationDialog` - Diálogo genérico de confirmación
```typescript
// Location: frontend-web/src/components/common/ConfirmationDialog.tsx
interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Reemplaza diálogos de: cancelación, eliminación, confirmación de cambios
```

**Reemplazará:**
- Dialog de cancelación en AdminSales (70 líneas)
- Dialog de eliminación en AdminSales (80 líneas)
- Diálogos similares en PosSales, AdminExpenses, etc.

#### `FormDialog` - Diálogo genérico de formulario
```typescript
// Location: frontend-web/src/components/common/FormDialog.tsx
interface FormDialogProps<T> {
  open: boolean;
  title: string;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (data: T) => void;
  children: React.ReactNode;
}

// Reemplaza diálogos de: crear gasto, crear producto, etc.
```

#### `DataTable` - Tabla genérica con acciones
```typescript
// Location: frontend-web/src/components/common/DataTable.tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAction?: (action: string, item: T) => void;
}

// Reemplaza: TablaVentas, TablaGastos, etc.
```

---

### Nivel 3: Componentes de Dominio (Específicos del negocio)

#### `SalesEditDialog` - Diálogo de edición de ventas (reutilizable)
```typescript
// Location: frontend-web/src/components/sales/SalesEditDialog.tsx
// Usado por: AdminSales, PosSales
// Contiene: edición de items, pagos, fecha, nota
// Reduce AdminSales de 1734 a ~400 líneas
```

#### `SalesTable` - Tabla de ventas con acciones
```typescript
// Location: frontend-web/src/components/sales/SalesTable.tsx
// Props: ventas[], onEdit, onCancel, onDelete
// Reduce código de tabla en AdminSales y PosSales
```

#### `ExpenseDialog` - Diálogo de gasto (reutilizable)
```typescript
// Location: frontend-web/src/components/expenses/ExpenseDialog.tsx
// Usado por: AdminExpenses, PosExpenses
// Reduce código duplicado entre ambas páginas
```

---

## 🎯 Objetivos de Refactorización

| Archivo | Líneas Actuales | Líneas Objetivo | Reducción | Estrategia |
|---------|-----------------|-----------------|-----------|-----------|
| AdminSales.tsx | 1734 | 500 | -71% | Extraer dialogs, table, hooks |
| PosSales.tsx | 1469 | 400 | -73% | Compartir componentes con AdminSales |
| AdminExpenses.tsx | 1096 | 400 | -63% | Compartir componentes con PosExpenses |
| PosExpenses.tsx | 959 | 350 | -63% | Compartir componentes con AdminExpenses |

---

## 📋 Estructura de Carpetas (Propuesta)

```
frontend-web/src/
├── hooks/
│   ├── useConfirmDialog.ts          [NUEVO]
│   ├── useFormDialog.ts             [NUEVO]
│   ├── useVentaManagement.ts        [NUEVO]
│   ├── useGastoManagement.ts        [NUEVO]
│   └── ... (hooks existentes)
│
├── components/
│   ├── common/
│   │   ├── ConfirmationDialog.tsx   [NUEVO]
│   │   ├── FormDialog.tsx           [NUEVO]
│   │   ├── DataTable.tsx            [NUEVO]
│   │   ├── DateRangeFilter.tsx      [EXISTENTE]
│   │   └── ...
│   │
│   ├── sales/
│   │   ├── SalesEditDialog.tsx      [NUEVO]
│   │   ├── SalesTable.tsx           [NUEVO]
│   │   ├── SalesItemsEditor.tsx     [NUEVO]
│   │   ├── SalesPaymentPanel.tsx    [NUEVO]
│   │   └── ...
│   │
│   ├── expenses/
│   │   ├── ExpenseDialog.tsx        [NUEVO]
│   │   ├── ExpenseTable.tsx         [NUEVO]
│   │   ├── ExpandableExpenseRow.tsx [EXISTENTE]
│   │   └── ...
│   │
│   ├── productos/
│   │   ├── ProductoForm.tsx         [EXISTENTE]
│   │   └── ...
│   │
│   └── admin/
│       └── ...
│
└── pages/
    ├── admin/
    │   ├── AdminSales.tsx           [REFACTORIZADO]
    │   ├── AdminExpenses.tsx        [REFACTORIZADO]
    │   └── ...
    └── pos/
        ├── PosSales.tsx             [REFACTORIZADO]
        ├── PosExpenses.tsx          [REFACTORIZADO]
        └── ...
```

---

## 🚀 Orden de Ejecución (Fase a Fase)

### Fase 1: Fundamentos (Hooks + Componentes Base)
1. ✓ Crear `useConfirmDialog`
2. ✓ Crear `useFormDialog`
3. ✓ Crear `ConfirmationDialog` genérico
4. ✓ Crear `FormDialog` genérico

**Impacto:** Elimina 300+ líneas de código duplicado en dialogs

### Fase 2: Ventas
5. ✓ Crear `useVentaManagement` hook
6. ✓ Crear `SalesEditDialog` componente
7. ✓ Crear `SalesTable` componente
8. ✓ Crear `SalesItemsEditor` componente
9. ✓ Refactorizar AdminSales.tsx usando nuevos componentes
10. ✓ Refactorizar PosSales.tsx usando nuevos componentes

**Impacto:** AdminSales 1734 → 500 líneas, PosSales 1469 → 400 líneas

### Fase 3: Gastos
11. ✓ Crear `useGastoManagement` hook
12. ✓ Crear `ExpenseDialog` componente (compartido)
13. ✓ Crear `ExpenseTable` componente (compartido)
14. ✓ Refactorizar AdminExpenses.tsx
15. ✓ Refactorizar PosExpenses.tsx

**Impacto:** Elimina duplicación entre AdminExpenses y PosExpenses

### Fase 4: Optimizaciones
16. ✓ Crear `DataTable` componente genérico
17. ✓ Extraer `PaymentPanel` para pagos en diálogos
18. ✓ Optimizar otros archivos (AdminReports, AdminDashboard)

---

## 🔄 Beneficios de la Refactorización

### Antes (Situación Actual)
```
AdminSales (1734 líneas) + PosSales (1469 líneas) = 3203 líneas
- Dialogs: ~300 líneas duplicadas
- Validación: ~150 líneas duplicadas
- Lógica de API: ~200 líneas similares
- Difícil testear
- Difícil mantener
```

### Después (Refactorizado)
```
AdminSales (500 líneas) + PosSales (400 líneas) = 900 líneas
+ Hooks (150 líneas) + Componentes (400 líneas) = 1450 líneas totales
- Reducción del 55% en líneas de código
- 100% reutilizable
- Fácil de testear
- Fácil de mantener
- Consistencia visual en toda la app
```

---

## 📝 Checklist de Validación

Después de cada refactorización:
- [ ] El componente/hook funciona igual que antes
- [ ] No hay duplicación de código
- [ ] Props están documentadas con comentarios
- [ ] Tipos TypeScript están definidos
- [ ] No hay errores de compilación
- [ ] Las pruebas manuales pasan
- [ ] La UX/UI es idéntica
- [ ] El componente es reutilizable en al menos 2 lugares

---

## 🎨 Principios de Diseño

1. **Single Responsibility Principle**
   - Cada componente hace una cosa bien
   - Cada hook maneja un aspecto específico

2. **DRY (Don't Repeat Yourself)**
   - Si el código se repite 2+ veces, debería extraerse
   - Los hooks centralizan la lógica compartida

3. **Composición sobre Herencia**
   - Construir componentes complejos con componentes simples
   - SalesEditDialog = SalesItemsEditor + SalesPaymentPanel + FormDialog

4. **Props Bien Nombradas**
   - `onConfirm` vs `onOk`
   - `isLoading` vs `loading`
   - Consistencia en toda la app

5. **Documentación Inline**
   - Comentarios en funciones complejas
   - JSDoc para componentes públicos
   - Ejemplos de uso

---

## 📚 Documentación Generada

- [ ] README para hooks personalizados
- [ ] README para componentes reutilizables
- [ ] Guía de uso de ConfirmationDialog
- [ ] Guía de uso de FormDialog
- [ ] Guía de extensión de componentes

---

**Estado:** 🟡 En Planificación
**Próximo Paso:** Iniciar Fase 1 - Crear hooks fundamentales
