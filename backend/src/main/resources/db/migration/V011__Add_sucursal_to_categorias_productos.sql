-- ✅ SEGREGACIÓN: Agregar relación de categorías con sucursales
-- Cada categoría de productos ahora pertenece a una sucursal específica

-- Paso 1: Si la columna sucursal_id no existe, agregarla
ALTER TABLE categorias_productos ADD COLUMN IF NOT EXISTS sucursal_id BIGINT;

-- Paso 2: Llenar la columna con la sucursal 1 (por defecto, para datos existentes)
UPDATE categorias_productos SET sucursal_id = COALESCE(sucursal_id, 1) WHERE sucursal_id IS NULL;

-- Paso 3: Hacer la columna obligatoria y agregar la clave foránea
ALTER TABLE categorias_productos ALTER COLUMN sucursal_id SET NOT NULL;

-- Paso 4: Agregar clave foránea si no existe
ALTER TABLE categorias_productos ADD CONSTRAINT IF NOT EXISTS fk_categoria_sucursal 
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id) ON DELETE CASCADE;

-- Paso 5: Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_categoria_sucursal ON categorias_productos(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_categoria_activa ON categorias_productos(activa);

-- Paso 6: Remover el constraint unique del nombre (si existe) y crear uno nuevo por (nombre, sucursal_id)
ALTER TABLE categorias_productos DROP CONSTRAINT IF EXISTS categorias_productos_nombre_key CASCADE;
ALTER TABLE categorias_productos DROP CONSTRAINT IF EXISTS uq_categoria_nombre_sucursal;
ALTER TABLE categorias_productos ADD CONSTRAINT uq_categoria_nombre_sucursal 
    UNIQUE (nombre, sucursal_id);

COMMIT;
