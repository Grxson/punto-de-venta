-- ==============================================
-- V4: Agregar soporte para variantes de productos
-- Permite manejar productos con diferentes tamaños/presentaciones
-- (ej: Jugo de Naranja - 1L, 500ml, Bolsa 250ml)
-- ==============================================
-- NOTA IMPORTANTE: 
-- En desarrollo con H2, Hibernate crea las tablas automáticamente con ddl-auto=update,
-- por lo que las columnas se agregarán automáticamente desde el modelo Producto.
-- Esta migración es principalmente para producción (PostgreSQL) donde Flyway maneja todo.
--
-- Si esta migración falla porque la tabla no existe, es normal en desarrollo.
-- Hibernate creará la tabla con todas las columnas correctas automáticamente.
-- En producción, la tabla ya existirá y esta migración agregará las columnas.

-- Agregar columnas (sintaxis compatible con H2 y PostgreSQL)
-- H2 soporta ADD COLUMN IF NOT EXISTS desde la versión 1.4.197
-- Si la tabla no existe, esto fallará pero Hibernate la creará con las columnas correctas
ALTER TABLE productos ADD COLUMN IF NOT EXISTS producto_base_id BIGINT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS nombre_variante VARCHAR(100);
ALTER TABLE productos ADD COLUMN IF NOT EXISTS orden_variante INTEGER;

-- Crear índices (sintaxis compatible con H2 y PostgreSQL)
-- Si la tabla no existe, esto fallará pero Hibernate creará los índices automáticamente
CREATE INDEX IF NOT EXISTS idx_productos_producto_base_id ON productos(producto_base_id);
CREATE INDEX IF NOT EXISTS idx_productos_base_orden ON productos(producto_base_id, orden_variante);

-- NOTA: La foreign key constraint se creará automáticamente por Hibernate desde el modelo
-- @ManyToOne en Producto.java. En producción (PostgreSQL), si necesitas la FK explícitamente,
-- puedes agregarla manualmente o crear una migración adicional después de que esta se ejecute.
