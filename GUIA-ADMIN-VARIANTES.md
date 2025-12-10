# Guía: Admin - Creación y Edición de Productos con Variantes Multi-Paso

**Objetivo**: Permitir que el admin cree productos con variantes que tengan tamaños y atributos configurables.

---

## 🎯 Flujo de creación en AdminProductos

### Paso 1: Crear Producto Base
```
Form: Nuevo Producto
├─ Nombre: "Jugo Natural" (requerido)
├─ Descripción: "Jugo 100% natural"
├─ Categoría: Bebidas (dropdown)
├─ Precio Base: 100.00 (requerido)
├─ Costo Estimado: 30.00
├─ SKU: JNG-001
├─ Disponible en Menú: ✓
└─ [Guardar]
   → Producto base creado con ID 15
```

---

### Paso 2: Agregar Variantes
```
Producto "Jugo Natural" → Tab: Variantes
├─ Lista de variantes existentes:
│  └─ Vacío (sin variantes)
│
└─ [+ Agregar Variante]
   ↓
   Modal: Nueva Variante
   ├─ Nombre de variante: "Jugo Verde" (requerido)
   ├─ Precio (heredado del base o custom): 100.00
   ├─ Orden: 1
   └─ [Guardar Variante]
      → Variante creada con ID 16 (producto_base_id=15)
```

**Repetir para más variantes**:
- Variante 2: "Jugo Rojo" (ID 17)
- Variante 3: "Jugo Naranja" (ID 18)

---

### Paso 3: Configurar Tamaños para Variante
```
Variante "Jugo Verde" (ID 16)
├─ [Gestionar Tamaños]
   ↓
   Modal: Tamaños disponibles
   ├─ ☐ Pequeño (0.00)        [Orden: 1] [Agregar]
   ├─ ☐ Mediano (50.00)       [Orden: 2] [Agregar]
   ├─ ☐ Grande (100.00)       [Orden: 3] [Agregar]
   ├─ ☐ Extra Grande (150.00) [Orden: 4] [Agregar]
   │
   ├─ [+ Crear nuevo tamaño]
   │  └─ Modal rápido: Nombre, precio_extra, orden
   │
   └─ Tamaños asignados:
      ├─ 1. Pequeño (0.00) [Mover ↑] [Mover ↓] [Eliminar]
      ├─ 2. Mediano (50.00) [Mover ↑] [Mover ↓] [Eliminar]
      └─ 3. Grande (100.00) [Mover ↑] [Mover ↓] [Eliminar]
```

---

### Paso 4: Configurar Atributos para Variante
```
Variante "Jugo Verde" (ID 16)
├─ [Gestionar Atributos]
   ↓
   Modal: Atributos disponibles
   ├─ [+ Crear nuevo atributo]
   │  ↓
   │  Form: Nuevo Atributo
   │  ├─ Nombre: "Ingrediente" (requerido)
   │  ├─ Tipo: ◉ Múltiple (selección múltiple)
   │  │         ○ Simple (selección única)
   │  ├─ ¿Requerido?: ☑ Sí (checkbox)
   │  ├─ Orden: 1
   │  └─ [Siguiente →]
   │     ↓
   │     Se abre Form: Opciones del atributo
   │     ├─ [+ Agregar opción]
   │     │  ├─ Nombre: "Naranja"
   │     │  ├─ Precio extra: 0.00
   │     │  ├─ Orden: 1
   │     │  └─ [Agregar]
   │     │
   │     ├─ [+ Agregar opción]
   │     │  ├─ Nombre: "Zanahoria"
   │     │  ├─ Precio extra: 0.00
   │     │  ├─ Orden: 2
   │     │  └─ [Agregar]
   │     │
   │     ├─ [+ Agregar opción]
   │     │  ├─ Nombre: "Toronja"
   │     │  ├─ Precio extra: 0.00
   │     │  ├─ Orden: 3
   │     │  └─ [Agregar]
   │     │
   │     ├─ [+ Agregar opción]
   │     │  ├─ Nombre: "Betabel"
   │     │  ├─ Precio extra: 0.00
   │     │  ├─ Orden: 4
   │     │  └─ [Agregar]
   │     │
   │     ├─ [+ Agregar opción]
   │     │  ├─ Nombre: "Agua"
   │     │  ├─ Precio extra: 0.00
   │     │  ├─ Orden: 5
   │     │  └─ [Agregar]
   │     │
   │     └─ [Guardar Atributo]
   │
   └─ Atributos asignados:
      ├─ 1. Ingrediente (MULTIPLE, requerido)
      │  ├─ Naranja (0.00)
      │  ├─ Zanahoria (0.00)
      │  ├─ Toronja (0.00)
      │  ├─ Betabel (0.00)
      │  ├─ Agua (0.00)
      │  └─ [Editar] [Eliminar]
      │
      └─ [+ Agregar otro atributo]
         └─ Para "Complemento", "Salsa", etc.
```

