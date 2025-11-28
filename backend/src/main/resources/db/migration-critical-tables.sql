-- ========================================
-- MIGRACIÓN CRÍTICA: Sucursales, Roles, Usuarios
-- ========================================
-- Ejecutar PRIMERO este script en Railway para permitir login
-- ========================================

-- 1. Sucursales
ALTER TABLE sucursales 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);

ALTER TABLE sucursales 
    ALTER COLUMN activo SET DEFAULT 1;

-- 2. Roles
ALTER TABLE roles 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);

ALTER TABLE roles 
    ALTER COLUMN activo SET DEFAULT 1;

-- 3. Usuarios
ALTER TABLE usuarios 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);

ALTER TABLE usuarios 
    ALTER COLUMN activo SET DEFAULT 1;

-- 4. Métodos de Pago (para operaciones básicas)
ALTER TABLE metodos_pago 
    ALTER COLUMN activo TYPE INTEGER USING (CASE WHEN activo THEN 1 ELSE 0 END);

ALTER TABLE metodos_pago 
    ALTER COLUMN activo SET DEFAULT 1;

ALTER TABLE metodos_pago 
    ALTER COLUMN requiere_referencia TYPE INTEGER USING (CASE WHEN requiere_referencia THEN 1 ELSE 0 END);

ALTER TABLE metodos_pago 
    ALTER COLUMN requiere_referencia SET DEFAULT 0;

-- ========================================
-- Ahora puedes ejecutar los INSERT de data-postgresql.sql
-- ========================================
