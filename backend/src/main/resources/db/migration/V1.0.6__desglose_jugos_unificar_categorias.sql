-- V1.0.6: Jugos desglosados por sabor unico
-- Lonches + Sandwiches unificados
-- Chocomilks dentro de Licuados
-- Idempotente. Sucursal 1.

-- ============ 1) JUGOS DESGLOSADOS ============
-- Eliminar viejos sabores compuestos (sin ventas registradas, se reemplazan)
DELETE FROM productos WHERE sucursal_id = 1 AND nombre IN ('Jugo de Naranja o Toronja', 'Jugo de Betabel (Naranja o Zanahoria)');

-- Jugo de Naranja
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Naranja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 65.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Naranja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- Jugo de Toronja
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Toronja' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 65.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- Jugo de Betabel con Naranja
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Betabel con Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Naranja' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Naranja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Naranja' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Naranja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Naranja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Naranja' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- Jugo de Betabel con Zanahoria
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Betabel con Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Zanahoria' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Zanahoria' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Zanahoria' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Zanahoria' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Zanahoria' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- ============ 2) SANDWICHES -> LONCHES ============
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Lonches' AND sucursal_id = 1)
WHERE nombre = 'Sandwiches' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Lonches' AND sucursal_id = 1);

DELETE FROM categorias_productos
WHERE sucursal_id = 1 AND nombre = 'Sandwiches'
  AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.categoria_id = categorias_productos.id);

-- ============ 3) CHOCOMILKS -> LICUADOS ============
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Licuados' AND sucursal_id = 1)
WHERE nombre LIKE 'Chocomilk%' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Licuados' AND sucursal_id = 1);

DELETE FROM categorias_productos
WHERE sucursal_id = 1 AND nombre = 'Chocomilks'
  AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.categoria_id = categorias_productos.id);

-- ============ 4) ORDEN FINAL ============
UPDATE categorias_productos SET orden = 1 WHERE nombre = 'Desayunos' AND sucursal_id = 1;
UPDATE categorias_productos SET orden = 2 WHERE nombre = 'Lonches' AND sucursal_id = 1;
UPDATE categorias_productos SET orden = 3 WHERE nombre = 'Jugos' AND sucursal_id = 1;
UPDATE categorias_productos SET orden = 4 WHERE nombre = 'Licuados' AND sucursal_id = 1;
UPDATE categorias_productos SET orden = 5 WHERE nombre = 'Extras' AND sucursal_id = 1;