---

## 📋 Arquitectura UI (Admin)

### Estructura de tabs en AdminProductos:

```
AdminProductos {productoId}
├─ Tab 1: [Información General]
│  ├─ Nombre, Descripción, Categoría
│  ├─ Precio, Costo, SKU
│  ├─ Activo, Disponible en Menú
│  └─ [Guardar]
│
├─ Tab 2: [Variantes]
│  ├─ Si es producto base:
│  │  ├─ Tabla de variantes
│  │  │  ├─ Nombre | Precio | Orden | Acciones
│  │  │  ├─ Jugo Verde | 100.00 | 1 | [Editar] [Tamaños] [Atributos] [Eliminar]
│  │  │  ├─ Jugo Rojo | 100.00 | 2 | [Editar] [Tamaños] [Atributos] [Eliminar]
│  │  │  └─ Jugo Naranja | 100.00 | 3 | [Editar] [Tamaños] [Atributos] [Eliminar]
│  │  └─ [+ Nueva Variante]
│  │
│  └─ Si es variante:
│     ├─ Info de variante (nombre, orden en padre)
│     ├─ [Gestionar Tamaños]
│     ├─ [Gestionar Atributos]
│     └─ [Volver a producto base]
│
├─ Tab 3: [Receta/Inventario] (opcional)
│  └─ Ingredientes y cantidades
│
└─ Tab 4: [Configuración]
   └─ Otras opciones
```

---

## 🔄 Operaciones CRUD en Admin

### Crear Producto completo:

```javascript
// 1. Crear producto base
POST /api/v1/productos
{
  "nombre": "Jugo Natural",
  "descripcion": "Jugo 100% natural",
  "categoriaId": 5,
  "precio": 100.00,
  "costoEstimado": 30.00,
  "sku": "JNG-001",
  "disponibleEnMenu": true
}
// Response: { id: 15, ... }

// 2. Crear variante 1
POST /api/v1/productos
{
  "nombre": "Jugo Natural",
  "productoBaseId": 15,
  "nombreVariante": "Jugo Verde",
  "precio": 100.00,
  "ordenVariante": 1
}
// Response: { id: 16, ... }

// 3. Crear variante 2
POST /api/v1/productos
{
  "nombre": "Jugo Natural",
  "productoBaseId": 15,
  "nombreVariante": "Jugo Rojo",
  "precio": 100.00,
  "ordenVariante": 2
}
// Response: { id: 17, ... }

// 4. Agregar tamaño "Pequeño" a variante 16
POST /api/v1/productos/16/tamanios
{
  "tamañoId": 1, // Si existe catálogo
  "orden": 1
}
// O crear nuevo tamaño
POST /api/v1/productos/tamanios
{
  "nombre": "Pequeño",
  "precioExtra": 0,
  "orden": 1
}
// Response: { id: 1, ... }

// 5. Agregar atributo "Ingrediente" a variante 16
POST /api/v1/productos/16/atributos
{
  "nombre": "Ingrediente",
  "tipo": "MULTIPLE",
  "requerido": true,
  "orden": 1
}
// Response: { id: 1, ... }

// 6. Agregar opciones al atributo 1
POST /api/v1/atributos/1/opciones
{
  "nombre": "Naranja",
  "precioExtra": 0,
  "orden": 1
}
// Response: { id: 10, ... }

// Repetir para Zanahoria, Toronja, Betabel, Agua
```

---

### Editar Variante existente:

