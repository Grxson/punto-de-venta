# 🧪 PLAN DE PRUEBAS - CRUDS DESDE FRONTEND

**Fecha**: 8 de diciembre de 2025  
**Estado**: Listo para ejecutar

---

## 📋 Checklist de Pruebas

### 🔴 PRODUCTOS

#### CREATE - Producto Base (Sin Variantes)
- [ ] Ir a Administración → Productos
- [ ] Click en "Nuevo Producto"
- [ ] Llenar: Nombre, Categoría, Precio, Costo
- [ ] Guardar
- [ ] ✅ Verificar que aparece en lista y toma sucursal actual

#### CREATE - Producto Base (Con Variantes)
- [ ] Crear producto base
- [ ] Click en "Agregar Variante"
- [ ] Llenar: Nombre variante (ej: "1L", "500ml"), Precio
- [ ] Agregar 2-3 variantes
- [ ] Guardar
- [ ] ✅ Verificar que se crean todas las variantes

#### READ - Listar Productos
- [ ] Loguear como usuario de Sucursal 2
- [ ] Verificar que ves solo productos de Sucursal 2
- [ ] Loguear como admin (Sucursal 1)
- [ ] Verificar que ves productos de Sucursal 1
- [ ] ✅ Verificar que NO se mezclan datos

#### READ - Obtener Producto Individual
- [ ] Click en un producto para verlo
- [ ] ✅ Verificar que carga bien y muestra sus variantes

#### UPDATE - Editar Producto
- [ ] Click en "Editar" en un producto
- [ ] Cambiar nombre, precio, etc.
- [ ] Guardar
- [ ] ✅ Verificar que los cambios se guardan

#### UPDATE - Editar Variante
- [ ] Click en "Editar" en una variante de un producto
- [ ] Cambiar precio o nombre
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza

#### DELETE - Eliminar Variante
- [ ] Crear producto con 3 variantes
- [ ] Eliminar una variante (debería haber botón "X" o "Eliminar")
- [ ] ✅ Verificar que se elimina solo esa variante

#### DELETE - Eliminar Producto Base (CON variantes)
- [ ] Crear producto con variantes
- [ ] Click en "Eliminar"
- [ ] Confirmar
- [ ] ✅ **IMPORTANTE**: Verificar que se eliminan TODAS las variantes automáticamente
- [ ] ✅ Verificar que el producto desaparece de la lista

#### DELETE - Eliminar Producto Base (Sin variantes)
- [ ] Crear producto sin variantes
- [ ] Eliminar
- [ ] ✅ Verificar que se elimina

---

### 🟠 CATEGORÍAS

#### CREATE - Categoría
- [ ] Ir a Administración → Categorías
- [ ] Click en "Nueva Categoría"
- [ ] Nombre: "Test Category"
- [ ] Guardar
- [ ] ✅ Verificar que se crea y toma sucursal actual

#### CREATE - Subcategoría
- [ ] Click en una categoría existente
- [ ] Click en "Agregar Subcategoría"
- [ ] Nombre: "Test Subcategory"
- [ ] Guardar
- [ ] ✅ Verificar que se crea la subcategoría dentro de la categoría

#### READ - Listar Categorías
- [ ] Cambiar a Sucursal 2
- [ ] Verificar que ves solo categorías de Sucursal 2
- [ ] Cambiar a Sucursal 1
- [ ] Verificar que ves solo categorías de Sucursal 1
- [ ] ✅ Verificar segregación completa

#### UPDATE - Editar Categoría
- [ ] Click en "Editar" en una categoría
- [ ] Cambiar nombre
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza

#### UPDATE - Editar Subcategoría
- [ ] Click en una categoría
- [ ] Click en "Editar" en una subcategoría
- [ ] Cambiar nombre
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza

#### DELETE - Eliminar Categoría SIN Productos
- [ ] Crear categoría nueva
- [ ] Eliminar
- [ ] ✅ Verificar que se elimina

#### DELETE - Eliminar Categoría CON Productos
- [ ] Crear categoría
- [ ] Crear producto en esa categoría
- [ ] Intentar eliminar la categoría
- [ ] ✅ Verificar que da error: "No se puede eliminar categoría con productos"

#### DELETE - Eliminar Categoría CON Subcategorías
- [ ] Crear categoría
- [ ] Agregar 2 subcategorías
- [ ] Eliminar la categoría
- [ ] ✅ **IMPORTANTE**: Verificar que se eliminan TODAS las subcategorías automáticamente

---

### 💳 VENTAS

#### CREATE - Nueva Venta
- [ ] Ir a Punto de Venta
- [ ] Seleccionar un producto
- [ ] Seleccionar cantidad
- [ ] Seleccionar método de pago
- [ ] Confirmar venta
- [ ] ✅ Verificar que aparece en "Historial de Ventas"
- [ ] ✅ Verificar que se suma en "Resumen del Día"

#### CREATE - Venta CON Variantes
- [ ] Seleccionar producto con variantes
- [ ] Seleccionar variante específica
- [ ] Agregar a carrito
- [ ] Pagar
- [ ] ✅ Verificar que se registra correctamente

