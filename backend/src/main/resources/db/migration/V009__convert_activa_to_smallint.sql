-- V009: Convertir columna activa de BOOLEAN a SMALLINT para compatibilidad con Hibernate
-- Railway ya tiene la tabla con BOOLEAN, necesitamos convertirla a SMALLINT

-- Primero verificar si la columna existe y es BOOLEAN
-- Si es así, convertirla a SMALLINT con la conversión apropiada
ALTER TABLE categoria_subcategorias 
  ALTER COLUMN activa TYPE SMALLINT USING CASE WHEN activa THEN 1 ELSE 0 END;

-- Restaurar el constraint NOT NULL
ALTER TABLE categoria_subcategorias 
  ALTER COLUMN activa SET NOT NULL;

-- Restaurar el default a 1 (equivalente a true)
ALTER TABLE categoria_subcategorias 
  ALTER COLUMN activa SET DEFAULT 1;
