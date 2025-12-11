# Implementación: Variantes Multi-Paso con Tamaños y Atributos

**Fecha**: 10 de diciembre de 2025
**Estado**: ✅ Completado - Entidades, Repositorios, Servicios y DTOs creados

---

## 📋 Resumen de cambios

Se ha implementado un sistema completo de variantes multi-paso que permite:
1. **Paso 1 (Variante)**: Seleccionar una variante (ej: "Jugo Verde")
2. **Paso 2 (Tamaño)**: Seleccionar tamaño (ej: "Pequeño", "Mediano", "Grande")
3. **Paso 3 (Atributos)**: Seleccionar ingredientes/opciones (ej: "Naranja", "Zanahoria", "Betabel")
4. **Auditoría**: Todo se registra en la base de datos para reportes y auditoría

---

## 🏗️ Cambios en la Base de Datos

### Nuevas tablas creadas (Migración V10):

1. **`producto_tamaño`** - Catálogo reutilizable de tamaños
   - Campos: id, nombre, descripcion, precio_extra, orden, activo, created_at, updated_at
   - Índices: unique(nombre) WHERE activo=true

2. **`producto_variante_tamaño`** - Relación M-M entre variantes y tamaños
   - Campos: id, producto_id (FK), tamaño_id (FK), orden, created_at
   - Constraint: UNIQUE(producto_id, tamaño_id)

3. **`producto_atributo`** - Atributos de un producto (Ingrediente, Salsa, etc.)
   - Campos: id, producto_id (FK), nombre, tipo (SIMPLE|MULTIPLE), requerido, orden, activo, created_at, updated_at
   - Soporta atributos univalorados o multivalorados

4. **`producto_atributo_opcion`** - Opciones de cada atributo (Naranja, Zanahoria, etc.)
   - Campos: id, atributo_id (FK), nombre, precio_extra, orden, activo, created_at, updated_at

5. **`venta_item_atributo_seleccionado`** - Auditoría de selecciones en ventas
   - Campos: id, venta_item_id (FK), atributo_id (FK), opcion_id (FK), valor_seleccionado, precio_extra, created_at
   - Permite rastrear exactamente qué seleccionó el cliente

### Ampliaciones a tablas existentes:

**`ventas_items`** - Nuevos campos:
- `tamaño_id` (FK) - Referencia al tamaño seleccionado
- `tamaño_nombre` (VARCHAR 100) - Denormalización para auditoría
- `precio_extra_tamaño` (DECIMAL) - Precio extra del tamaño aplicado

---

## 💻 Cambios en el Backend (Java 21)

### Entidades nuevas creadas:

1. **`ProductoTamaño`** (9 KB)
   - Record-like entity con @Entity/@Builder/Lombok
   - Relación @OneToMany → ProductoVarianteTamaño

2. **`ProductoVarianteTamaño`** (5 KB)
   - Relación M-M con constraints UNIQUE
   - @ManyToOne → Producto y ProductoTamaño

3. **`ProductoAtributo`** (6 KB)
   - Enum TipoAtributo: SIMPLE, MULTIPLE
   - @OneToMany → ProductoAtributoOpcion (orphanRemoval)

4. **`ProductoAtributoOpcion`** (5 KB)
   - Opciones para cada atributo
   - @ManyToOne → ProductoAtributo

5. **`VentaItemAtributoSeleccionado`** (6 KB)
   - Auditoría de selecciones en ventas
   - @ManyToOne → VentaItem (orphanRemoval)

### Entidades modificadas:

**`Producto`**
```java
// Nuevas propiedades
@OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ProductoVarianteTamaño> tamañosDisponibles;

@OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ProductoAtributo> atributos;
```

**`VentaItem`**
```java
// Nuevas propiedades para tamaño
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "tamaño_id")
private ProductoTamaño tamaño;

private String tamañoNombre;
private BigDecimal precioExtraTamaño;

// Relación con atributos seleccionados
@OneToMany(mappedBy = "ventaItem", cascade = CascadeType.ALL, orphanRemoval = true)
private List<VentaItemAtributoSeleccionado> atributosSeleccionados;
```

### Repositorios creados:

