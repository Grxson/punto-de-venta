-- Restaurar categorías y subcategorías en sucursal 2
-- Copiar desde sucursal 1 si es necesario

-- Copiar categorías si no existen en sucursal 2
INSERT INTO categorias_productos (nombre, descripcion, activa, sucursal_id, created_at, updated_at)
SELECT cp1.nombre, cp1.descripcion, cp1.activa, 2, NOW(), NOW()
FROM categorias_productos cp1
WHERE cp1.sucursal_id = 1
  AND NOT EXISTS (
    SELECT 1 FROM categorias_productos cp2 
    WHERE cp2.nombre = cp1.nombre AND cp2.sucursal_id = 2
  )
ON CONFLICT (nombre, sucursal_id) DO NOTHING;

-- Copiar subcategorías si no existen en sucursal 2
INSERT INTO categoria_subcategorias (nombre, descripcion, orden, activa, categoria_id, sucursal_id, created_at, updated_at)
SELECT cs.nombre, cs.descripcion, cs.orden, cs.activa,
       (SELECT id FROM categorias_productos WHERE nombre = cp1.nombre AND sucursal_id = 2 LIMIT 1),
       2, NOW(), NOW()
FROM categoria_subcategorias cs
INNER JOIN categorias_productos cp1 ON cs.categoria_id = cp1.id
WHERE cp1.sucursal_id = 1
  AND NOT EXISTS (
    SELECT 1 FROM categoria_subcategorias cs2
    WHERE cs2.nombre = cs.nombre AND cs2.sucursal_id = 2
  )
ON CONFLICT DO NOTHING;

COMMIT;
