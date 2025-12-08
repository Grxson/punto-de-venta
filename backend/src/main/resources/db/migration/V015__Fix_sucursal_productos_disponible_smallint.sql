-- V015: Convertir columna disponible de BOOLEAN a SMALLINT en sucursal_productos
-- Razón: Hibernate espera INTEGER/SMALLINT, no BOOLEAN para compatibilidad con PostgreSQL
-- El error: "Schema-validation: wrong column type encountered in column [disponible] in table [sucursal_productos]; found [bool (Types#BIT)], but expecting [integer (Types#INTEGER)]"

-- Este script solo se ejecuta si la tabla existe (no se ejecuta en bases de datos nuevas)
-- Las bases de datos nuevas usarán directamente V016 que crea la tabla con SMALLINT

-- Convertir BOOLEAN a SMALLINT usando CASE WHEN (compatible con PostgreSQL)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'sucursal_productos'
    ) THEN
        -- Alternar el tipo de columna de BOOLEAN a SMALLINT
        -- CASE WHEN convierte true -> 1, false -> 0
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible TYPE SMALLINT USING CASE WHEN disponible THEN 1 ELSE 0 END;
        
        -- Restaurar NOT NULL
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible SET NOT NULL;
        
        -- Restaurar default a 1 (equivalente a true)
        ALTER TABLE sucursal_productos 
          ALTER COLUMN disponible SET DEFAULT 1;
    END IF;
END $$;