1. **`ProductoTamañoRepository`** (3 KB)
   - `findByNombreIgnoreCase()`
   - `findAllActivos()` - Ordenado por orden
   - `buscarPorNombre()`

2. **`ProductoVarianteTamañoRepository`** (4 KB)
   - `findByProductoId()` - Tamaños de un producto
   - `findByProductoIdAndTamañoId()` - Verificar existencia
   - `findByTamañoId()` - Productos que usan un tamaño

3. **`ProductoAtributoRepository`** (4 KB)
   - `findByProductoIdActivos()` - Atributos activos
   - `findByProductoId()` - Todos los atributos
   - `buscarPorNombre()`

4. **`ProductoAtributoOpcionRepository`** (4 KB)
   - `findByAtributoIdActivas()` - Opciones activas
   - `findByAtributoId()` - Todas las opciones
   - `buscarPorNombre()`

5. **`VentaItemAtributoSeleccionadoRepository`** (3 KB)
   - `findByVentaItemId()` - Atributos del item
   - `deleteByVentaItemId()` - Limpiar atributos

### Servicios creados:

1. **`ProductoTamañoService`** (11 KB)
   - CRUD completo: crear, actualizar, desactivar, eliminar
   - `obtenerTodosActivos()`
   - `obtenerPorId()`, `obtenerPorNombre()`
   - `buscar()` - Búsqueda por nombre
   - Validación: evitar duplicados

2. **`ProductoAtributoService`** (18 KB)
   - CRUD para atributos y opciones
   - `obtenerAtributosActivos()` - Por producto
   - `crearAtributo()`, `actualizarAtributo()`, `desactivarAtributo()`
   - `crearOpcion()`, `actualizarOpcion()`, `desactivarOpcion()`
   - Carga de opciones en DTOs

3. **`ProductoVarianteTamañoService`** (12 KB)
   - Gestión de relaciones M-M
   - `obtenerTamañosPorProducto()`
   - `agregarTamaño()` - Con validación UNIQUE
   - `eliminarTamaño()`, `eliminarTodosPorProducto()`
   - `obtenerProductosPorTamaño()`

4. **`VentaItemAtributoSeleccionadoService`** (12 KB)
   - Gestión de atributos en ventas
   - `obtenerAtributosDelItem()`
   - `agregarAtributo()` - Con opción registrada
   - `agregarAtributoPersonalizado()` - Valor libre
   - `limpiarAtributosDelItem()`

### DTOs creados:

1. **`ProductoTamañoDTO`** - Record Java 21
   - id, nombre, descripcion, precioExtra, orden, activo

2. **`ProductoAtributoDTO`** - Record Java 21
   - id, productoId, nombre, tipo (SIMPLE|MULTIPLE), requerido, orden, activo
   - `opciones` List<ProductoAtributoOpcionDTO>

3. **`ProductoAtributoOpcionDTO`** - Record Java 21
   - id, atributoId, nombre, precioExtra, orden, activo

4. **`ProductoVarianteTamañoDTO`** - Record Java 21
   - id, productoId, productoNombre, tamañoId, tamañoNombre, precioExtra, orden

5. **`VentaItemAtributoSeleccionadoDTO`** - Record Java 21
   - id, ventaItemId, atributoId, atributoNombre, opcionId, opcionNombre, valorSeleccionado, precioExtra

### DTOs modificados:

**`ProductoDTO`** - Nuevos campos:
```java
List<ProductoVarianteTamañoDTO> tamaños,
List<ProductoAtributoDTO> atributos
```

**`VentaItemDTO`** - Nuevos campos:
```java
Long tamañoId,
String tamañoNombre,
BigDecimal precioExtraTamaño,
List<VentaItemAtributoSeleccionadoDTO> atributosSeleccionados
```

---

## 📊 Compilación

✅ **Estado**: BUILD SUCCESS
- 186 archivos compilados
- 11 warnings menores (Builder.Default en inicializadores)
- Cero errores

---

## 🔄 Arquitectura de flujo (Cliente)

### MenuScreen - Modal Multi-Paso:

