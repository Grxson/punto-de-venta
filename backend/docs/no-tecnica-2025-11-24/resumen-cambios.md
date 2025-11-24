# Resumen de cambios (2025-11-24)

## Nuevos endpoints de Productos
- Se agregó el controlador `ProductoController` con rutas:
  - GET `/api/inventario/productos` (filtros: activo, enMenu, categoriaId, q)
  - GET `/api/inventario/productos/{id}`
  - POST `/api/inventario/productos`
  - PUT `/api/inventario/productos/{id}`
  - PATCH `/api/inventario/productos/{id}/estado?activo=true|false`
  - DELETE `/api/inventario/productos/{id}` (borrado lógico)
- Se añadieron `ProductoService`, `ProductoDTO` y `CategoriaProductoRepository`.

## Corrección de error en migraciones (columna activo)
- Se incorporó Flyway para manejar migraciones de base de datos antes de Hibernate.
- Nueva migración: `V2__add_activo_columns_roles_sucursales.sql` que agrega la columna `activo` con `DEFAULT true` y la marca `NOT NULL` en `roles` y `sucursales`.
- Configuración en `application-railway.properties` para habilitar Flyway y `baseline-on-migrate`.

## Impacto
- Ahora es posible crear y administrar productos desde la API (antes se requería `productoId` sin forma de generarlo).
- El despliegue en Railway no debería fallar por el error `column "activo" contains null values`.

