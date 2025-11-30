-- ========================================
-- CONSULTA RÁPIDA: IDENTIFICAR DUPLICADOS
-- ========================================
-- Ejecuta este script para ver qué productos están duplicados

-- Ver productos duplicados con detalle completo
SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.activo,
    p.disponible,
    p.created_at,
    p.updated_at,
    (SELECT COUNT(*) FROM productos v WHERE v.producto_base_id = p.id) as cantidad_variantes
FROM productos p
WHERE p.producto_base_id IS NULL
  AND p.nombre IN (
    SELECT nombre 
    FROM productos 
    WHERE producto_base_id IS NULL 
    GROUP BY nombre 
    HAVING COUNT(*) > 1
  )
ORDER BY p.nombre, p.precio DESC, p.id;

-- Ver cuántos pedidos tiene cada producto duplicado
SELECT 
    p.id,
    p.nombre,
    p.precio,
    COUNT(DISTINCT dp.pedido_id) as pedidos
FROM productos p
LEFT JOIN detalle_pedidos dp ON dp.producto_id = p.id
WHERE p.producto_base_id IS NULL
  AND p.nombre IN (
    SELECT nombre 
    FROM productos 
    WHERE producto_base_id IS NULL 
    GROUP BY nombre 
    HAVING COUNT(*) > 1
  )
GROUP BY p.id, p.nombre, p.precio
ORDER BY p.nombre, p.precio DESC;
