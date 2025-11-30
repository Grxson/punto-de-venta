-- ========================================
-- GUÍA PASO A PASO PARA ELIMINAR DUPLICADOS
-- ========================================
-- Ejecuta estos pasos en orden en tu cliente de PostgreSQL

-- ========================================
-- PASO 1: IDENTIFICAR DUPLICADOS
-- ========================================
-- Copia y ejecuta esta consulta para ver todos los productos duplicados

SELECT 
    p.id,
    p.nombre,
    p.precio,
    p.activo,
    p.disponible,
    DATE(p.created_at) as fecha_creacion,
    (SELECT COUNT(*) FROM productos v WHERE v.producto_base_id = p.id) as variantes
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

-- ========================================
-- PASO 2: VER CUÁLES TIENEN PEDIDOS
-- ========================================
-- Esta consulta te dice si algún duplicado tiene pedidos asociados

SELECT 
    p.id,
    p.nombre,
    p.precio,
    COUNT(DISTINCT dp.pedido_id) as pedidos_count
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

-- ========================================
-- PASO 3: IDENTIFICAR CUÁLES ELIMINAR
-- ========================================
-- Esta consulta muestra los candidatos a eliminar:
-- - Productos con precio = 0 O precio más bajo si ambos tienen precio
-- - Sin pedidos asociados
-- - Fecha de creación más reciente (probablemente el duplicado accidental)

WITH productos_duplicados AS (
    SELECT 
        p.id,
        p.nombre,
        p.precio,
        p.created_at,
        COUNT(DISTINCT dp.pedido_id) as pedidos_count,
        ROW_NUMBER() OVER (PARTITION BY p.nombre ORDER BY 
            CASE WHEN p.precio = 0 THEN 1 ELSE 0 END DESC,  -- Priorizar los de precio 0
            p.precio ASC,                                    -- Luego el precio más bajo
            p.created_at DESC                                -- Luego el más reciente
        ) as orden_eliminacion
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
    GROUP BY p.id, p.nombre, p.precio, p.created_at
)
SELECT 
    id,
    nombre,
    precio,
    DATE(created_at) as fecha_creacion,
    pedidos_count,
    '❌ ELIMINAR ESTE' as accion
FROM productos_duplicados
WHERE orden_eliminacion = 1  -- El primero de cada grupo será el que eliminemos
ORDER BY nombre;

-- ========================================
-- PASO 4: ELIMINAR LOS DUPLICADOS (SEGURO)
-- ========================================
-- ⚠️ CREA UN BACKUP ANTES DE EJECUTAR ESTO ⚠️

-- Iniciar transacción
BEGIN;

-- 4.1: Primero eliminar las variantes de los productos duplicados a eliminar
DELETE FROM productos 
WHERE producto_base_id IN (
    WITH productos_duplicados AS (
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            p.created_at,
            COUNT(DISTINCT dp.pedido_id) as pedidos_count,
            ROW_NUMBER() OVER (PARTITION BY p.nombre ORDER BY 
                CASE WHEN p.precio = 0 THEN 1 ELSE 0 END DESC,
                p.precio ASC,
                p.created_at DESC
            ) as orden_eliminacion
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
        GROUP BY p.id, p.nombre, p.precio, p.created_at
    )
    SELECT id
    FROM productos_duplicados
    WHERE orden_eliminacion = 1 
      AND pedidos_count = 0  -- Solo si no tiene pedidos
);

-- Verificar cuántas variantes se eliminaron
SELECT 'Variantes eliminadas: ' || ROW_COUNT() as resultado;

-- 4.2: Ahora eliminar los productos base duplicados
DELETE FROM productos 
WHERE id IN (
    WITH productos_duplicados AS (
        SELECT 
            p.id,
            p.nombre,
            p.precio,
            p.created_at,
            COUNT(DISTINCT dp.pedido_id) as pedidos_count,
            ROW_NUMBER() OVER (PARTITION BY p.nombre ORDER BY 
                CASE WHEN p.precio = 0 THEN 1 ELSE 0 END DESC,
                p.precio ASC,
                p.created_at DESC
            ) as orden_eliminacion
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
        GROUP BY p.id, p.nombre, p.precio, p.created_at
    )
    SELECT id
    FROM productos_duplicados
    WHERE orden_eliminacion = 1 
      AND pedidos_count = 0  -- Solo si no tiene pedidos
);

-- Verificar cuántos productos se eliminaron
SELECT 'Productos base eliminados: ' || ROW_COUNT() as resultado;

-- ⚠️ REVISA LOS RESULTADOS ⚠️
-- Si todo está correcto, ejecuta: COMMIT;
-- Si algo salió mal, ejecuta: ROLLBACK;

-- COMMIT;    -- Descomenta esta línea si todo está bien
-- ROLLBACK;  -- Descomenta esta línea si quieres deshacer los cambios

-- ========================================
-- PASO 5: VERIFICACIÓN FINAL
-- ========================================
-- Después del COMMIT, ejecuta esto para verificar que ya no hay duplicados

SELECT 
    nombre,
    COUNT(*) as cantidad,
    GROUP_CONCAT(id) as ids
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1;

-- Si esta consulta no retorna nada, ¡éxito! No hay más duplicados.

-- ========================================
-- RESUMEN DE LA ESTRATEGIA:
-- ========================================
-- 1. Mantener el producto con precio válido (> 0)
-- 2. Si ambos tienen precio, mantener el de mayor precio
-- 3. Mantener el creado primero (más antiguo)
-- 4. No eliminar productos que tengan pedidos asociados
-- 5. Usar transacción para poder hacer rollback si algo falla
