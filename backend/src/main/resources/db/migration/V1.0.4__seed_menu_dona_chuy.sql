-- Seed: menú real "Jugos y Licuados Doña Chuy"
-- Reemplaza catálogo demo (productos de la sucursal 1). Idempotente.
-- Patrón: producto base (producto_base_id NULL) + variantes (precio propio).

DELETE FROM productos WHERE sucursal_id = 1;
SELECT setval('productos_id_seq', 1, false);

-- ================= DESAYUNOS =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chilaquiles', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos'), 1, 65.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chilaquiles' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Huevos al Gusto', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos'), 1, 50.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Huevos al Gusto' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Burritas y Quesadillas', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos'), 1, 15.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Burritas y Quesadillas' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Lonches y Sincronizadas', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos'), 1, 35.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches y Sincronizadas' AND sucursal_id = 1);

-- ================= ESPECIALIDADES: WAFFLES Y MINI HOT CAKES =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Waffle', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Waffle' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Waffle', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Waffle' AND producto_base_id IS NULL AND sucursal_id = 1), 'Grande', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Waffle' AND producto_base_id IS NULL AND nombre_variante = 'Grande');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Waffle', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Waffle' AND producto_base_id IS NULL AND sucursal_id = 1), 'Chico', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Waffle' AND producto_base_id IS NULL AND nombre_variante = 'Chico');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Mini Hot Cakes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mini Hot Cakes' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Mini Hot Cakes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Mini Hot Cakes' AND producto_base_id IS NULL AND sucursal_id = 1), '15 piezas', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mini Hot Cakes' AND producto_base_id IS NULL AND nombre_variante = '15 piezas');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Mini Hot Cakes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Mini Hot Cakes' AND producto_base_id IS NULL AND sucursal_id = 1), '10 piezas', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mini Hot Cakes' AND producto_base_id IS NULL AND nombre_variante = '10 piezas');

-- ================= ESPECIALIDADES: MOLLETES =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Molletes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Molletes' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Molletes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 30.00,
       (SELECT id FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND sucursal_id = 1), 'Dulces', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND nombre_variante = 'Dulces');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Molletes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND sucursal_id = 1), 'Con untado', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND nombre_variante = 'Con untado');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Molletes', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND sucursal_id = 1), 'Salados', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Molletes' AND producto_base_id IS NULL AND nombre_variante = 'Salados');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Ingrediente Extra', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Ingrediente Extra' AND sucursal_id = 1);

-- ================= ESPECIALIDADES: LONCHES =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 65.00,
       (SELECT id FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Pierna o combinado', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND nombre_variante = 'Pierna o combinado');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Jamón', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND nombre_variante = 'Jamón');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Panela', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND nombre_variante = 'Panela');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Jamón y Panela', 4, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND nombre_variante = 'Jamón y Panela');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Lonches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Chilaquiles', 5, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Lonches' AND producto_base_id IS NULL AND nombre_variante = 'Chilaquiles');

-- ================= ESPECIALIDADES: SANDWICHES =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Sandwiches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Sandwiches' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Sandwiches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Pierna o combinado', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND nombre_variante = 'Pierna o combinado');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Sandwiches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Jamón', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND nombre_variante = 'Jamón');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Sandwiches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Panela', 3, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND nombre_variante = 'Panela');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Sandwiches', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Especialidades'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND sucursal_id = 1), 'Jamón y Panela', 4, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Sandwiches' AND producto_base_id IS NULL AND nombre_variante = 'Jamón y Panela');

