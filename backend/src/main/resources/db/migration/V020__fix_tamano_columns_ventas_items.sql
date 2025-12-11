-- V020: Estandarizar nombres de columnas a ASCII en tabla ventas_items
-- Renombrar columnas con tildes a versión ASCII para consistencia con Hibernate

-- Renombrar tamaño_id → tamano_id
ALTER TABLE IF EXISTS ventas_items 
    RENAME COLUMN tamaño_id TO tamano_id;

-- Renombrar tamano_nombre (este ya debería estar bien, pero incluimos por seguridad)
-- No es necesario si ya está como tamano_nombre

-- Renombrar precio_extra_tamaño → precio_extra_tamano
ALTER TABLE IF EXISTS ventas_items 
    RENAME COLUMN precio_extra_tamaño TO precio_extra_tamano;

-- Actualizar índices si existen
DROP INDEX IF EXISTS idx_ventas_items_tamaño_id;
CREATE INDEX IF NOT EXISTS idx_ventas_items_tamano_id ON ventas_items(tamano_id);

-- Verificación
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name='ventas_items' AND column_name LIKE '%tama%';
