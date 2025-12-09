# 📋 Plan de Refactorización del Frontend

## Objetivo
Reducir tamaño de archivos grandes (>1000 líneas), mejorar mantenibilidad, reutilizabilidad de componentes y facilitar la comprensión del código.

## Archivos Críticos a Refactorizar

### 1️⃣ AdminSales.tsx (1734 líneas) - PRIORIDAD CRÍTICA
**Problemas:**
- Demasiado grande
- Mezcla lógica de estado, UI, diálogos
- Duplica código con PosSales.tsx

**Estrategia de Separación:**
```
AdminSales.tsx (1734 líneas)
├── hooks/
│   ├── useVentas.ts (obtener ventas, filtrar, paginar)
│   ├── useVentaEdicion.ts (estado de edición, guardado)
│   └── useVentaFiltros.ts (filtros de fecha, sucursal)
├── components/
│   ├── VentasTable.tsx (tabla principal, lógica de visualización)
│   ├── VentaEditDialog.tsx (diálogo de edición completo)
│   ├── VentaCancelDialog.tsx (diálogo de cancelación)
│   ├── VentaDeleteDialog.tsx (diálogo de eliminación)
│   └── VentaItemCard.tsx (tarjeta reutilizable de item)
└── AdminSales.tsx (solo orquestación, ~300-400 líneas)
```

**Objetivo:** Reducir a 300-400 líneas (descomponer en componentes de 150-300 líneas)

### 2️⃣ PosSales.tsx (1469 líneas) - PRIORIDAD ALTA
**Reutilizar:**
- Componentes de diálogos de AdminSales
- Hooks de useVentas, useVentaFiltros
- Componentes comunes

**Estrategia:** Aplicar mismo patrón que AdminSales

### 3️⃣ AdminExpenses.tsx (1096 líneas) - PRIORIDAD MEDIA
**Reutilizar:** Componentes de diálogos comunes, hooks de filtros

### 4️⃣ PosHome.tsx (971 líneas) - PRIORIDAD MEDIA
**Reutilizar:** Componentes de carrito, componentes de UI

### 5️⃣ PosExpenses.tsx (959 líneas) - PRIORIDAD MEDIA

---

## Estructura de Carpetas Propuesta

```
frontend-web/src/
├── components/
│   ├── common/
│   │   ├── dialogs/                    (NUEVO)
│   │   │   ├── ConfirmDialog.tsx       (diálogo genérico de confirmación)
│   │   │   ├── FormDialog.tsx          (diálogo genérico de formulario)
│   │   │   └── DeleteDialog.tsx        (diálogo genérico de eliminación)
│   │   ├── tables/                     (NUEVO)
│   │   │   └── DataTable.tsx           (tabla genérica reutilizable)
│   │   ├── cards/                      (NUEVO)
│   │   │   └── ItemCard.tsx            (tarjeta genérica reutilizable)
│   │   ├── DateRangeFilter.tsx         (EXISTENTE)
│   │   └── ...
│   ├── ventas/                         (NUEVA CARPETA)
│   │   ├── VentasTable.tsx
│   │   ├── VentaEditDialog.tsx
│   │   ├── VentaCancelDialog.tsx
│   │   ├── VentaDeleteDialog.tsx
│   │   └── VentaItemCard.tsx
│   ├── gastos/                         (NUEVA CARPETA - reutilizable)
│   │   └── ...
│   └── ...
├── hooks/
│   ├── ventas/                         (NUEVA CARPETA)
│   │   ├── useVentas.ts
│   │   ├── useVentaEdicion.ts
│   │   └── useVentaFiltros.ts
│   ├── gastos/                         (NUEVA CARPETA)
│   │   └── useGastos.ts
│   └── ...
├── pages/
│   ├── admin/
│   │   ├── AdminSales.tsx (refactorizado)
│   │   ├── AdminExpenses.tsx (refactorizado)
│   │   └── ...
│   └── pos/
│       ├── PosSales.tsx (refactorizado)
│       └── ...
└── ...
```

---

## Estándares de Refactorización

