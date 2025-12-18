-- ✅ SEGREGACIÓN: Agregar relación de subcategorías con sucursales
-- Cada subcategoría ahora pertenece a una sucursal específica

-- Paso 1: Si la columna sucursal_id no existe, agregarla
ALTER TABLE categoria_subcategorias ADD COLUMN IF NOT EXISTS sucursal_id BIGINT;

-- Paso 2: Llenar con sucursal_id de la categoría relacionada
UPDATE categoria_subcategorias cs 
SET sucursal_id = COALESCE(sucursal_id, (SELECT sucursal_id FROM categorias_productos cp WHERE cp.id = cs.categoria_id LIMIT 1))
WHERE sucursal_id IS NULL;

-- Paso 3: Hacer la columna NOT NULL
ALTER TABLE categoria_subcategorias ALTER COLUMN sucursal_id SET NOT NULL;

-- Paso 4: Agregar clave foránea si no existe
ALTER TABLE categoria_subcategorias ADD CONSTRAINT IF NOT EXISTS fk_subcategoria_sucursal 
FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE;

-- Paso 5: Crear índices
CREATE INDEX IF NOT EXISTS idx_subcategoria_sucursal ON categoria_subcategorias(sucursal_id);

COMMIT;
