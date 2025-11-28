-- Seed de categorías y productos base (idempotente)
-- Ejecutar en PostgreSQL (Railway) después de aplicar migraciones.

BEGIN;

-- Categorías (ON CONFLICT por nombre)
INSERT INTO categorias_productos (nombre, descripcion, activa)
VALUES
  ('Burritas', 'Burritas y fajitas', 1),
  ('Chilaquiles', 'Chilaquiles verdes/rojos con topping', 1),
  ('Huevos', 'Huevos al gusto y omelette', 1),
  ('Jugos', 'Jugos naturales', 1),
  ('Licuados', 'Licuados de fruta', 1),
  ('Molletes', 'Molletes tradicionales', 1),
  ('Waffles', 'Waffles y toppings', 1),
  ('Extras', 'Bebidas y complementos', 1)
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion; -- asegura descripción

-- Productos (idempotentes por nombre)
-- Nota: activo=1 y disponible_en_menu=1

-- Burritas
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Burrita de frijol con queso', 'Tortilla de harina, frijol y queso', id, 45.00, NULL, 'BUR-FRI-Q', 1, 1
FROM categorias_productos WHERE nombre='Burritas'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Burrita de frijol con queso');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Burrita de chorizo', 'Chorizo con queso', id, 55.00, NULL, 'BUR-CHO-Q', 1, 1
FROM categorias_productos WHERE nombre='Burritas'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Burrita de chorizo');

-- Chilaquiles
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Chilaquiles verdes', 'Totopos en salsa verde con crema y queso', id, 70.00, NULL, 'CHI-VER', 1, 1
FROM categorias_productos WHERE nombre='Chilaquiles'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Chilaquiles verdes');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Chilaquiles rojos', 'Totopos en salsa roja con crema y queso', id, 70.00, NULL, 'CHI-ROJ', 1, 1
FROM categorias_productos WHERE nombre='Chilaquiles'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Chilaquiles rojos');

-- Huevos
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Huevos al gusto', 'Estrellados, revueltos o a la mexicana', id, 55.00, NULL, 'HUE-GUS', 1, 1
FROM categorias_productos WHERE nombre='Huevos'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Huevos al gusto');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Omelette', 'Omelette con relleno a elección', id, 65.00, NULL, 'HUE-OME', 1, 1
FROM categorias_productos WHERE nombre='Huevos'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Omelette');

-- Jugos
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Jugo de naranja 500ml', 'Naranja exprimida', id, 35.00, NULL, 'JUG-NAR-500', 1, 1
FROM categorias_productos WHERE nombre='Jugos'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Jugo de naranja 500ml');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Jugo de zanahoria 500ml', 'Zanahoria exprimida', id, 30.00, NULL, 'JUG-ZAN-500', 1, 1
FROM categorias_productos WHERE nombre='Jugos'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Jugo de zanahoria 500ml');

-- Licuados
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Licuado de plátano 500ml', 'Plátano con leche', id, 30.00, NULL, 'LIC-PLA-500', 1, 1
FROM categorias_productos WHERE nombre='Licuados'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Licuado de plátano 500ml');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Licuado de fresa 500ml', 'Fresa con leche', id, 35.00, NULL, 'LIC-FRE-500', 1, 1
FROM categorias_productos WHERE nombre='Licuados'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Licuado de fresa 500ml');

-- Molletes
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Molletes clásicos', 'Bolillo con frijol y queso gratinado', id, 60.00, NULL, 'MOL-CLA', 1, 1
FROM categorias_productos WHERE nombre='Molletes'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Molletes clásicos');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Molletes con chorizo', 'Clásicos con chorizo', id, 70.00, NULL, 'MOL-CHO', 1, 1
FROM categorias_productos WHERE nombre='Molletes'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Molletes con chorizo');

-- Waffles
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Waffle clásico', 'Waffle con mantequilla y miel', id, 65.00, NULL, 'WAF-CLA', 1, 1
FROM categorias_productos WHERE nombre='Waffles'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Waffle clásico');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Waffle con frutas', 'Waffle con fruta de temporada', id, 75.00, NULL, 'WAF-FRU', 1, 1
FROM categorias_productos WHERE nombre='Waffles'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Waffle con frutas');

-- Extras
INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Café americano', 'Taza de café', id, 28.00, NULL, 'EXT-CAF-AME', 1, 1
FROM categorias_productos WHERE nombre='Extras'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Café americano');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, costo_estimado, sku, activo, disponible_en_menu)
SELECT 'Agua natural 600ml', 'Botella de agua', id, 20.00, NULL, 'EXT-AGU-600', 1, 1
FROM categorias_productos WHERE nombre='Extras'
AND NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Agua natural 600ml');

COMMIT;
