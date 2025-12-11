-- V020: Estandarizar nombres de columnas a ASCII en tabla ventas_items y producto_variante_tamano
-- Renombrar columnas con tildes a versión ASCII para consistencia con Hibernate

-- ============================================
-- 1. Tabla ventas_items
-- ============================================

-- Renombrar tamaño_id → tamano_id si existe con ñ
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'tamaño_id'
    ) THEN
        ALTER TABLE ventas_items RENAME COLUMN tamaño_id TO tamano_id;
    END IF;
END $$;

-- Renombrar precio_extra_tamaño → precio_extra_tamano si existe con ñ
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'precio_extra_tamaño'
    ) THEN
        ALTER TABLE ventas_items RENAME COLUMN precio_extra_tamaño TO precio_extra_tamano;
    END IF;
END $$;

-- Actualizar índices en ventas_items si existen
DROP INDEX IF EXISTS idx_ventas_items_tamaño_id;
CREATE INDEX IF NOT EXISTS idx_ventas_items_tamano_id ON ventas_items(tamano_id);

-- ============================================
-- 2. Tabla producto_variante_tamano
-- ============================================

-- Renombrar tamaño_id → tamano_id si existe con ñ (por si no se ejecutó V018 correctamente)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'tamaño_id'
    ) THEN
        ALTER TABLE producto_variante_tamano RENAME COLUMN tamaño_id TO tamano_id;
    END IF;
END $$;

-- Renombrar precio_extra_tamaño → precio_extra_tamano si existe con ñ (por si no se ejecutó V018 correctamente)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'precio_extra_tamaño'
    ) THEN
        ALTER TABLE producto_variante_tamano RENAME COLUMN precio_extra_tamaño TO precio_extra_tamano;
    END IF;
END $$;

-- Verificación: mostrar estado actual de columnas
-- SELECT table_name, column_name FROM information_schema.columns 
-- WHERE (table_name IN ('ventas_items', 'producto_variante_tamano')) 
--   AND column_name LIKE '%tama%'
-- ORDER BY table_name, column_name;

