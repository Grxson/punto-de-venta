-- ========================================
-- SCRIPT PARA IDENTIFICAR Y ELIMINAR PRODUCTOS DUPLICADOS
-- ========================================
-- Fecha: 29 de noviembre de 2025
-- Propósito: Identificar productos duplicados donde algunos tienen precio 0 y otros tienen precio válido

-- ----------------------------------------
-- PASO 1: IDENTIFICAR PRODUCTOS BASE DUPLICADOS
-- ----------------------------------------
-- Esta consulta muestra productos base (sin producto_base_id) duplicados con sus IDs y precios
SELECT 
    nombre,
    COUNT(*) as cantidad_duplicados,
    GROUP_CONCAT(id ORDER BY id) as ids_productos,
    GROUP_CONCAT(precio ORDER BY id) as precios,
    GROUP_CONCAT(activo ORDER BY id) as estados_activo,
    GROUP_CONCAT(disponible ORDER BY id) as estados_disponible
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY nombre;

-- ----------------------------------------
-- PASO 2: VER DETALLE DE CADA PRODUCTO DUPLICADO CON SUS VARIANTES
-- ----------------------------------------
-- Esta consulta muestra cada producto base duplicado con todas sus variantes

-- NOTA: Ejecuta esta consulta para ver el detalle completo
SELECT 
    pb.id as id_producto_base,
    pb.nombre as nombre_producto,
    pb.precio as precio_base,
    pb.activo as base_activo,
    pb.disponible as base_disponible,
    pb.created_at as fecha_creacion_base,
    COUNT(v.id) as cantidad_variantes,
    GROUP_CONCAT(CONCAT(v.nombre_variante, ':', v.precio) ORDER BY v.orden_variante) as variantes_precios
FROM productos pb
LEFT JOIN productos v ON v.producto_base_id = pb.id
WHERE pb.producto_base_id IS NULL
  AND pb.nombre IN (
    SELECT nombre 
    FROM productos 
    WHERE producto_base_id IS NULL 
    GROUP BY nombre 
    HAVING COUNT(*) > 1
  )
GROUP BY pb.id, pb.nombre, pb.precio, pb.activo, pb.disponible, pb.created_at
ORDER BY pb.nombre, pb.id;

-- ----------------------------------------
-- PASO 3: IDENTIFICAR PRODUCTOS CON PRECIO 0 (CANDIDATOS A ELIMINAR)
-- ----------------------------------------
-- Estos son los productos que probablemente debemos eliminar
SELECT 
    pb.id as id_producto_base,
    pb.nombre as nombre_producto,
    pb.precio as precio_base,
    pb.activo,
    pb.disponible,
    pb.created_at,
    COUNT(v.id) as cantidad_variantes
FROM productos pb
LEFT JOIN productos v ON v.producto_base_id = pb.id
WHERE pb.producto_base_id IS NULL
  AND pb.precio = 0
  AND pb.nombre IN (
    SELECT nombre 
    FROM productos 
    WHERE producto_base_id IS NULL 
    GROUP BY nombre 
    HAVING COUNT(*) > 1
  )
GROUP BY pb.id, pb.nombre, pb.precio, pb.activo, pb.disponible, pb.created_at
ORDER BY pb.nombre, pb.id;

-- ----------------------------------------
-- PASO 4: VERIFICAR DEPENDENCIAS ANTES DE ELIMINAR
-- ----------------------------------------
-- Verifica si los productos duplicados están en pedidos, inventario, etc.

-- Verificar en detalles de pedidos
SELECT 
    p.id as producto_id,
    p.nombre,
    COUNT(DISTINCT dp.pedido_id) as pedidos_relacionados
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
GROUP BY p.id, p.nombre
HAVING pedidos_relacionados > 0;

-- Verificar en movimientos de inventario
SELECT 
    p.id as producto_id,
    p.nombre,
    COUNT(im.id) as movimientos_inventario
