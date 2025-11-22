-- Script de inicialización para módulo de Inventario
-- Punto de Venta - Backend
-- Este script crea las unidades de medida básicas necesarias

-- ============================================
-- UNIDADES DE MEDIDA BASE
-- ============================================

-- Unidades de peso
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) VALUES
('Gramos', 'g', 1.0, 'Unidad base para peso'),
('Kilogramos', 'kg', 1000.0, 'Equivale a 1000 gramos'),
('Miligramos', 'mg', 0.001, 'Equivale a 0.001 gramos');

-- Unidades de volumen
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) VALUES
('Mililitros', 'ml', 1.0, 'Unidad base para volumen'),
('Litros', 'L', 1000.0, 'Equivale a 1000 mililitros'),
('Centilitros', 'cl', 10.0, 'Equivale a 10 mililitros');

-- Unidades de cantidad
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) VALUES
('Pieza', 'pza', 1.0, 'Unidad de conteo'),
('Docena', 'dz', 12.0, 'Equivale a 12 piezas');

-- Unidades de cucharadas/tazas (aproximaciones para recetas)
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) VALUES
('Cucharada', 'cdta', 15.0, 'Aproximadamente 15ml'),
('Cucharadita', 'cdita', 5.0, 'Aproximadamente 5ml'),
('Taza', 'tz', 240.0, 'Aproximadamente 240ml');

-- ============================================
-- PROVEEDORES DE EJEMPLO (OPCIONAL)
-- ============================================

INSERT INTO proveedores (nombre, contacto, telefono, email, activo) VALUES
('Proveedor General', 'Administrador', '0000000000', 'info@proveedor.com', true);

-- ============================================
-- CATEGORÍAS COMUNES DE INGREDIENTES
-- ============================================
-- Las categorías se crean dinámicamente al insertar ingredientes
-- Aquí algunos ejemplos de categorías que se pueden usar:
-- - Harinas
-- - Lácteos  
-- - Carnes y embutidos
-- - Frutas
-- - Verduras
-- - Especias y condimentos
-- - Aceites y grasas
-- - Azúcares y endulzantes
-- - Huevos
-- - Bebidas
-- - Desechables
-- - Otros

COMMIT;
