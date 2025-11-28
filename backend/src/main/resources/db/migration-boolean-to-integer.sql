-- ========================================
-- MIGRACIÓN: Convertir columnas BOOLEAN a INTEGER
-- ========================================
-- Este script convierte todas las columnas 'activo' y booleanas
-- de tipo BOOLEAN a INTEGER para compatibilidad con el modelo Java
-- 
-- IMPORTANTE: Ejecutar MANUALMENTE en Railway PostgreSQL
-- NO ejecutar automáticamente - requiere revisión del esquema actual
-- ========================================

-- 1. Sucursales
ALTER TABLE sucursales 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE sucursales 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE sucursales 
    ALTER COLUMN activo SET DEFAULT 1;

-- 2. Roles
ALTER TABLE roles 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE roles 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE roles 
    ALTER COLUMN activo SET DEFAULT 1;

-- 3. Usuarios
ALTER TABLE usuarios 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE usuarios 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE usuarios 
    ALTER COLUMN activo SET DEFAULT 1;

-- 4. Métodos de Pago
ALTER TABLE metodos_pago 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE metodos_pago 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE metodos_pago 
    ALTER COLUMN activo SET DEFAULT 1;

ALTER TABLE metodos_pago 
    ALTER COLUMN requiere_referencia DROP DEFAULT;
ALTER TABLE metodos_pago 
    ALTER COLUMN requiere_referencia TYPE INTEGER USING (CASE WHEN requiere_referencia THEN 1 ELSE 0 END);
ALTER TABLE metodos_pago 
    ALTER COLUMN requiere_referencia SET DEFAULT 0;

-- 5. Ingredientes
ALTER TABLE ingredientes 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE ingredientes 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE ingredientes 
    ALTER COLUMN activo SET DEFAULT 1;

-- 6. Proveedores
ALTER TABLE proveedores 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE proveedores 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE proveedores 
    ALTER COLUMN activo SET DEFAULT 1;

-- 7. Categorías de Producto
ALTER TABLE categorias_producto 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE categorias_producto 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE categorias_producto 
    ALTER COLUMN activo SET DEFAULT 1;

-- 8. Productos
ALTER TABLE productos 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE productos 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE productos 
    ALTER COLUMN activo SET DEFAULT 1;

-- Nota: el nombre de la columna es 'disponible_en_menu' según la entidad Producto
ALTER TABLE productos 
    ALTER COLUMN disponible_en_menu DROP DEFAULT;
ALTER TABLE productos 
    ALTER COLUMN disponible_en_menu TYPE INTEGER USING (CASE WHEN disponible_en_menu THEN 1 ELSE 0 END);
ALTER TABLE productos 
    ALTER COLUMN disponible_en_menu SET DEFAULT 1;

-- 9. Categorías de Gasto
ALTER TABLE categorias_gasto 
    ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE categorias_gasto 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);
ALTER TABLE categorias_gasto 
    ALTER COLUMN activo SET DEFAULT 1;

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Ejecutar estas queries para verificar los cambios:
-- 
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name IN ('sucursales', 'roles', 'usuarios', 'metodos_pago', 'ingredientes', 'proveedores', 'categorias_producto', 'productos', 'categorias_gasto')
-- AND column_name IN ('activo', 'requiere_referencia', 'disponible')
-- ORDER BY table_name, column_name;
