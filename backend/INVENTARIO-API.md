# API de Inventario y Recetas

Este documento describe los endpoints REST para la gestión de inventario y recetas del sistema Punto de Venta.

## 📋 Tabla de Contenidos

- [Unidades de Medida](#unidades-de-medida)
- [Proveedores](#proveedores)
- [Ingredientes](#ingredientes)
- [Recetas (BOM)](#recetas-bom)
- [Ejemplos de Uso](#ejemplos-de-uso)

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante token JWT. Incluir el header:
```
Authorization: Bearer {token}
```

## 📏 Unidades de Medida

### GET `/api/inventario/unidades`
Obtener todas las unidades de medida.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Gramos",
    "abreviatura": "g",
    "factorBase": 1.0,
    "descripcion": "Unidad base para peso"
  },
  {
    "id": 2,
    "nombre": "Kilogramos",
    "abreviatura": "kg",
    "factorBase": 1000.0,
    "descripcion": "1 kg = 1000 g"
  }
]
```

### POST `/api/inventario/unidades`
Crear nueva unidad de medida.

**Permisos:** ADMIN

**Body:**
```json
{
  "nombre": "Mililitros",
  "abreviatura": "ml",
  "factorBase": 1.0,
  "descripcion": "Unidad base para volumen"
}
```

## 🏢 Proveedores

### GET `/api/inventario/proveedores`
Obtener todos los proveedores.

**Permisos:** ADMIN, SUPERVISOR

### GET `/api/inventario/proveedores/activos`
Obtener proveedores activos.

**Permisos:** ADMIN, SUPERVISOR

### POST `/api/inventario/proveedores`
Crear nuevo proveedor.

**Permisos:** ADMIN, SUPERVISOR

**Body:**
```json
{
  "nombre": "Proveedor ABC",
  "contacto": "Juan Pérez",
  "telefono": "5512345678",
  "email": "contacto@proveedorabc.com",
  "activo": true
}
```

### PUT `/api/inventario/proveedores/{id}`
Actualizar proveedor existente.

**Permisos:** ADMIN, SUPERVISOR

### DELETE `/api/inventario/proveedores/{id}`
Desactivar proveedor (soft delete).

**Permisos:** ADMIN

## 🥫 Ingredientes

### GET `/api/inventario/ingredientes`
Obtener todos los ingredientes.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Harina de trigo",
    "categoria": "Harinas",
    "unidadBaseId": 1,
    "unidadBaseNombre": "Gramos",
    "unidadBaseAbreviatura": "g",
    "costoUnitarioBase": 0.025,
    "stockMinimo": 5000,
    "proveedorId": 1,
    "proveedorNombre": "Proveedor ABC",
    "sku": "HAR-001",
    "activo": true
  }
]
```

### GET `/api/inventario/ingredientes/activos`
Obtener ingredientes activos.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

### GET `/api/inventario/ingredientes/{id}`
Obtener ingrediente por ID.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

### GET `/api/inventario/ingredientes/categorias`
Obtener lista de categorías de ingredientes.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

**Respuesta:**
```json
["Harinas", "Lácteos", "Carnes", "Verduras", "Especias"]
```

### GET `/api/inventario/ingredientes/buscar?nombre={nombre}`
Buscar ingredientes por nombre.

**Permisos:** ADMIN, SUPERVISOR, CAJERO

### POST `/api/inventario/ingredientes`
Crear nuevo ingrediente.

**Permisos:** ADMIN, SUPERVISOR

**Body:**
```json
{
  "nombre": "Harina de trigo",
  "categoria": "Harinas",
  "unidadBaseId": 1,
  "costoUnitarioBase": 0.025,
  "stockMinimo": 5000,
  "proveedorId": 1,
  "sku": "HAR-001",
  "activo": true
}
```

### PUT `/api/inventario/ingredientes/{id}`
Actualizar ingrediente.

**Permisos:** ADMIN, SUPERVISOR

### DELETE `/api/inventario/ingredientes/{id}`
Desactivar ingrediente (soft delete).

**Permisos:** ADMIN

## 📖 Recetas (BOM)

### GET `/api/inventario/recetas/producto/{productoId}`
Obtener todas las recetas (ingredientes) de un producto.

**Permisos:** ADMIN, SUPERVISOR, COCINA

**Respuesta:**
```json
[
  {
    "productoId": 1,
    "productoNombre": "Waffles",
    "ingredienteId": 1,
    "ingredienteNombre": "Harina de trigo",
    "cantidad": 200,
    "unidadId": 1,
    "unidadNombre": "Gramos",
    "unidadAbreviatura": "g",
    "mermaTeorica": 0.05
  }
]
```

### GET `/api/inventario/recetas/ingrediente/{ingredienteId}`
Obtener productos que usan un ingrediente específico.

**Permisos:** ADMIN, SUPERVISOR

### GET `/api/inventario/recetas/producto/{productoId}/costo`
Calcular costo estándar de un producto según su receta.

**Permisos:** ADMIN, SUPERVISOR

**Respuesta:**
```json
{
  "costoReceta": 25.50
}
```

**Nota:** El costo incluye:
- Cantidad de ingredientes ajustada por merma teórica
- Conversión de unidades a unidad base
- Costo unitario base de cada ingrediente

### POST `/api/inventario/recetas`
Crear nueva receta (añadir ingrediente a un producto).

**Permisos:** ADMIN, SUPERVISOR

**Body:**
```json
{
  "productoId": 1,
  "ingredienteId": 1,
  "cantidad": 200,
  "unidadId": 1,
  "mermaTeorica": 0.05
}
```

**Campos:**
- `productoId`: ID del producto
- `ingredienteId`: ID del ingrediente
- `cantidad`: Cantidad del ingrediente necesaria
- `unidadId`: ID de la unidad de medida
- `mermaTeorica`: Porcentaje de merma (0 a 1, donde 0.05 = 5%)

### PUT `/api/inventario/recetas/producto/{productoId}/ingrediente/{ingredienteId}`
Actualizar receta existente.

**Permisos:** ADMIN, SUPERVISOR

### DELETE `/api/inventario/recetas/producto/{productoId}/ingrediente/{ingredienteId}`
Eliminar ingrediente específico de una receta.

**Permisos:** ADMIN

### DELETE `/api/inventario/recetas/producto/{productoId}`
Eliminar todas las recetas de un producto.

**Permisos:** ADMIN

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear receta completa para Waffles

1. **Crear unidades de medida:**
```bash
# Gramos
POST /api/inventario/unidades
{
  "nombre": "Gramos",
  "abreviatura": "g",
  "factorBase": 1.0
}

# Mililitros
POST /api/inventario/unidades
{
  "nombre": "Mililitros",
  "abreviatura": "ml",
  "factorBase": 1.0
}
```

2. **Crear proveedor:**
```bash
POST /api/inventario/proveedores
{
  "nombre": "Distribuidora La Esperanza",
  "contacto": "María García",
  "telefono": "5512345678",
  "email": "ventas@laesperanza.com",
  "activo": true
}
```

3. **Crear ingredientes:**
```bash
# Harina
POST /api/inventario/ingredientes
{
  "nombre": "Harina de trigo",
  "categoria": "Harinas",
  "unidadBaseId": 1,
  "costoUnitarioBase": 0.025,
  "stockMinimo": 5000,
  "proveedorId": 1,
  "sku": "HAR-001",
  "activo": true
}

# Leche
POST /api/inventario/ingredientes
{
  "nombre": "Leche entera",
  "categoria": "Lácteos",
  "unidadBaseId": 2,
  "costoUnitarioBase": 0.020,
  "stockMinimo": 10000,
  "proveedorId": 1,
  "sku": "LAC-001",
  "activo": true
}
```

4. **Crear receta para Waffles (ID producto: 1):**
```bash
# Añadir harina
POST /api/inventario/recetas
{
  "productoId": 1,
  "ingredienteId": 1,
  "cantidad": 200,
  "unidadId": 1,
  "mermaTeorica": 0.05
}

# Añadir leche
POST /api/inventario/recetas
{
  "productoId": 1,
  "ingredienteId": 2,
  "cantidad": 150,
  "unidadId": 2,
  "mermaTeorica": 0.02
}
```

5. **Calcular costo del producto:**
```bash
GET /api/inventario/recetas/producto/1/costo
# Respuesta: { "costoReceta": 8.15 }
```

### Ejemplo 2: Actualizar costo de ingrediente

Cuando cambia el precio de un proveedor:

```bash
PUT /api/inventario/ingredientes/1
{
  "nombre": "Harina de trigo",
  "categoria": "Harinas",
  "unidadBaseId": 1,
  "costoUnitarioBase": 0.030,  # Actualizado
  "stockMinimo": 5000,
  "proveedorId": 1,
  "sku": "HAR-001",
  "activo": true
}
```

Luego recalcular costos de productos que usan este ingrediente:
```bash
GET /api/inventario/recetas/producto/1/costo
# Nuevo costo reflejará el cambio
```

## 🔄 Flujo recomendado

1. **Setup inicial:**
   - Crear unidades de medida (g, ml, kg, L, pza)
   - Crear proveedores
   
2. **Catálogo de ingredientes:**
   - Crear ingredientes con costos y stock mínimo
   - Asociar a proveedores
   
3. **Definición de recetas:**
   - Por cada producto del menú, añadir ingredientes
   - Incluir merma teórica estimada
   
4. **Mantenimiento:**
   - Actualizar costos cuando cambien precios
   - Ajustar cantidades en recetas según mejoras en proceso
   - Calcular costos de productos regularmente

## 📊 Cálculo de costos

### Fórmula del costo de receta:

Para cada ingrediente en la receta:
```
cantidad_real = cantidad / (1 - merma_teorica)
cantidad_en_unidad_base = cantidad_real * factor_conversion
costo_ingrediente = cantidad_en_unidad_base * costo_unitario_base

costo_total_receta = suma(costo_ingrediente para todos los ingredientes)
```

### Ejemplo:
- Harina: 200g, merma 5%, costo $0.025/g
- cantidad_real = 200 / (1 - 0.05) = 210.53g
- costo_harina = 210.53 * 0.025 = $5.26

## 🔒 Permisos por rol

| Endpoint | ADMIN | SUPERVISOR | CAJERO | COCINA |
|----------|-------|------------|--------|--------|
| GET unidades | ✅ | ✅ | ✅ | ❌ |
| POST/PUT/DELETE unidades | ✅ | ❌ | ❌ | ❌ |
| GET proveedores | ✅ | ✅ | ❌ | ❌ |
| POST/PUT proveedores | ✅ | ✅ | ❌ | ❌ |
| DELETE proveedores | ✅ | ❌ | ❌ | ❌ |
| GET ingredientes | ✅ | ✅ | ✅ | ❌ |
| POST/PUT ingredientes | ✅ | ✅ | ❌ | ❌ |
| DELETE ingredientes | ✅ | ❌ | ❌ | ❌ |
| GET recetas | ✅ | ✅ | ❌ | ✅ |
| GET costo receta | ✅ | ✅ | ❌ | ❌ |
| POST/PUT recetas | ✅ | ✅ | ❌ | ❌ |
| DELETE recetas | ✅ | ❌ | ❌ | ❌ |

## 📝 Notas importantes

1. **Soft delete:** Ingredientes y proveedores usan eliminación suave (campo `activo`).
2. **Unidades:** El `factorBase` representa la conversión a la unidad base del ingrediente.
3. **Merma teórica:** Valor entre 0 y 1 (0.05 = 5% de merma).
4. **Costos:** Los costos se calculan en tiempo real según los valores actuales.
5. **Validaciones:** Todos los campos requeridos se validan automáticamente.

## 🧪 Probar con Postman

Importa la colección desde:
```
docs/postman/punto-de-venta.postman_collection.json
```

Variables de entorno necesarias:
- `base_url`: http://localhost:8080
- `token`: (se genera automáticamente al hacer login)
- `ingredienteId`: (se guarda al crear ingrediente)
- `productoId`: (ID del producto para recetas)
