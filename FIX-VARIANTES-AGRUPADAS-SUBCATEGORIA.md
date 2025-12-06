# ✅ FIX: Variantes Agrupadas Después de Editar Subcategoría

## 🐛 Problema Reportado

Cuando editas un producto con variantes y **cambias su subcategoría** (ej: de "DESAYUNOS" a "DULCES"), sucede lo siguiente:

```
❌ ANTES:
1. Editas "Molletes" → cambias subcategoría a "DULCES"
2. Se guardan los cambios
3. En el POS, el producto aparece:
   ├─ "Molletes - Dulce" (separado)
   ├─ "Molletes - Salado" (separado)
   ├─ "Molletes - Con Untado" (separado)
   
   ← ❌ No aparecen agrupados bajo "Molletes" con modal de selección

✅ DESPUÉS:
Las variantes aparecen **agrupadas bajo el producto base**
con modal de selección como debe ser.
```

---

## 🔍 Root Cause Analysis

### El Flujo Problemático

**En AdminInventory → Editar Producto:**

```
┌─────────────────────────────────────────┐
│ Cambio subcategoría de DESAYUNOS a DULCES
│ Cambio nombre: "Molletes" → "Molletes"
└─────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────┐
│ ProductoForm.tsx ejecuta:
│
│ 1. Actualizar PRODUCTO BASE ✅
│    nombre: "[DULCES] Molletes"
│
│ 2. Actualizar CADA VARIANTE ❌❌❌ AQUÍ ESTABA EL ERROR
│    nombre: "[DULCES] Molletes - Dulce"
│    nombreVariante: "Dulce"
│    precio: $30
│
│ 3. Actualizar CADA VARIANTE ❌❌❌
│    nombre: "[DULCES] Molletes - Salado"
│    nombreVariante: "Salado"
│    precio: $40
└──────────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────┐
│ Backend: ProductoService.actualizar()
│
│ if (dto.nombre() != null)
│     p.setNombre(dto.nombre()); ← AQUÍ SE ACTUALIZA
│
│ Variantes ahora tienen un nombre nuevo, pero siguen
│ teniendo productoBaseId = 1 (producto base)
│
│ ⚠️ EL PROBLEMA:
│ El nombre cambió pero la relación productoBaseId
│ se "desincroniza" con el nuevo nombre
└──────────────────────────────────────────────────────────┘
             ↓
┌──────────────────────────────────────────────────────────┐
│ En el POS: GET /productos?activo=true&enMenu=true
│
│ Backend devuelve:
│ {
│   id: 1,
│   nombre: "[DULCES] Molletes",
│   variantes: [
│     {
│       id: 2,
│       nombre: "[DULCES] Molletes - Dulce",
│       nombreVariante: "Dulce"
│     },
│     ...
│   ]
│ }
│
│ ✅ Frontend RECIBE BIEN AGRUPADO pero el nombre
│    cambió inesperadamente
└──────────────────────────────────────────────────────────┘
```

### El Verdadero Problema

En `ProductoService.actualizar()` línea 120 (backend):

```java
private void apply(ProductoDTO dto, Producto p) {
    if (dto.nombre() != null)
        p.setNombre(dto.nombre()); // ← Esto actualiza el nombre de LA VARIANTE

    // Si es una variante...
    if (dto.productoBaseId() != null) {
        // Buscar el producto base
        Producto productoBase = productoRepository.findById(dto.productoBaseId())...
        p.setProductoBase(productoBase);
        
        // ⚠️ PERO NO RECONSTRUYE EL NOMBRE como en crearVariante()
    }
}
```

Cuando **creas** una variante (`crearVariante()`):
```java
// El backend RECONSTRUYE el nombre automáticamente
variante.setNombre(
    productoBase.getNombre() + " - " + dto.nombreVariante()
);
```

Pero cuando **actualizas** una variante (`actualizar()`):
```java
// El backend USA el nombre que envíe el frontend
if (dto.nombre() != null)
    p.setNombre(dto.nombre());  // ← Toma lo que envíe
```

---

## ✨ Solución Implementada

**En `frontend-web/src/components/productos/ProductoForm.tsx`** (línea 346-365):

### ❌ ANTES (INCORRECTO):

