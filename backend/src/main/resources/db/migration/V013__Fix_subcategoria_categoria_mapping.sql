-- ✅ SEGREGACIÓN: Corregir mapping de subcategorías a categorías por sucursal
-- Las subcategorías de sucursal 2 necesitan apuntar a categorías de sucursal 2, no sucursal 1

-- Actualizar subcategorías de sucursal 2 para apuntar a sus categorías correctas
-- Usa subquery que busca la categoría de sucursal 2 con el mismo nombre
UPDATE categoria_subcategorias cs
SET categoria_id = (
    SELECT s2.id
    FROM categorias_productos s2
    WHERE s2.sucursal_id = 2
    AND s2.nombre = (
        SELECT s1.nombre
        FROM categorias_productos s1
        WHERE s1.id = cs.categoria_id
        LIMIT 1
    )
    LIMIT 1
)
WHERE cs.sucursal_id = 2
AND EXISTS (
    SELECT 1
    FROM categorias_productos cp
    WHERE cp.id = cs.categoria_id
    AND cp.sucursal_id = 1
);
