-- ============================================
-- Seed completo: Jugos y Licuados Doña Chuy
-- ============================================
-- Basado en DataInitializer.java
-- Total: ~54 productos con variantes (Chico/Mediano/Grande)
-- 6 Categorías: Jugos, Licuados y Chocomiles, Desayunos, Adicionales, Postres, Bebidas
-- IDEMPOTENTE: Ejecutar múltiples veces sin duplicar datos

BEGIN;

-- ============================================
-- CATEGORÍAS (6 categorías)
-- ============================================
INSERT INTO categorias_productos (nombre, descripcion, activa)
VALUES
  ('Jugos', 'Jugos naturales de frutas y verduras', 1),
  ('Licuados y Chocomiles', 'Licuados y chocomiles de diferentes sabores', 1),
  ('Desayunos', 'Desayunos, molletes, lonches y sandwiches', 1),
  ('Adicionales', 'Ingredientes y adiciones extra', 1),
  ('Postres', 'Postres y productos dulces', 1),
  ('Bebidas', 'Bebidas complementarias (café, té, etc.)', 1)
ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;

-- ============================================
-- PRODUCTOS BASE + VARIANTES
-- ============================================
-- Para productos con variantes, primero insertamos el base, luego las variantes
-- usando producto_base_id

-- ============================================
-- JUGOS (Categoría 1) - 7 productos base + 21 variantes
-- ============================================

-- Naranja (Base: Mediano $40)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  -- Verificar si ya existe el producto base
  SELECT id INTO base_id FROM productos WHERE nombre='Naranja' AND categoria_id=cat_id;
  
  IF base_id IS NULL THEN
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
    VALUES ('Naranja', 'Jugo natural de naranja', cat_id, 40.00, 1, 1)
    RETURNING id INTO base_id;
  END IF;
  
  -- Variantes (solo insertar si no existen)
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  SELECT 'Naranja Chico', 'Jugo natural de naranja', cat_id, 25.00, 1, 1, base_id, 'Chico', 1
  WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Naranja Chico');
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  SELECT 'Naranja Mediano', 'Jugo natural de naranja', cat_id, 40.00, 1, 1, base_id, 'Mediano', 2
  WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Naranja Mediano');
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  SELECT 'Naranja Grande', 'Jugo natural de naranja', cat_id, 65.00, 1, 1, base_id, 'Grande', 3
  WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre='Naranja Grande');
END $$;