```typescript
// Actualizar variantes existentes modificadas
const variantesExistentes = variantes.filter(v => v.id);
for (const variante of variantesExistentes) {
  if (variante.nombre.trim()) {
    const precioVariante = variante.precio
      ? parseFloat(variante.precio)
      : parseFloat(precio) || 0;

    // ❌ ENVIABA EL NOMBRE COMPLETO CON NUEVO PREFIJO
    const nombreVarianteFinal = `${nombreFinal} - ${variante.nombre.trim()}`;
    await productosService.actualizar(variante.id, {
      nombre: nombreVarianteFinal,  // ← ❌ ESTO ROMPE LA AGRUPACIÓN
      nombreVariante: variante.nombre.trim(),
      precio: precioVariante,
      ordenVariante: variante.orden,
    });
  }
}
```

### ✅ DESPUÉS (CORRECTO):

```typescript
// Actualizar variantes existentes modificadas
// ⚠️ IMPORTANTE: NO cambiar el "nombre" completo de la variante
// Solo actualizar nombreVariante, precio y orden
// El "nombre" completo se reconstruye en el frontend como: "ProductoBase - Variante"
const variantesExistentes = variantes.filter(v => v.id);
for (const variante of variantesExistentes) {
  if (variante.nombre.trim()) {
    const precioVariante = variante.precio
      ? parseFloat(variante.precio)
      : parseFloat(precio) || 0;

    // ✅ SOLO ACTUALIZAMOS ESTOS CAMPOS
    await productosService.actualizar(variante.id, {
      nombreVariante: variante.nombre.trim(),  // ← ✅ Solo esto
      precio: precioVariante,                   // ← Solo esto
      ordenVariante: variante.orden,            // ← Solo esto
      // ❌ NO enviamos el campo "nombre"
    });
  }
}
```

### ¿Por qué funciona?

1. **No enviamos `nombre`** en la actualización
2. **En el backend**, como `dto.nombre()` es `null`, **no actualiza** el campo
3. **La relación `productoBaseId` se mantiene intacta**
4. **El nombre de la variante sigue siendo el original**, lo que preserva la agrupación

---

## 📋 Cambios Realizados

**Archivo:** `frontend-web/src/components/productos/ProductoForm.tsx`

**Líneas:** 346-365

**Cambio:** 
- ❌ Removida la línea que construía `nombreVarianteFinal` con el nuevo prefijo
- ❌ Removido el campo `nombre` del objeto de actualización
- ✅ Solo se envían `nombreVariante`, `precio` y `ordenVariante`

---

## 🧪 Testing

Para verificar que funciona:

### Test 1: Editar Producto con Variantes

```
1. Ir a Admin → Inventario
2. Buscar "Molletes - Dulce" (o cualquier producto con variantes)
3. Click en ⚙️ (editar)
4. Cambiar categoría/subcategoría
5. Guardar

✅ RESULTADO ESPERADO:
- Las variantes siguen apareciendo agrupadas en el POS
- Al clickear "Molletes", abre el modal con:
  ├─ Dulce - $30
  ├─ Salado - $40
  └─ Con Untado - $35
```

### Test 2: Verificar en POS

```
1. Ir a Punto de Venta
2. Seleccionar categoría "Desayunos"
3. Buscar "Molletes"
4. Click en "Molletes"

✅ RESULTADO ESPERADO:
- Se abre modal de selección de variantes
- Muestra todas las variantes agrupadas
- NO aparecen como productos separados
```

---

## 📚 Arquitectura de Variantes (Referencia)

```
PRODUCTO BASE (id=1):
├─ nombre: "Molletes"
├─ nombreVariante: null (es producto base)
├─ productoBaseId: null (es producto base)
└─ variantes: [
    {
      id: 2,
      nombre: "Molletes - Dulce",
      nombreVariante: "Dulce",
      productoBaseId: 1,
      variantes: [] (es variante, no tiene hijas)
    },
    {
      id: 3,
      nombre: "Molletes - Salado",
      nombreVariante: "Salado",
      productoBaseId: 1,
      variantes: []
    }
  ]
```

**Regla Importante:** 
- `nombreVariante` describe la variante (ej: "Dulce", "Chico", "1L")
- `nombre` es el nombre completo (ej: "Molletes - Dulce")
- El backend reconstruye `nombre` automáticamente al crear variantes
- Al actualizar, solo cambiar `nombreVariante`, no `nombre`

---

## ✅ Compilación y Validación

✅ Frontend compila sin errores  
✅ TypeScript valida correctamente  
✅ No hay breaking changes  
✅ Backend no requiere cambios (solo ajuste en frontend)

---

## 🚀 Deployment

Una vez que confirmes que funciona:

1. `cd frontend-web && npm run build` (ya hecho ✅)
2. Pushear cambios a rama `develop`
3. Testear en desarrollo/staging
4. Mergear a `main` para producción

