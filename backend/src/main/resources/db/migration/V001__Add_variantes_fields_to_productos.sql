-- Migración: Agregar campos de variantes a la tabla productos
-- Fecha: 2025-12-01
-- Descripción: Agrega soporte para variantes de productos (tamaños, presentaciones, etc.)
-- Optimizada para PostgreSQL

-- Agregar columnas si no existen
DO $$
BEGIN
    -- descripcion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'descripcion') THEN
        ALTER TABLE productos ADD COLUMN descripcion TEXT;
    END IF;
    
    -- costo_estimado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'costo_estimado') THEN
        ALTER TABLE productos ADD COLUMN costo_estimado DECIMAL(12,4);
    END IF;
    
    -- sku
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'sku') THEN
        ALTER TABLE productos ADD COLUMN sku VARCHAR(50);
    END IF;
    
    -- disponible_en_menu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'disponible_en_menu') THEN
        ALTER TABLE productos ADD COLUMN disponible_en_menu BOOLEAN DEFAULT TRUE;
    END IF;
    
    -- producto_base_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'producto_base_id') THEN
        ALTER TABLE productos ADD COLUMN producto_base_id BIGINT;
    END IF;
    
    -- nombre_variante
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'nombre_variante') THEN
        ALTER TABLE productos ADD COLUMN nombre_variante VARCHAR(255);
    END IF;
    
    -- orden_variante
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'orden_variante') THEN
        ALTER TABLE productos ADD COLUMN orden_variante INTEGER;
    END IF;
END
$$;

-- Agregar foreign key si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'productos' 
                   AND constraint_name = 'fk_productos_producto_base_id') THEN
        ALTER TABLE productos
        ADD CONSTRAINT fk_productos_producto_base_id 
        FOREIGN KEY (producto_base_id) REFERENCES productos(id) ON DELETE SET NULL;
    END IF;
END
$$;

-- Crear índice para búsquedas de variantes por producto base
CREATE INDEX IF NOT EXISTS idx_productos_producto_base_id ON productos(producto_base_id);

-- Crear índice para búsquedas por nombre_variante
CREATE INDEX IF NOT EXISTS idx_productos_nombre_variante ON productos(nombre_variante);

-- Crear índice para orden de variantes
CREATE INDEX IF NOT EXISTS idx_productos_orden_variante ON productos(orden_variante);

-- Actualizar la tabla si tiene datos existentes pero falta disponible_en_menu
-- Establecer TRUE para productos existentes que no sean variantes
UPDATE productos SET disponible_en_menu = TRUE WHERE disponible_en_menu IS NULL;