-- Toronja (Base: Mediano $40)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Toronja', 'Jugo natural de toronja', cat_id, 40.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Toronja Chico', 'Jugo natural de toronja', cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
    ('Toronja Mediano', 'Jugo natural de toronja', cat_id, 40.00, 1, 1, base_id, 'Mediano', 2),
    ('Toronja Grande', 'Jugo natural de toronja', cat_id, 65.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Zanahoria (Base: Mediano $30)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Zanahoria', 'Jugo natural de zanahoria', cat_id, 30.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Zanahoria Chico', 'Jugo natural de zanahoria', cat_id, 20.00, 1, 1, base_id, 'Chico', 1),
    ('Zanahoria Mediano', 'Jugo natural de zanahoria', cat_id, 30.00, 1, 1, base_id, 'Mediano', 2),
    ('Zanahoria Grande', 'Jugo natural de zanahoria', cat_id, 50.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Mixto (Base: Mediano $35)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Mixto', 'Jugo mixto (naranja, zanahoria, betabel)', cat_id, 35.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Mixto Chico', 'Jugo mixto (naranja, zanahoria, betabel)', cat_id, 22.00, 1, 1, base_id, 'Chico', 1),
    ('Mixto Mediano', 'Jugo mixto (naranja, zanahoria, betabel)', cat_id, 35.00, 1, 1, base_id, 'Mediano', 2),
    ('Mixto Grande', 'Jugo mixto (naranja, zanahoria, betabel)', cat_id, 55.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Verde (Base: Mediano $40)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Verde', 'Jugo verde de verduras y frutas (apio, perejil, nopal, espinaca, piña)', cat_id, 40.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Verde Chico', 'Jugo verde de verduras y frutas', cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
    ('Verde Mediano', 'Jugo verde de verduras y frutas', cat_id, 40.00, 1, 1, base_id, 'Mediano', 2),
    ('Verde Grande', 'Jugo verde de verduras y frutas', cat_id, 70.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Verde Especial (Base: Mediano $50)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Verde Especial', 'Jugo verde especial de verduras y frutas', cat_id, 50.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Verde Especial Chico', 'Jugo verde especial', cat_id, 30.00, 1, 1, base_id, 'Chico', 1),
    ('Verde Especial Mediano', 'Jugo verde especial', cat_id, 50.00, 1, 1, base_id, 'Mediano', 2),
    ('Verde Especial Grande', 'Jugo verde especial', cat_id, 90.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Mixto Betabel (Base: Mediano $45)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Jugos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Mixto Betabel', 'Jugo mixto con betabel', cat_id, 45.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Mixto Betabel Chico', 'Jugo mixto con betabel', cat_id, 28.00, 1, 1, base_id, 'Chico', 1),
    ('Mixto Betabel Mediano', 'Jugo mixto con betabel', cat_id, 45.00, 1, 1, base_id, 'Mediano', 2),
    ('Mixto Betabel Grande', 'Jugo mixto con betabel', cat_id, 80.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- ============================================
-- LICUADOS Y CHOCOMILES (Categoría 2) - 11 productos base + 33 variantes
-- ============================================

-- Licuados (6 productos x 3 variantes = 18 variantes)
-- Fresa
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Licuados y Chocomiles';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Fresa', 'Licuado de fresa', cat_id, 35.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Fresa Chico', 'Licuado de fresa', cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
    ('Fresa Mediano', 'Licuado de fresa', cat_id, 35.00, 1, 1, base_id, 'Mediano', 2),
    ('Fresa Grande', 'Licuado de fresa', cat_id, 60.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Plátano
DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Licuados y Chocomiles';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Plátano', 'Licuado de plátano', cat_id, 35.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Plátano Chico', 'Licuado de plátano', cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
    ('Plátano Mediano', 'Licuado de plátano', cat_id, 35.00, 1, 1, base_id, 'Mediano', 2),
    ('Plátano Grande', 'Licuado de plátano', cat_id, 60.00, 1, 1, base_id, 'Grande', 3)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- Manzana, Papaya, Frutas, Cereales (misma estructura, precio $35 mediano)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
  producto_nombre TEXT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Licuados y Chocomiles';
  
  FOREACH producto_nombre IN ARRAY ARRAY['Manzana', 'Papaya', 'Frutas', 'Cereales']
  LOOP
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
    VALUES (producto_nombre, 'Licuado de ' || producto_nombre, cat_id, 35.00, 1, 1)
    ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO base_id;
    
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
    VALUES 
      (producto_nombre || ' Chico', 'Licuado de ' || producto_nombre, cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
      (producto_nombre || ' Mediano', 'Licuado de ' || producto_nombre, cat_id, 35.00, 1, 1, base_id, 'Mediano', 2),
      (producto_nombre || ' Grande', 'Licuado de ' || producto_nombre, cat_id, 60.00, 1, 1, base_id, 'Grande', 3)
    ON CONFLICT (nombre) DO NOTHING;
  END LOOP;
END $$;

-- Chocomiles (5 productos x 3 variantes = 15 variantes)
-- Chocomilk Chocolate, Fresa, Vainilla (precio mediano $25)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
  producto_nombre TEXT;
  sabor TEXT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Licuados y Chocomiles';
  
  FOREACH sabor IN ARRAY ARRAY['Chocolate', 'Fresa', 'Vainilla']
  LOOP
    producto_nombre := 'Chocomilk ' || sabor;
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
    VALUES (producto_nombre, 'Chocomilk de ' || sabor, cat_id, 25.00, 1, 1)
    ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO base_id;
    
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
    VALUES 
      (producto_nombre || ' Chico', 'Chocomilk de ' || sabor, cat_id, 18.00, 1, 1, base_id, 'Chico', 1),
      (producto_nombre || ' Mediano', 'Chocomilk de ' || sabor, cat_id, 25.00, 1, 1, base_id, 'Mediano', 2),
      (producto_nombre || ' Grande', 'Chocomilk de ' || sabor, cat_id, 40.00, 1, 1, base_id, 'Grande', 3)
    ON CONFLICT (nombre) DO NOTHING;
  END LOOP;
END $$;

-- Chocomilk Cafe y Fresa Natural (precio mediano $35)
DO $$
DECLARE
  cat_id INT;
  base_id INT;
  producto_nombre TEXT;
  sabor TEXT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Licuados y Chocomiles';
  
  FOREACH sabor IN ARRAY ARRAY['Cafe', 'Fresa Natural']
  LOOP
    producto_nombre := 'Chocomilk ' || sabor;
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
    VALUES (producto_nombre, 'Chocomilk de ' || sabor, cat_id, 35.00, 1, 1)
    ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
    RETURNING id INTO base_id;
    
    INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
    VALUES 
      (producto_nombre || ' Chico', 'Chocomilk de ' || sabor, cat_id, 25.00, 1, 1, base_id, 'Chico', 1),
      (producto_nombre || ' Mediano', 'Chocomilk de ' || sabor, cat_id, 35.00, 1, 1, base_id, 'Mediano', 2),
      (producto_nombre || ' Grande', 'Chocomilk de ' || sabor, cat_id, 60.00, 1, 1, base_id, 'Grande', 3)
    ON CONFLICT (nombre) DO NOTHING;
  END LOOP;
END $$;

-- ============================================
-- DESAYUNOS (Categoría 3) - Productos simples + Waffles con variantes
-- ============================================

DO $$
DECLARE
  cat_id INT;
  base_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Desayunos';
  
  -- Productos sin variantes
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES 
    ('Chilaquiles', 'Orden de chilaquiles rojos acompañados de frijoles, huevo al gusto y bolillo', cat_id, 65.00, 1, 1),
    ('Huevos al gusto', 'Orden de Huevos al gusto acompañados de frijoles y bolillo', cat_id, 50.00, 1, 1),
    ('Mini Hot Cakes (15 pzs)', 'Mini hot cakes (15 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', cat_id, 55.00, 1, 1),
    ('Mini Hot Cakes (10 pzs)', 'Mini hot cakes (10 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', cat_id, 45.00, 1, 1),
    ('Burritas y Quesadillas', 'Burritas y quesadillas acompañadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', cat_id, 15.00, 1, 1),
    ('Molletes Dulces', 'Molletes dulces con mantequilla, azúcar y canela', cat_id, 30.00, 1, 1),
    ('Molletes con Untado', 'Molletes con untado de mermelada, nutella, lechera o miel', cat_id, 35.00, 1, 1),
    ('Molletes Salados', 'Molletes salados con frijoles con queso o salsa mexicana', cat_id, 40.00, 1, 1),
    ('Lonches y Sincronizadas', 'Lonches y sincronizadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', cat_id, 35.00, 1, 1),
    ('Lonche de Pierna o Combinado', 'Lonche de pierna o combinado', cat_id, 65.00, 1, 1),
    ('Lonche de Jamón', 'Lonche de jamón', cat_id, 45.00, 1, 1),
    ('Lonche de Panela', 'Lonche de panela', cat_id, 55.00, 1, 1),
    ('Lonche de Jamón y Panela', 'Lonche de jamón y panela', cat_id, 55.00, 1, 1),
    ('Lonche de Chilaquiles', 'Lonche de chilaquiles', cat_id, 45.00, 1, 1),
    ('Sandwich de Pierna o Combinado', 'Sandwich de pierna o combinado', cat_id, 55.00, 1, 1),
    ('Sandwich de Jamón', 'Sandwich de jamón', cat_id, 35.00, 1, 1),
    ('Sandwich de Panela', 'Sandwich de panela', cat_id, 45.00, 1, 1),
    ('Sandwich de Jamón y Panela', 'Sandwich de jamón y panela', cat_id, 45.00, 1, 1),
    ('Sandwich de Chilaquiles', 'Sandwich de chilaquiles', cat_id, 35.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio;
  
  -- Waffles con variantes Chico/Grande
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Waffles', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', cat_id, 60.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio
  RETURNING id INTO base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Waffles Chico', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', cat_id, 35.00, 1, 1, base_id, 'Chico', 1),
    ('Waffles Grande', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', cat_id, 60.00, 1, 1, base_id, 'Grande', 2)
  ON CONFLICT (nombre) DO NOTHING;
END $$;

-- ============================================
-- ADICIONALES (Categoría 4)
-- ============================================

DO $$
DECLARE
  cat_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Adicionales';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES 
    ('Miel', 'Miel', cat_id, 5.00, 1, 1),
    ('Deslactosada', 'Leche deslactosada', cat_id, 5.00, 1, 1),
    ('Cereal', 'Cereal', cat_id, 5.00, 1, 1),
    ('Rompope', 'Rompope', cat_id, 15.00, 1, 1),
    ('Jerez', 'Jerez', cat_id, 15.00, 1, 1),
    ('Huevo Pata', 'Huevo de pata', cat_id, 15.00, 1, 1),
    ('Huevo Gallina', 'Huevo de gallina', cat_id, 5.00, 1, 1),
    ('Huevo Codorniz', 'Huevo de codorniz', cat_id, 2.50, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio;
END $$;

-- ============================================
-- POSTRES (Categoría 5)
-- ============================================

DO $$
DECLARE
  cat_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Postres';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES 
    ('Bionicos', 'Bionicos', cat_id, 55.00, 1, 1),
    ('Panecitos 3 pzs', 'Panecitos (3 piezas)', cat_id, 10.00, 1, 1),
    ('Galletas Nuez o Avena', 'Galletas de nuez o avena', cat_id, 10.00, 1, 1),
    ('Pay Queso', 'Pay de queso', cat_id, 25.00, 1, 1),
    ('Mantecadas', 'Mantecadas', cat_id, 25.00, 1, 1),
    ('Yakult', 'Yakult', cat_id, 10.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio;
END $$;

-- ============================================
-- BEBIDAS (Categoría 6)
-- ============================================

DO $$
DECLARE
  cat_id INT;
BEGIN
  SELECT id INTO cat_id FROM categorias_productos WHERE nombre='Bebidas';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES 
    ('Cafe', 'Café', cat_id, 20.00, 1, 1),
    ('Té', 'Té', cat_id, 15.00, 1, 1)
  ON CONFLICT (nombre) DO UPDATE SET precio = EXCLUDED.precio;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN (opcional)
-- ============================================
-- Ejecutar después para confirmar totales:
-- SELECT 
--   c.nombre AS categoria,
--   COUNT(p.id) AS total_productos,
--   SUM(CASE WHEN p.producto_base_id IS NULL THEN 1 ELSE 0 END) AS productos_base,
--   SUM(CASE WHEN p.producto_base_id IS NOT NULL THEN 1 ELSE 0 END) AS variantes
-- FROM categorias_productos c
-- LEFT JOIN productos p ON p.categoria_id = c.id
-- GROUP BY c.nombre
-- ORDER BY c.nombre;
