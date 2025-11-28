-- Script para arreglar la columna 'activo' en tabla 'metodos_pago'
-- Problema: La columna es INTEGER (0/1), no BOOLEAN. La migración intenta hacer NOT NULL pero hay NULLs
-- Solución: 1) Actualizar NULLs a 1, 2) Setear default 1, 3) Hacer NOT NULL

-- 1. Actualizar todos los valores NULL a 1 (activo por defecto)
UPDATE metodos_pago SET activo = 1 WHERE activo IS NULL;

-- 2. Añadir default 1 a la columna (si no existe ya)
ALTER TABLE metodos_pago ALTER COLUMN activo SET DEFAULT 1;

-- 3. Ahora sí hacer la columna NOT NULL
ALTER TABLE metodos_pago ALTER COLUMN activo SET NOT NULL;

-- Verificar que la columna quedó correctamente
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'metodos_pago' AND column_name = 'activo';
