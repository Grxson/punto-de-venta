-- SCRIPT MANUAL PARA ARREGLAR EL ERROR EN PRODUCCIÓN
-- Ejecutar esto directamente en la base de datos de PostgreSQL
-- Este script convierte la columna 'disponible' de BOOLEAN a SMALLINT

-- Paso 1: Verificar si la tabla existe
-- SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sucursal_productos');

-- Paso 2: PRIMERO remover el default actual (importante para evitar errores de casting)
ALTER TABLE sucursal_productos ALTER COLUMN disponible DROP DEFAULT;

-- Paso 3: Convertir la columna de BOOLEAN a SMALLINT
-- IMPORTANTE: Este comando modifica la tabla. Hacer backup antes si es necesario.
ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible TYPE SMALLINT USING CASE WHEN disponible THEN 1 ELSE 0 END;

-- Paso 4: Restaurar el constraint NOT NULL
ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible SET NOT NULL;

-- Paso 5: Restaurar el default value a 1
ALTER TABLE sucursal_productos 
  ALTER COLUMN disponible SET DEFAULT 1;

-- Paso 6: Verificar que los cambios se aplicaron correctamente
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'sucursal_productos' AND column_name = 'disponible';

-- Resultado esperado:
-- column_name | data_type | is_nullable | column_default
-- disponible  | smallint  | NO          | 1

-- Una vez ejecutado este script, el servidor debería iniciar sin errores
-- Si aún hay errores, verificar que:
-- 1. La tabla sucursal_productos existe
-- 2. La columna disponible está ahora como SMALLINT
-- 3. Todos los valores son 0 o 1 (no NULL)
