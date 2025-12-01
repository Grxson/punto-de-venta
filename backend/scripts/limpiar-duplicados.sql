-- ========================================
-- SCRIPT PARA IDENTIFICAR Y LIMPIAR PRODUCTOS DUPLICADOS
-- ========================================

-- ----------------------------------------
-- 1. IDENTIFICAR PRODUCTOS BASE DUPLICADOS
-- ----------------------------------------
-- Encuentra productos base (sin producto_base_id) que tienen el mismo nombre
SELECT 
    nombre,
    COUNT(*) as cantidad,
    GROUP_CONCAT(id) as ids,
    GROUP_CONCAT(precio) as precios
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY nombre;

-- ----------------------------------------
-- 2. VERIFICAR VARIANTES DE PRODUCTOS DUPLICADOS
-- ----------------------------------------
-- Para cada producto base duplicado, muestra sus variantes
-- Esto te ayudará a identificar cuál conjunto mantener

-- NARANJA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Naranja' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- TORONJA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Toronja' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- ZANAHORIA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Zanahoria' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- MIXTO
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Mixto' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- VERDE
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Verde' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- VERDE ESPECIAL
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Verde Especial' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- MIXTO BETABEL
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Mixto Betabel' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- NARANJA/TORONJA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Naranja/Toronja' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- NARANJA/ZANAHORIA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Naranja/Zanahoria' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- ZANAHORIA/TORONJA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Zanahoria/Toronja' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- BETABEL/NARANJA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Betabel/Naranja' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- BETABEL/ZANAHORIA
SELECT 
    p.id as producto_id,
    p.nombre,
    p.precio as precio_base,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante,
    v.orden_variante
FROM productos p
LEFT JOIN productos v ON v.producto_base_id = p.id
WHERE p.nombre = 'Betabel/Zanahoria' AND p.producto_base_id IS NULL
ORDER BY p.id, v.orden_variante;

-- ----------------------------------------
-- 3. IDENTIFICAR VARIANTES CON PRECIO 0 EN CHICO
-- ----------------------------------------
-- Encuentra variantes "Chico" que tienen precio 0
SELECT 
    p.id as producto_base_id,
    p.nombre as producto_nombre,
    v.id as variante_id,
    v.nombre_variante,
    v.precio as precio_variante
FROM productos p
INNER JOIN productos v ON v.producto_base_id = p.id
WHERE v.nombre_variante = 'Chico' 
  AND v.precio = 0
ORDER BY p.nombre;

-- ----------------------------------------
-- 4. TEMPLATE PARA ELIMINAR PRODUCTOS DUPLICADOS
-- ----------------------------------------
-- IMPORTANTE: 
-- 1. Ejecuta primero las consultas SELECT de arriba
-- 2. Identifica los IDs de los productos BASE que quieres ELIMINAR
-- 3. Reemplaza los IDs en las consultas DELETE de abajo
-- 4. Ejecuta las consultas DELETE en orden: primero variantes, luego base

-- Template para eliminar un producto y sus variantes:
-- PASO 1: Eliminar variantes (productos que tienen producto_base_id = X)
-- DELETE FROM productos WHERE producto_base_id = [ID_PRODUCTO_BASE_A_ELIMINAR];

-- PASO 2: Eliminar producto base
-- DELETE FROM productos WHERE id = [ID_PRODUCTO_BASE_A_ELIMINAR];

-- ----------------------------------------
-- EJEMPLOS DE ELIMINACIÓN (COMENTADOS)
-- ----------------------------------------
-- Descomenta y ajusta los IDs según tu identificación:

-- Ejemplo: Si el producto base "Naranja" con ID 100 tiene variantes con precio 0 en Chico:
-- DELETE FROM productos WHERE producto_base_id = 100;
-- DELETE FROM productos WHERE id = 100;

-- ----------------------------------------
-- 5. VERIFICACIÓN FINAL
-- ----------------------------------------
-- Después de eliminar, verifica que no haya duplicados:
SELECT 
    nombre,
    COUNT(*) as cantidad
FROM productos 
WHERE producto_base_id IS NULL
GROUP BY nombre
HAVING COUNT(*) > 1
ORDER BY nombre;

-- Verifica que todas las variantes Chico tengan precio > 0:
SELECT 
    p.nombre as producto_nombre,
    v.nombre_variante,
    v.precio as precio_variante
FROM productos p
INNER JOIN productos v ON v.producto_base_id = p.id
WHERE v.nombre_variante = 'Chico' 
  AND v.precio <= 0
ORDER BY p.nombre;
