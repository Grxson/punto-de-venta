-- Migración V018: Renombrar tabla producto_tamaño a producto_tamano
-- Descripción: Renombra las tablas y referencias de tamaño para evitar conflictos de caracteres especiales

-- Renombrar tablas si existen con el nombre antiguo
ALTER TABLE IF EXISTS producto_tamaño 
    RENAME TO producto_tamano;

-- Renombrar la tabla de variantes si existe con nombre antiguo
ALTER TABLE IF EXISTS producto_variante_tamaño 
    RENAME TO producto_variante_tamano;

-- Renombrar columnas si existen en la tabla de variantes con nombre antiguo
-- Nota: Esta es una operación sobre producto_variante_tamano que ya fue renombrada arriba
ALTER TABLE IF EXISTS producto_variante_tamano 
    RENAME COLUMN tamaño_id TO tamano_id;

-- Renombrar columnas en la tabla de producto_variante_tamano si existen con nombres antiguos
ALTER TABLE IF EXISTS producto_variante_tamano 
    RENAME COLUMN precio_extra_tamaño TO precio_extra_tamano;

-- Renombrar índices si existen
DROP INDEX IF EXISTS idx_producto_tamaño_nombre;
CREATE UNIQUE INDEX IF NOT EXISTS idx_producto_tamano_nombre ON producto_tamano(nombre) WHERE activo = TRUE;

DROP INDEX IF EXISTS idx_producto_variante_tamaño_producto;
CREATE INDEX IF NOT EXISTS idx_producto_variante_tamano_producto ON producto_variante_tamano(producto_id);

DROP INDEX IF EXISTS idx_producto_variante_tamaño_tamaño;
CREATE INDEX IF NOT EXISTS idx_producto_variante_tamano_tamano ON producto_variante_tamano(tamano_id);
