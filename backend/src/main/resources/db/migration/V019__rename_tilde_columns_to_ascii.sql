-- V019: Renombrar columnas con tildes a versiones sin tildes para compatibilidad
-- PostgreSQL y Hibernate pueden tener conflictos con caracteres especiales en nombres de columnas
-- Solución: Renombrar todas las columnas para usar solo caracteres ASCII

-- 1. Renombrar ventas_items.precio_extra_tamaño → precio_extra_tamano
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'precio_extra_tamaño'
    ) THEN
        ALTER TABLE ventas_items RENAME COLUMN "precio_extra_tamaño" TO precio_extra_tamano;
        RAISE NOTICE 'Columna renombrada: ventas_items.precio_extra_tamaño → precio_extra_tamano';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'precio_extra_tamano'
    ) THEN
        RAISE NOTICE 'Columna ya tiene nombre sin tilde: ventas_items.precio_extra_tamano';
    ELSE
        RAISE WARNING 'Columna precio_extra_tamano/tamaño no encontrada en ventas_items';
    END IF;
END $$;

-- 2. Renombrar ventas_items.tamano_nombre si existe con tilde
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'tamaño_nombre'
    ) THEN
        ALTER TABLE ventas_items RENAME COLUMN "tamaño_nombre" TO tamano_nombre;
        RAISE NOTICE 'Columna renombrada: ventas_items.tamaño_nombre → tamano_nombre';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'tamano_nombre'
    ) THEN
        RAISE NOTICE 'Columna ya tiene nombre sin tilde: ventas_items.tamano_nombre';
    ELSE
        RAISE NOTICE 'Columna tamano_nombre/tamaño_nombre no encontrada en ventas_items (puede no ser necesaria)';
    END IF;
END $$;

-- 3. Verificar que ventas_items.tamano_id no tiene tilde
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'tamaño_id'
    ) THEN
        ALTER TABLE ventas_items RENAME COLUMN "tamaño_id" TO tamano_id;
        RAISE NOTICE 'Columna renombrada: ventas_items.tamaño_id → tamano_id';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ventas_items' AND column_name = 'tamano_id'
    ) THEN
        RAISE NOTICE 'Columna ya tiene nombre sin tilde: ventas_items.tamano_id';
    ELSE
        RAISE NOTICE 'Columna tamano_id/tamaño_id no encontrada en ventas_items';
    END IF;
END $$;

-- 4. Renombrar producto_variante_tamano.precio_extra_tamaño → precio_extra_tamano (si V018 no lo hizo)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'precio_extra_tamaño'
    ) THEN
        ALTER TABLE producto_variante_tamano RENAME COLUMN "precio_extra_tamaño" TO precio_extra_tamano;
        RAISE NOTICE 'Columna renombrada: producto_variante_tamano.precio_extra_tamaño → precio_extra_tamano';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'precio_extra_tamano'
    ) THEN
        RAISE NOTICE 'Columna ya tiene nombre sin tilde: producto_variante_tamano.precio_extra_tamano';
    ELSE
        RAISE NOTICE 'Columna precio_extra_tamano/tamaño no encontrada en producto_variante_tamano';
    END IF;
END $$;

-- 5. Renombrar producto_variante_tamano.tamaño_id → tamano_id (si V018 no lo hizo)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'tamaño_id'
    ) THEN
        ALTER TABLE producto_variante_tamano RENAME COLUMN "tamaño_id" TO tamano_id;
        RAISE NOTICE 'Columna renombrada: producto_variante_tamano.tamaño_id → tamano_id';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'producto_variante_tamano' AND column_name = 'tamano_id'
    ) THEN
        RAISE NOTICE 'Columna ya tiene nombre sin tilde: producto_variante_tamano.tamano_id';
    ELSE
        RAISE NOTICE 'Columna tamano_id/tamaño_id no encontrada en producto_variante_tamano';
    END IF;
END $$;