#### UPDATE - Editar Venta
- [ ] En historial, buscar una venta
- [ ] Click en "Editar"
- [ ] Cambiar cantidad o método de pago
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza el total

#### DELETE - Anular Venta
- [ ] En historial, buscar una venta
- [ ] Click en "Anular" o "Eliminar"
- [ ] Confirmar
- [ ] ✅ Verificar que desaparece del historial
- [ ] ✅ Verificar que se resta del "Resumen del Día"

#### READ - Resumen del Día
- [ ] Hacer varias ventas
- [ ] Verificar que "Resumen del Día" suma correctamente:
  - [ ] Total Venta: suma todos los montos
  - [ ] Desglose: Efectivo, Tarjeta, Transferencia correctos
  - [ ] Gastos: Resta de gastos
  - [ ] Neto: Venta - Gastos ✅ (Fue corregido hoy)

---

### 💰 GASTOS

#### CREATE - Nuevo Gasto
- [ ] Ir a Administración → Gastos
- [ ] Click en "Nuevo Gasto"
- [ ] Categoría: seleccionar una
- [ ] Descripción: llenar
- [ ] Monto: llenar
- [ ] Guardar
- [ ] ✅ Verificar que aparece en lista y suma en "Resumen del Día"

#### READ - Listar Gastos
- [ ] Cambiar a Sucursal 2
- [ ] Ver gastos de Sucursal 2
- [ ] Cambiar a Sucursal 1
- [ ] Ver gastos de Sucursal 1
- [ ] ✅ Verificar que NO se mezclan gastos entre sucursales

#### UPDATE - Editar Gasto
- [ ] Click en un gasto
- [ ] Cambiar monto, categoría, descripción
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza

#### DELETE - Eliminar Gasto
- [ ] Click en "Eliminar" en un gasto
- [ ] Confirmar
- [ ] ✅ Verificar que se elimina y resta del total

---

### 👥 USUARIOS (Solo ADMIN)

#### CREATE - Nuevo Usuario
- [ ] Ir a Administración → Usuarios
- [ ] Click en "Nuevo Usuario"
- [ ] Username: "testuser"
- [ ] Password: llenar
- [ ] Rol: seleccionar "CAJERO"
- [ ] Sucursal: seleccionar una
- [ ] Guardar
- [ ] ✅ Verificar que se crea

#### READ - Listar Usuarios
- [ ] Verificar lista de usuarios
- [ ] ✅ Verificar que muestra sucursal de cada usuario

#### UPDATE - Editar Usuario
- [ ] Click en un usuario
- [ ] Cambiar rol o sucursal
- [ ] Guardar
- [ ] ✅ Verificar que se actualiza

#### DELETE - Eliminar Usuario
- [ ] Click en "Eliminar" en un usuario
- [ ] Confirmar
- [ ] ✅ Verificar que se elimina

---

## 🧬 Pruebas de Segregación

### Test 1: No Ver Datos de Otra Sucursal
```
1. Loguear como "dev" (Sucursal 2)
2. Anotar cantidad de productos visibles: ___
3. Loguear como "admin" (Sucursal 1)
4. Anotar cantidad de productos visibles: ___
5. Los números deben ser diferentes
6. ✅ Verificar que NO coinciden los IDs de productos
```

### Test 2: No Editar Datos de Otra Sucursal
```
1. Loguear como usuario de Sucursal 2
2. Obtener ID de un gasto de Sucursal 2: ___
3. Obtener ID de un gasto de Sucursal 1: ___
4. Intentar editar el gasto de Sucursal 1 (vía URL o API)
5. ✅ Verificar que da error 404 o 403
```

### Test 3: No Eliminar Datos de Otra Sucursal
```
1. Loguear como usuario de Sucursal 2
2. Obtener ID de un producto de Sucursal 1: ___
3. Intentar eliminar ese producto (vía API)
4. ✅ Verificar que da error 404 o 403
```

---

## 📊 Formulario de Resultados

| Módulo | CREATE | READ | UPDATE | DELETE | Status |
|--------|--------|------|--------|--------|--------|
| **Productos** | ☐ | ☐ | ☐ | ☐ | ⏳ |
| **Categorías** | ☐ | ☐ | ☐ | ☐ | ⏳ |
| **Subcategorías** | ☐ | ☐ | ☐ | ☐ | ⏳ |
| **Ventas** | ☐ | ☐ | ☐ | ☐ | ⏳ |
| **Gastos** | ☐ | ☐ | ☐ | ☐ | ⏳ |
| **Usuarios** | ☐ | ☐ | ☐ | ☐ | ⏳ |

---

## 🎯 Criterios de Éxito

✅ **PASS**: Todos los CRUDs funcionan sin errores
✅ **PASS**: Eliminación de productos también elimina variantes
✅ **PASS**: Eliminación de categorías también elimina subcategorías
✅ **PASS**: No hay mezcla de datos entre sucursales
✅ **PASS**: Resumen del día calcula correctamente (Neto = Venta - Gastos)

❌ **FAIL**: Si hay error 500, 403 o 404 inesperado
❌ **FAIL**: Si hay mezcla de datos entre sucursales
❌ **FAIL**: Si no se eliminan cascadas correctamente

---

**Última actualización**: 08/12/2025