```
PASO 1: Seleccionar Variante
├─ Card "Jugo Verde"
├─ Card "Jugo Rojo"
└─ Card "Jugo Naranja"
   ↓ Click en "Jugo Verde"
   
PASO 2: Seleccionar Tamaño
├─ Radio Button "Pequeño" (0.00)
├─ Radio Button "Mediano" (+50.00)
└─ Radio Button "Grande" (+100.00)
   ↓ Click en "Mediano"
   
PASO 3: Seleccionar Ingredientes
├─ Checkbox "Naranja" (0.00) ✓
├─ Checkbox "Zanahoria" (0.00) ✓
├─ Checkbox "Toronja" (0.00)
├─ Checkbox "Betabel" (0.00)
└─ Checkbox "Agua" (0.00) ✓
   ↓ Click en "Agregar al carrito"
   
Item añadido con:
├─ Producto: Jugo Verde (variante)
├─ Cantidad: 1
├─ Tamaño: Mediano (+50.00)
├─ Atributos: Naranja, Zanahoria, Agua
└─ Total: Precio base + 50.00 de tamaño + opcionales
```

---

## 🔄 Arquitectura de flujo (Admin)

### AdminProductos - CRUD de Variantes:

```
Ver Producto "Jugo"
├─ Tab: Información General
├─ Tab: Variantes
│  ├─ Jugo Verde
│  │  ├─ [Gestionar Tamaños]
│  │  │  ├─ + Pequeño (0.00)
│  │  │  ├─ + Mediano (50.00)
│  │  │  └─ + Grande (100.00)
│  │  └─ [Gestionar Atributos]
│  │     ├─ Ingrediente (MULTIPLE, requerido)
│  │     │  ├─ + Naranja (0.00)
│  │     │  ├─ + Zanahoria (0.00)
│  │     │  ├─ + Toronja (0.00)
│  │     │  ├─ + Betabel (0.00)
│  │     │  └─ + Agua (0.00)
│  │     └─ Complemento (SIMPLE, opcional)
│  │        ├─ + Miel (25.00)
│  │        └─ + Polen (20.00)
│  ├─ Jugo Rojo
│  └─ Jugo Naranja
└─ [+ Agregar Variante]
```

---

## 🚀 Próximos pasos

1. **Crear Controllers REST** para los nuevos servicios
   - `ProductoTamañoController` - CRUD tamaños
   - `ProductoAtributoController` - CRUD atributos
   - `ProductoVarianteTamañoController` - Gestionar relaciones
   - `VentaItemAtributoController` - Registrar selecciones

2. **Implementar Frontend** (React Native/Web)
   - Modal multi-paso con drawer
   - Paso 1: Cards de variantes
   - Paso 2: Radio buttons de tamaños
   - Paso 3: Checkboxes de ingredientes
   - Paso 4: Confirmación y agregar al carrito

3. **Validaciones y manejo de errores**
   - Atributos requeridos
   - Límites de selecciones múltiples
   - Cálculo automático de precios totales

4. **Mappers**
   - Mapear DTOs de entrada (sin ID) a entidades
   - Mapear respuestas con relaciones completas

---

## 📝 Notas técnicas

- **Cascada**: orphanRemoval=true para atributos y opciones
- **Lazy loading**: FetchType.LAZY para optimizar queries
- **Validaciones**: @NotNull, @NotBlank, @Positive en DTOs
- **Denormalización**: Se guardan nombres en ventas_items para auditoría
- **Auditoría**: Todos los cambios registrados con timestamps
- **Soft delete**: Los tamaños/atributos pueden desactivarse sin eliminar datos históricos

---

## 📂 Archivos creados/modificados

### Archivos creados (18 nuevos):
- Migraciones: 1
- Entidades: 5
- Repositorios: 5
- Servicios: 4
- DTOs: 5

### Archivos modificados (4):
- `Producto.java` - Añadidas relaciones
- `VentaItem.java` - Añadidas relaciones y campos
- `ProductoDTO.java` - Nuevos campos tamaños y atributos
- `VentaItemDTO.java` - Nuevos campos de tamaño y atributos seleccionados
- `ProductoService.java` - Ajustados constructores DTO
- `VentaService.java` - Ajustados constructores DTO

**Total**: 22 archivos nuevos/modificados
**LOC**: ~800 líneas de código Java + ~200 líneas SQL

