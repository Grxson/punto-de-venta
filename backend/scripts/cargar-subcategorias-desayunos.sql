-- ============================================================================
-- SCRIPT: Carga de Subcategorías de Desayunos
-- ============================================================================
-- Descarga de todas las subcategorías de la categoría "DESAYUNOS" según la UI
-- Fecha: 5 de diciembre de 2025
-- Base de datos: Railway PostgreSQL
--
-- DATOS A CARGAR:
-- Categoría: DESAYUNOS
--   ├─ DULCES (orden: 1)
--   ├─ LONCHES (orden: 2)
--   ├─ SANDWICHES (orden: 3)
--   └─ PLATOS PRINCIPALES (orden: 4)
--
-- Nota: Este script está diseñado para ser ejecutado contra Railway
-- ============================================================================

-- VERIFICAR SI LA CATEGORÍA "DESAYUNOS" EXISTE
SELECT id, nombre FROM categorias_productos WHERE nombre = 'Desayunos';

-- INSERTAR SUBCATEGORÍAS DE DESAYUNOS
-- (DESAYUNOS tiene ID = 57)

INSERT INTO categoria_subcategorias (categoria_id, nombre, descripcion, orden, activa)
VALUES 
    (57, 'DULCES', 'Postres, pasteles, galletas y alimentos dulces para desayuno', 1, 1),
    (57, 'LONCHES', 'Desayunos ligeros y refrigerios para media mañana', 2, 1),
    (57, 'SANDWICHES', 'Sándwiches y bocadillos para desayuno', 3, 1),
    (57, 'PLATOS PRINCIPALES', 'Platos principales y desayunos completos', 4, 1)
ON CONFLICT DO NOTHING;

-- VERIFICAR LA INSERCIÓN
SELECT id, nombre, orden, activa 
FROM categoria_subcategorias 
WHERE categoria_id = 57 
ORDER BY orden ASC;

-- RESULTADO ESPERADO:
-- id | nombre              | orden | activa
-- ---+---------------------+-------+--------
--  1 | DULCES              |     1 |      1
--  2 | LONCHES             |     2 |      1
--  3 | SANDWICHES          |     3 |      1
--  4 | PLATOS PRINCIPALES  |     4 |      1
