-- Migración: Agregar campos de variantes a la tabla productos
-- Fecha: 2025-12-01
-- Descripción: Agrega soporte para variantes de productos (tamaños, presentaciones, etc.)

-- Agregar columnas si no existen (compatible con PostgreSQL)
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS costo_estimado DECIMAL(12,4),
ADD COLUMN IF NOT EXISTS sku VARCHAR(50),
ADD COLUMN IF NOT EXISTS disponible_en_menu BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS producto_base_id BIGINT,
ADD COLUMN IF NOT EXISTS nombre_variante VARCHAR(255),
ADD COLUMN IF NOT EXISTS orden_variante INTEGER;

-- Agregar foreign key si no existe
-- Primero verificar que no exista la constrainta
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
UPDATE productos
SET disponible_en_menu = TRUE
WHERE disponible_en_menu IS NULL;

-- Hacer la columna NOT NULL después de actualizar
ALTER TABLE productos
ALTER COLUMN disponible_en_menu SET NOT NULL;
