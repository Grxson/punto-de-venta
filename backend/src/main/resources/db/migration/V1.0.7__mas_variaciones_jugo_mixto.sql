-- V1.0.7: Mas variaciones de jugo mixto + Jugo de Betabel con Toronja
-- Cada combinacion = producto base con variantes Medio/Litro
-- Idempotente. Sucursal 1.

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Naranja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Betabel)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Betabel)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Betabel)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Betabel)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Betabel)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Naranja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Verde)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Verde)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Verde)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 70.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Verde)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Verde)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Toronja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Toronja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Betabel)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Betabel)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Betabel)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Betabel)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Betabel)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Betabel)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Toronja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Verde)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Verde)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Verde)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Toronja y Verde)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 70.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Verde)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Toronja y Verde)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- Jugo de Betabel con Toronja
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Betabel con Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Toronja' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel con Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Jugos'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel con Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel con Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Litro');