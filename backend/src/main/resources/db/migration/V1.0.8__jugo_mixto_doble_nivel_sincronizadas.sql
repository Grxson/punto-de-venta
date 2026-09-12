-- V1.0.8: Sincronizadas renombrado + Jugo Mixto con 2 niveles (combinacion -> tamano)
-- Idempotente. Sucursal 1.

-- 1) Renombrar 'Lonches y Sincronizadas' a 'Sincronizadas'
UPDATE productos SET nombre = 'Sincronizadas'
WHERE nombre = 'Lonches y Sincronizadas' AND sucursal_id = 1;

-- 2) Base 'Jugo Mixto' (nivel 1: combinaciones, nivel 2: tamano)
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto' AND sucursal_id = 1);

-- 3) Las combinaciones pasan a ser variantes del base 'Jugo Mixto' (precio 0, el tamano define)
UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Naranja y Zanahoria', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;

UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Naranja y Betabel', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Naranja y Betabel)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;

UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Naranja y Verde', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Naranja y Verde)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;

UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Toronja y Zanahoria', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;

UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Toronja y Betabel', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Toronja y Betabel)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;

UPDATE productos v SET producto_base_id = (SELECT b.id FROM productos b WHERE b.nombre = 'Jugo Mixto' AND b.producto_base_id IS NULL AND b.sucursal_id = 1),
       nombre_variante = 'Toronja y Verde', precio = 0.00
WHERE v.nombre = 'Jugo Mixto (Toronja y Verde)' AND v.producto_base_id IS NULL AND v.sucursal_id = 1;