### 1. Tamaño de Componentes
- ✅ Componentes <= 300 líneas (ideal 150-200)
- ❌ Componentes > 500 líneas (refactorizar)

### 2. Responsabilidad Única
- 1 componente = 1 responsabilidad
- Separar UI de lógica (usar hooks)
- Separar diálogos, tablas, tarjetas en componentes independientes

### 3. Reutilización
- Crear componentes genéricos en `common/`
- Crear componentes específicos de dominio en carpetas temáticas
- Si un componente se usa en 2+ lugares, considerarlo para reutilización

### 4. Estructura de Componentes
```tsx
// ✅ CORRECTO: Orden lógico
import ...
import hooks
import components
import types

interface Props {}

const Component: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. Hooks (useState, useEffect, custom hooks)
  // 2. Estado derivado (useMemo, etc)
  // 3. Handlers
  // 4. Effects
  // 5. Render
  
  const handleClick = () => {}
  
  return (...)
}

export default Component
```

### 5. Nombres de Archivos
- Componentes: PascalCase (VentasTable.tsx)
- Hooks: camelCase (useVentas.ts)
- Utils: camelCase (stringFormatters.ts)

### 6. Documentación
- Comentarios en secciones principales
- JSDoc en funciones complejas
- Props documentation

---

## Fases de Refactorización

### FASE 1: Infraestructura (Semana 1)
1. Crear carpetas base (hooks/ventas, components/common/dialogs, etc)
2. Crear componentes genéricos reutilizables (ConfirmDialog, FormDialog)
3. Crear hooks comunes (useFiltros, usePaginacion)

### FASE 2: AdminSales (Semana 2-3)
1. Extraer hooks (useVentas, useVentaEdicion, useVentaFiltros)
2. Extraer componentes (VentasTable, diálogos)
3. Refactorizar AdminSales.tsx
4. Testing

### FASE 3: PosSales (Semana 3-4)
1. Reutilizar componentes/hooks de AdminSales
2. Extraer lo específico de PosSales
3. Refactorizar PosSales.tsx
4. Testing

### FASE 4: AdminExpenses & PosExpenses (Semana 4-5)
1. Aplicar mismo patrón
2. Crear componentes reutilizables de gastos

### FASE 5: Componentes Restantes (Semana 5-6)
1. PosHome.tsx
2. Otros archivos > 400 líneas

---

## Checklist por Refactorización

```
[ ] Identificar responsabilidades principales
[ ] Crear structure de carpetas
[ ] Extraer tipos a archivos .types.ts
[ ] Extraer hooks a archivos .ts
[ ] Extraer componentes (diálogos, tablas, tarjetas)
[ ] Refactorizar archivo principal
[ ] Testing de funcionalidades
[ ] Verificar que no se perdieron features
[ ] Actualizar imports en otros archivos
[ ] Commit con mensaje: "refactor: [Archivo] - Separar en componentes y hooks"
[ ] Documentar componentes nuevos
```

---

## Beneficios Esperados

1. **Mantenibilidad:** Archivos más pequeños = más fácil de entender
2. **Reutilización:** Componentes genéricos en múltiples lugares
3. **Testing:** Componentes pequeños = tests más simples
4. **Performance:** Lazy loading de componentes
5. **Escalabilidad:** Fácil agregar nuevas features
6. **Colaboración:** Mejor para trabajar en equipo (menos conflictos)

---

## Reglas de Oro

✅ **HACER:**
- Extraer lógica a hooks
- Separar UI en componentes pequeños (150-300 líneas)
- Reutilizar componentes comunes
- Documentar cambios

❌ **NO HACER:**
- Cambiar funcionalidades
- Cambiar diseños
- Renombrar sin motivo
- Criar componentes "por si acaso"

---

## Próximos Pasos

1. **Hoy:** Aprobación de plan
2. **Mañana:** Empezar FASE 1 (crear infraestructura)
3. **Esta semana:** Refactorizar AdminSales
4. **Semanas 2-3:** Refactorizar PosSales
5. **Semanas 4+:** Resto de archivos
