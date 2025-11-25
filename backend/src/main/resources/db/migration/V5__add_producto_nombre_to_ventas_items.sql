-- ==============================================
-- V5: Agregar columna producto_nombre a ventas_items
-- Almacena el nombre completo del producto al momento de la venta (incluye variante si aplica)
-- ==============================================

ALTER TABLE IF EXISTS ventas_items
    ADD COLUMN IF NOT EXISTS producto_nombre VARCHAR(255);

-- Actualizar registros existentes con el nombre del producto
UPDATE ventas_items vi
SET producto_nombre = (
    SELECT 
        CASE 
            WHEN p.producto_base_id IS NOT NULL THEN
                -- Es una variante, construir nombre completo
                COALESCE(pb.nombre, p.nombre) || ' - ' || COALESCE(p.nombre_variante, p.nombre)
            ELSE
                -- Es un producto base
                p.nombre
        END
    FROM productos p
    LEFT JOIN productos pb ON p.producto_base_id = pb.id
    WHERE p.id = vi.producto_id
)
WHERE producto_nombre IS NULL;