```javascript
// Obtener variante con todas sus relaciones
GET /api/v1/productos/16?includeVariantes=true

// Response incluye:
{
  "id": 16,
  "nombre": "Jugo Natural",
  "nombreVariante": "Jugo Verde",
  "productoBaseId": 15,
  "tamaños": [
    { "id": 1, "tamañoId": 1, "tamañoNombre": "Pequeño", "orden": 1 },
    { "id": 2, "tamañoId": 2, "tamañoNombre": "Mediano", "orden": 2 }
  ],
  "atributos": [
    {
      "id": 1,
      "nombre": "Ingrediente",
      "tipo": "MULTIPLE",
      "requerido": true,
      "orden": 1,
      "opciones": [
        { "id": 10, "nombre": "Naranja", "precioExtra": 0, "orden": 1 },
        { "id": 11, "nombre": "Zanahoria", "precioExtra": 0, "orden": 2 }
      ]
    }
  ]
}
```

---

### Eliminar Variante:

```javascript
// Eliminar variante (puede cascadear eliminación de tamaños/atributos)
DELETE /api/v1/productos/16
```

---

## 🎨 Componentes React que se necesitan

### `AdminProductoForm.tsx`
- Tabs para información, variantes, receta
- Integración con servicios de ProductoService

### `VariantesTab.tsx`
- Tabla de variantes (si es producto base)
- Botones para [Editar], [Tamaños], [Atributos]
- Modal para crear nueva variante

### `TamañosModal.tsx`
- Muestra lista de tamaños disponibles
- Agrega tamaños a la variante
- Reordena con drag-and-drop (opcional)
- Botón para crear nuevo tamaño rápidamente

### `AtributosModal.tsx`
- Form para crear atributo (nombre, tipo, requerido)
- Sub-form para agregar opciones
- Tabla de atributos asignados
- Editar/Eliminar opciones

### `OpcionesModal.tsx`
- Agregar opciones a un atributo
- Editar orden y precio extra

---

## 🚀 Consideraciones de UX

### Modal Multi-paso para atributos:

```
Paso 1: Crear Atributo
├─ Nombre, Tipo, Requerido, Orden
└─ [Siguiente →]

Paso 2: Agregar Opciones
├─ Campo de texto para cada opción (Naranja, Zanahoria, etc.)
├─ Precio extra por opción
├─ Orden
└─ [Agregar opción]

Paso 3: Confirmar
├─ Resumen del atributo
├─ Resumen de opciones
└─ [Guardar] [Cancelar]
```

### Validaciones:

- **Atributo sin opciones**: No permitir guardar si tipo es MULTIPLE y no hay opciones
- **Nombre duplicado**: Validar que no exista otro atributo con el mismo nombre en la variante
- **Orden**: Auto-asignar si no se especifica
- **Precio extra**: Por defecto 0.00

---

## 📊 Ejemplo: Producto "Jugo" completamente configurado

```
Producto: Jugo Natural (ID 15)
├─ Variante 1: Jugo Verde (ID 16)
│  ├─ Tamaños:
│  │  ├─ Pequeño (0.00)
│  │  ├─ Mediano (50.00)
│  │  └─ Grande (100.00)
│  └─ Atributos:
│     └─ Ingrediente (MULTIPLE, requerido)
│        ├─ Naranja (0.00)
│        ├─ Zanahoria (0.00)
│        ├─ Toronja (0.00)
│        ├─ Betabel (0.00)
│        └─ Agua (0.00)
│
├─ Variante 2: Jugo Rojo (ID 17)
│  ├─ Tamaños:
│  │  ├─ Pequeño (0.00)
│  │  ├─ Mediano (50.00)
│  │  └─ Grande (100.00)
│  └─ Atributos:
│     └─ Ingrediente (MULTIPLE, requerido)
│        ├─ Manzana (0.00)
│        ├─ Fresa (10.00)
│        ├─ Granada (15.00)
│        └─ Agua (0.00)
│
└─ Variante 3: Jugo Naranja (ID 18)
   ├─ Tamaños: [igual que variante 1]
   └─ Atributos: [Ingrediente personalizado]
```

---

## 🔒 Seguridad y Validaciones

1. **Solo ADMIN puede crear/editar/eliminar** variantes y atributos
2. **Segregación por sucursal**: Admin solo accede a productos de su sucursal
3. **Validación de integridad**: 
   - No eliminar tamaño/atributo si hay ventas con él
   - Soft delete para mantener historial
4. **Auditoría**: Registrar quién y cuándo se editó cada elemento

