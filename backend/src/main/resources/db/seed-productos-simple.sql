-- ============================================
-- Seed completo: Jugos y Licuados Doña Chuy
-- ============================================
-- Total: ~54 productos con variantes (Chico/Mediano/Grande)
-- 6 Categorías: Jugos, Licuados y Chocomiles, Desayunos, Adicionales, Postres, Bebidas
-- EJECUTAR DESPUÉS DE LIMPIAR (DELETE FROM productos; DELETE FROM categorias_productos;)

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
  ('Bebidas', 'Bebidas complementarias (café, té, etc.)', 1);

-- ============================================
-- FUNCIÓN HELPER para crear productos con variantes
-- ============================================
CREATE OR REPLACE FUNCTION crear_producto_con_variantes(
  p_nombre TEXT,
  p_descripcion TEXT,
  p_categoria TEXT,
  p_precio_mediano NUMERIC,
  p_precio_chico NUMERIC,
  p_precio_grande NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_cat_id INT;
  v_base_id INT;
BEGIN
  SELECT id INTO v_cat_id FROM categorias_productos WHERE nombre = p_categoria;
  
  -- Insertar producto base
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES (p_nombre, p_descripcion, v_cat_id, p_precio_mediano, 1, 1)
  RETURNING id INTO v_base_id;
  
  -- Insertar variantes
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    (p_nombre || ' Chico', p_descripcion, v_cat_id, p_precio_chico, 1, 1, v_base_id, 'Chico', 1),
    (p_nombre || ' Mediano', p_descripcion, v_cat_id, p_precio_mediano, 1, 1, v_base_id, 'Mediano', 2),
    (p_nombre || ' Grande', p_descripcion, v_cat_id, p_precio_grande, 1, 1, v_base_id, 'Grande', 3);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION crear_producto_simple(
  p_nombre TEXT,
  p_descripcion TEXT,
  p_categoria TEXT,
  p_precio NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_cat_id INT;
BEGIN
  SELECT id INTO v_cat_id FROM categorias_productos WHERE nombre = p_categoria;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES (p_nombre, p_descripcion, v_cat_id, p_precio, 1, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- JUGOS (Categoría 1) - 7 productos x 3 variantes = 28 total
-- ============================================
-- NOMBRES SIN "Jugo" - solo la fruta/verdura
SELECT crear_producto_con_variantes('Naranja', 'Jugo natural de naranja', 'Jugos', 40.00, 25.00, 65.00);
SELECT crear_producto_con_variantes('Toronja', 'Jugo natural de toronja', 'Jugos', 40.00, 25.00, 65.00);
SELECT crear_producto_con_variantes('Zanahoria', 'Jugo natural de zanahoria', 'Jugos', 30.00, 20.00, 50.00);
SELECT crear_producto_con_variantes('Mixto', 'Jugo mixto (naranja, zanahoria, betabel)', 'Jugos', 35.00, 22.00, 55.00);
SELECT crear_producto_con_variantes('Verde', 'Jugo verde de verduras y frutas (apio, perejil, nopal, espinaca, piña)', 'Jugos', 40.00, 25.00, 70.00);
SELECT crear_producto_con_variantes('Verde Especial', 'Jugo verde especial de verduras y frutas', 'Jugos', 50.00, 30.00, 90.00);
SELECT crear_producto_con_variantes('Mixto Betabel', 'Jugo mixto con betabel', 'Jugos', 45.00, 28.00, 80.00);

-- ============================================
-- LICUADOS Y CHOCOMILES (Categoría 2) - 11 productos x 3 variantes = 44 total
-- ============================================

-- Licuados (6 productos) - NOMBRES CON "Licuado de"
SELECT crear_producto_con_variantes('Licuado de Fresa', 'Licuado de fresa', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Licuado de Plátano', 'Licuado de plátano', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Licuado de Manzana', 'Licuado de manzana', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Licuado de Papaya', 'Licuado de papaya', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Licuado de Frutas', 'Licuado de frutas', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Licuado de Cereales', 'Licuado de cereales', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);

-- Chocomiles básicos (3 productos - precio mediano $25)
SELECT crear_producto_con_variantes('Chocomilk Chocolate', 'Chocomilk de chocolate', 'Licuados y Chocomiles', 25.00, 18.00, 40.00);
SELECT crear_producto_con_variantes('Chocomilk Fresa', 'Chocomilk de fresa', 'Licuados y Chocomiles', 25.00, 18.00, 40.00);
SELECT crear_producto_con_variantes('Chocomilk Vainilla', 'Chocomilk de vainilla', 'Licuados y Chocomiles', 25.00, 18.00, 40.00);

-- Chocomiles premium (2 productos - precio mediano $35)
SELECT crear_producto_con_variantes('Chocomilk Cafe', 'Chocomilk de café', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);
SELECT crear_producto_con_variantes('Chocomilk Fresa Natural', 'Chocomilk de fresa natural', 'Licuados y Chocomiles', 35.00, 25.00, 60.00);

-- ============================================
-- DESAYUNOS (Categoría 3) - 20 productos + 1 con variantes = 21 total
-- ============================================

-- Desayunos principales
SELECT crear_producto_simple('Chilaquiles', 'Orden de chilaquiles rojos acompañados de frijoles, huevo al gusto y bolillo', 'Desayunos', 65.00);
SELECT crear_producto_simple('Huevos al gusto', 'Orden de Huevos al gusto acompañados de frijoles y bolillo', 'Desayunos', 50.00);

-- Waffles con variantes Chico/Grande
DO $$
DECLARE
  v_cat_id INT;
  v_base_id INT;
BEGIN
  SELECT id INTO v_cat_id FROM categorias_productos WHERE nombre = 'Desayunos';
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu)
  VALUES ('Waffles', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', v_cat_id, 60.00, 1, 1)
  RETURNING id INTO v_base_id;
  
  INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante)
  VALUES 
    ('Waffles Chico', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', v_cat_id, 35.00, 1, 1, v_base_id, 'Chico', 1),
    ('Waffles Grande', 'Waffles con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', v_cat_id, 60.00, 1, 1, v_base_id, 'Grande', 2);
END $$;

-- Hot cakes y antojitos
SELECT crear_producto_simple('Mini Hot Cakes (15 pzs)', 'Mini hot cakes (15 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', 'Desayunos', 55.00);
SELECT crear_producto_simple('Mini Hot Cakes (10 pzs)', 'Mini hot cakes (10 piezas) con untado de mermelada, lechera, miel, nutella, fruta y cereal de tu elección', 'Desayunos', 45.00);

-- Burritas y Quesadillas (SEPARADOS)
SELECT crear_producto_simple('Burritas', 'Burritas acompañadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', 'Desayunos', 15.00);
SELECT crear_producto_simple('Quesadillas', 'Quesadillas acompañadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', 'Desayunos', 15.00);

-- Molletes
SELECT crear_producto_simple('Molletes Dulces', 'Molletes dulces con mantequilla, azúcar y canela', 'Desayunos', 30.00);
SELECT crear_producto_simple('Molletes con Untado', 'Molletes con untado de mermelada, nutella, lechera o miel', 'Desayunos', 35.00);
SELECT crear_producto_simple('Molletes Salados', 'Molletes salados con frijoles con queso o salsa mexicana', 'Desayunos', 40.00);

-- Lonches y sincronizadas (SEPARADOS)
SELECT crear_producto_simple('Lonches', 'Lonches con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', 'Desayunos', 35.00);
SELECT crear_producto_simple('Sincronizadas', 'Sincronizadas con crema, mayonesa, lechuga, jitomate, cebolla y chile jalapeño', 'Desayunos', 35.00);

-- Lonches individuales (SEPARADOS)
SELECT crear_producto_simple('Lonche de Pierna', 'Lonche de pierna', 'Desayunos', 65.00);
SELECT crear_producto_simple('Lonche Combinado', 'Lonche combinado', 'Desayunos', 65.00);
SELECT crear_producto_simple('Lonche de Jamón', 'Lonche de jamón', 'Desayunos', 45.00);
SELECT crear_producto_simple('Lonche de Panela', 'Lonche de panela', 'Desayunos', 55.00);
SELECT crear_producto_simple('Lonche de Jamón y Panela', 'Lonche de jamón y panela', 'Desayunos', 55.00);
SELECT crear_producto_simple('Lonche de Chilaquiles', 'Lonche de chilaquiles', 'Desayunos', 45.00);

-- Sandwiches individuales (SEPARADOS)
SELECT crear_producto_simple('Sandwich de Pierna', 'Sandwich de pierna', 'Desayunos', 55.00);
SELECT crear_producto_simple('Sandwich Combinado', 'Sandwich combinado', 'Desayunos', 55.00);
SELECT crear_producto_simple('Sandwich de Jamón', 'Sandwich de jamón', 'Desayunos', 35.00);
SELECT crear_producto_simple('Sandwich de Panela', 'Sandwich de panela', 'Desayunos', 45.00);
SELECT crear_producto_simple('Sandwich de Jamón y Panela', 'Sandwich de jamón y panela', 'Desayunos', 45.00);
SELECT crear_producto_simple('Sandwich de Chilaquiles', 'Sandwich de chilaquiles', 'Desayunos', 35.00);

-- ============================================
-- ADICIONALES (Categoría 4) - 8 productos
-- ============================================
SELECT crear_producto_simple('Miel', 'Miel', 'Adicionales', 5.00);
SELECT crear_producto_simple('Deslactosada', 'Leche deslactosada', 'Adicionales', 5.00);
SELECT crear_producto_simple('Cereal', 'Cereal', 'Adicionales', 5.00);
SELECT crear_producto_simple('Rompope', 'Rompope', 'Adicionales', 15.00);
SELECT crear_producto_simple('Jerez', 'Jerez', 'Adicionales', 15.00);
SELECT crear_producto_simple('Huevo Pata', 'Huevo de pata', 'Adicionales', 15.00);
SELECT crear_producto_simple('Huevo Gallina', 'Huevo de gallina', 'Adicionales', 5.00);
SELECT crear_producto_simple('Huevo Codorniz', 'Huevo de codorniz', 'Adicionales', 2.50);

-- ============================================
-- POSTRES (Categoría 5) - 6 productos
-- ============================================
SELECT crear_producto_simple('Bionicos', 'Bionicos', 'Postres', 55.00);
SELECT crear_producto_simple('Panecitos 3 pzs', 'Panecitos (3 piezas)', 'Postres', 10.00);
SELECT crear_producto_simple('Galletas Nuez o Avena', 'Galletas de nuez o avena', 'Postres', 10.00);
SELECT crear_producto_simple('Pay Queso', 'Pay de queso', 'Postres', 25.00);
SELECT crear_producto_simple('Mantecadas', 'Mantecadas', 'Postres', 25.00);
SELECT crear_producto_simple('Yakult', 'Yakult', 'Postres', 10.00);

-- ============================================
-- BEBIDAS (Categoría 6) - 2 productos
-- ============================================
SELECT crear_producto_simple('Cafe', 'Café', 'Bebidas', 20.00);
SELECT crear_producto_simple('Té', 'Té', 'Bebidas', 15.00);

-- Limpiar funciones temporales
DROP FUNCTION crear_producto_con_variantes;
DROP FUNCTION crear_producto_simple;

COMMIT;
