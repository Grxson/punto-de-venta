-- Script para arreglar la columna 'activo' en tabla 'metodos_pago'
-- Problema: La migración intenta hacer la columna NOT NULL, pero hay registros con NULL
-- Solución: 1) Setear default, 2) Actualizar NULLs a true, 3) Hacer NOT NULL

-- 1. Actualizar todos los valores NULL a true (activo por defecto)
UPDATE metodos_pago SET activo = true WHERE activo IS NULL;

-- 2. Añadir default true a la columna (si no existe ya)
ALTER TABLE metodos_pago ALTER COLUMN activo SET DEFAULT true;

-- 3. Ahora sí hacer la columna NOT NULL
ALTER TABLE metodos_pago ALTER COLUMN activo SET NOT NULL;

-- Verificar que la columna quedó correctamente
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns 
-- WHERE table_name = 'metodos_pago' AND column_name = 'activo';