FROM productos p
LEFT JOIN inventario_movimientos im ON im.producto_id = p.id
WHERE p.producto_base_id IS NULL
  AND p.nombre IN (
    SELECT nombre 
    FROM productos 
    WHERE producto_base_id IS NULL 
    GROUP BY nombre 
    HAVING COUNT(*) > 1
  )
GROUP BY p.id, p.nombre
HAVING movimientos_inventario > 0;

-- ----------------------------------------
-- PASO 5: SCRIPT DE ELIMINACIÓN SEGURA
-- ----------------------------------------
-- IMPORTANTE: Ejecuta primero los pasos 1-4 para identificar qué productos eliminar
-- Este script elimina productos duplicados con precio 0 que NO tienen dependencias

-- ⚠️ DESCOMENTA LAS SIGUIENTES LÍNEAS SOLO DESPUÉS DE VERIFICAR LOS RESULTADOS ANTERIORES

/*
-- Iniciar transacción para poder hacer rollback si algo sale mal
START TRANSACTION;

-- Paso 5.1: Eliminar variantes de productos base duplicados con precio 0
DELETE v FROM productos v
INNER JOIN productos pb ON v.producto_base_id = pb.id
WHERE pb.producto_base_id IS NULL
  AND pb.precio = 0
  AND pb.nombre IN (
    SELECT nombre FROM (
      SELECT nombre 
      FROM productos 
      WHERE producto_base_id IS NULL 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
    ) as duplicados
  )
  -- Solo eliminar si NO tiene pedidos relacionados
  AND pb.id NOT IN (
    SELECT DISTINCT producto_id 
    FROM detalle_pedidos 
    WHERE producto_id IS NOT NULL
  )
  -- Solo eliminar si NO tiene movimientos de inventario
  AND pb.id NOT IN (
    SELECT DISTINCT producto_id 
    FROM inventario_movimientos 
    WHERE producto_id IS NOT NULL
  );

-- Paso 5.2: Eliminar productos base duplicados con precio 0
DELETE pb FROM productos pb
WHERE pb.producto_base_id IS NULL
  AND pb.precio = 0
  AND pb.nombre IN (
    SELECT nombre FROM (
      SELECT nombre 
      FROM productos 
      WHERE producto_base_id IS NULL 
      GROUP BY nombre 
      HAVING COUNT(*) > 1
    ) as duplicados
  )
  -- Solo eliminar si NO tiene pedidos relacionados
  AND pb.id NOT IN (
    SELECT DISTINCT producto_id 
    FROM detalle_pedidos 
    WHERE producto_id IS NOT NULL
  )
  -- Solo eliminar si NO tiene movimientos de inventario
  AND pb.id NOT IN (
    SELECT DISTINCT producto_id 
    FROM inventario_movimientos 
    WHERE producto_id IS NOT NULL
  );

-- Verificar cuántos registros se eliminaron
SELECT ROW_COUNT() as registros_eliminados;

-- Si todo está bien, haz COMMIT. Si algo salió mal, haz ROLLBACK.
-- COMMIT;
-- ROLLBACK;
*/

-- ----------------------------------------
-- PASO 6: VERIFICACIÓN POST-ELIMINACIÓN
-- ----------------------------------------
-- Ejecuta esto después del COMMIT para verificar que ya no hay duplicados

/*
SELECT 
    nombre,
    COUNT(*) as cantidad,
    GROUP_CONCAT(id) as ids
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1;
*/

-- ========================================
-- NOTAS IMPORTANTES:
-- ========================================
-- 1. Siempre ejecuta los pasos 1-4 primero para IDENTIFICAR los duplicados
-- 2. Revisa cuidadosamente los resultados antes de eliminar
-- 3. El criterio de eliminación es: productos con precio = 0 Y sin dependencias
-- 4. Si un producto tiene pedidos o movimientos, NO se eliminará automáticamente
-- 5. Puedes hacer ROLLBACK en cualquier momento antes del COMMIT
-- 6. Se recomienda hacer un backup de la BD antes de ejecutar el paso 5