-- ================= BEBIDAS: JUGOS NATURALES =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Naranja o Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja o Toronja' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Naranja o Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Naranja o Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja o Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Naranja o Toronja', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 65.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Naranja o Toronja' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Naranja o Toronja' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Zanahoria' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 30.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Zanahoria' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Zanahoria' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Zanahoria', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 50.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Zanahoria' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Zanahoria' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Mixto (Naranja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Mixto (Naranja y Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 55.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Mixto (Naranja y Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Verde', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Verde', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Verde' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Verde', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 70.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Verde' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo Verde Especial', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde Especial' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Verde Especial', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 50.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Verde Especial' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde Especial' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo Verde Especial', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 90.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo Verde Especial' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo Verde Especial' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jugo de Betabel (Naranja o Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel (Naranja o Zanahoria)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel (Naranja o Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 45.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel (Naranja o Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel (Naranja o Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Jugo de Betabel (Naranja o Zanahoria)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 80.00,
       (SELECT id FROM productos WHERE nombre = 'Jugo de Betabel (Naranja o Zanahoria)' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jugo de Betabel (Naranja o Zanahoria)' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- ================= BEBIDAS: LICUADOS =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Licuado de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Fresa' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Fresa' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Fresa' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Fresa' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Fresa' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Licuado de Plátano', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Plátano' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Plátano', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Plátano' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Plátano' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Plátano', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Plátano' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Plátano' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Licuado de Manzana', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Manzana' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Manzana', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Manzana' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Manzana' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Manzana', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Manzana' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Manzana' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Licuado de Papaya', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Papaya' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Papaya', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Papaya' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Papaya' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Papaya', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Papaya' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Papaya' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Licuado de Frutas o Cereales', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Frutas o Cereales' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Frutas o Cereales', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Frutas o Cereales' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Frutas o Cereales' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Licuado de Frutas o Cereales', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Licuado de Frutas o Cereales' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Licuado de Frutas o Cereales' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- ================= BEBIDAS: CHOCOMILK =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chocomilk de Chocolate', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Chocolate' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Chocolate', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 25.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Chocolate' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Chocolate' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Chocolate', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Chocolate' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Chocolate' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chocomilk de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 25.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Fresa' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Fresa', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Fresa' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chocomilk de Vainilla', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Vainilla' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Vainilla', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 25.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Vainilla' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Vainilla' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Vainilla', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 40.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Vainilla' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Vainilla' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chocomilk de Café', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Café' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Café', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Café' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Café' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Café', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Café' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Café' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Chocomilk de Fresa Natural', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 0.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa Natural' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Fresa Natural', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 35.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Fresa Natural' AND producto_base_id IS NULL AND sucursal_id = 1), 'Medio', 1, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa Natural' AND producto_base_id IS NULL AND nombre_variante = 'Medio');

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, producto_base_id, nombre_variante, orden_variante, version)
SELECT 'Chocomilk de Fresa Natural', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Bebidas'), 1, 60.00,
       (SELECT id FROM productos WHERE nombre = 'Chocomilk de Fresa Natural' AND producto_base_id IS NULL AND sucursal_id = 1), 'Litro', 2, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Chocomilk de Fresa Natural' AND producto_base_id IS NULL AND nombre_variante = 'Litro');

-- ================= EXTRAS: ADICIONALES PARA BEBIDAS =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Miel', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Miel' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Leche Deslactosada', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Leche Deslactosada' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Cereal', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Cereal' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Rompope', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Rompope' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Jerez', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Jerez' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Huevo Pata', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 15.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Huevo Pata' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Huevo Gallina', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 5.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Huevo Gallina' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Huevo Codorniz', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 2.50, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Huevo Codorniz' AND sucursal_id = 1);

-- ================= EXTRAS: OTROS PRODUCTOS =================
INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Biónicos', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 55.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Biónicos' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Café', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 20.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Café' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Té', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 15.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Té' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Panecitos (3 piezas)', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Panecitos (3 piezas)' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Galletas de Nuez', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Galletas de Nuez' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Galletas de Avena', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Galletas de Avena' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Pay de Queso', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 25.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Pay de Queso' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Mantecadas', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 25.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Mantecadas' AND sucursal_id = 1);

INSERT INTO productos (nombre, activo, disponible_en_menu, categoria_id, sucursal_id, precio, version)
SELECT 'Yakult', TRUE, TRUE, (SELECT id FROM categorias_productos WHERE nombre = 'Extras'), 1, 10.00, 0
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = 'Yakult' AND sucursal_id = 1);