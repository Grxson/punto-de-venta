-- Reorganización categorías: menú Doña Chuy (Opción A)
-- Categorías: Desayunos, Lonches, Sandwiches, Jugos, Licuados, Chocomilks, Extras
-- Idempotente. Sucursal 1.

-- 1) Crear categorías nuevas si no existen
INSERT INTO categorias_productos (nombre, activa, orden, sucursal_id)
SELECT 'Lonches', TRUE, 2, 1 WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Lonches' AND sucursal_id = 1);

INSERT INTO categorias_productos (nombre, activa, orden, sucursal_id)
SELECT 'Sandwiches', TRUE, 3, 1 WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Sandwiches' AND sucursal_id = 1);

INSERT INTO categorias_productos (nombre, activa, orden, sucursal_id)
SELECT 'Jugos', TRUE, 4, 1 WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Jugos' AND sucursal_id = 1);

INSERT INTO categorias_productos (nombre, activa, orden, sucursal_id)
SELECT 'Licuados', TRUE, 5, 1 WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Licuados' AND sucursal_id = 1);

INSERT INTO categorias_productos (nombre, activa, orden, sucursal_id)
SELECT 'Chocomilks', TRUE, 6, 1 WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Chocomilks' AND sucursal_id = 1);

-- 2) Ajustar orden de Desayunos (1) y Extras (7)
UPDATE categorias_productos SET orden = 1 WHERE nombre = 'Desayunos' AND sucursal_id = 1 AND orden <> 1;
UPDATE categorias_productos SET orden = 7 WHERE nombre = 'Extras' AND sucursal_id = 1 AND orden <> 7;

-- 3) Mover productos a sus categorías (UPDATE con subquery por nombre de categoría)
-- Desayunos: Waffle, Mini Hot Cakes, Molletes, Ingrediente Extra (venían de Especialidades)
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos' AND sucursal_id = 1)
WHERE nombre IN ('Waffle', 'Mini Hot Cakes', 'Molletes', 'Ingrediente Extra') AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Desayunos' AND sucursal_id = 1);

-- Lonches: base + variantes
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Lonches' AND sucursal_id = 1)
WHERE nombre = 'Lonches' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Lonches' AND sucursal_id = 1);

-- Sandwiches: base + variantes
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Sandwiches' AND sucursal_id = 1)
WHERE nombre = 'Sandwiches' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Sandwiches' AND sucursal_id = 1);

-- Jugos: los 6 sabores (base + variantes)
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Jugos' AND sucursal_id = 1)
WHERE nombre LIKE 'Jugo%' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Jugos' AND sucursal_id = 1);

-- Licuados: 5 sabores (base + variantes)
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Licuados' AND sucursal_id = 1)
WHERE nombre LIKE 'Licuado%' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Licuados' AND sucursal_id = 1);

-- Chocomilks: 5 sabores (base + variantes)
UPDATE productos SET categoria_id = (SELECT id FROM categorias_productos WHERE nombre = 'Chocomilks' AND sucursal_id = 1)
WHERE nombre LIKE 'Chocomilk%' AND sucursal_id = 1
  AND categoria_id <> (SELECT id FROM categorias_productos WHERE nombre = 'Chocomilks' AND sucursal_id = 1);

-- 4) Eliminar categorías viejas huérfanas (Especialidades, Bebidas) solo si no quedan productos
DELETE FROM categorias_productos
WHERE sucursal_id = 1 AND nombre IN ('Especialidades', 'Bebidas')
  AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.categoria_id = categorias_productos.id);