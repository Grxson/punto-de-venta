-- V015: Convertir columna disponible de BOOLEAN a INTEGER en sucursal_productos
-- Razón: Hibernate espera INTEGER (int4), no BOOLEAN para compatibilidad con PostgreSQL
-- El error: "Schema-validation: wrong column type encountered in column [disponible] in table [sucursal_productos]; found [bool (Types#BIT)], but expecting [integer (Types#INTEGER)]"

-- Este script solo se ejecuta si la tabla existe (no se ejecuta en bases de datos nuevas)
-- Las bases de datos nuevas usarán directamente V016 que crea la tabla con INTEGER

-- Convertir BOOLEAN a INTEGER usando CASE WHEN (compatible con PostgreSQL)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sucursal_productos'
    ) THEN
        -- Primero remover el default actual (importante para evitar errores de casting)
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible DROP DEFAULT;
        
        -- Alternar el tipo de columna de BOOLEAN a INTEGER
        -- CASE WHEN convierte true -> 1, false -> 0
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible TYPE INTEGER USING CASE WHEN disponible THEN 1 ELSE 0 END;
        
        -- Restaurar NOT NULL
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible SET NOT NULL;
        
        -- Restaurar default a 1 (equivalente a true)
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible SET DEFAULT 1;
    END IF;
END $$;

