-- V018: Convertir TODAS las columnas BOOLEAN a SMALLINT para compatibilidad con Hibernate
-- Railway y otras bases de datos tienen conflictos de tipo entre BOOLEAN y INTEGER
-- Solución: usar SMALLINT (0 o 1) en lugar de BOOLEAN

-- 1. Tabla usuarios - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE usuarios ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE usuarios ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE usuarios ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 2. Tabla roles - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'roles' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE roles ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE roles ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE roles ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 3. Tabla ingredientes - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ingredientes' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE ingredientes ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE ingredientes ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE ingredientes ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 4. Tabla productos_atributos - convertir columna 'requerido'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos_atributos' AND column_name = 'requerido' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE productos_atributos ALTER COLUMN requerido TYPE SMALLINT USING CASE WHEN requerido THEN 1 ELSE 0 END;
        ALTER TABLE productos_atributos ALTER COLUMN requerido SET DEFAULT 0;
        ALTER TABLE productos_atributos ALTER COLUMN requerido SET NOT NULL;
    END IF;
END $$;

-- 5. Tabla productos_atributos - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos_atributos' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE productos_atributos ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE productos_atributos ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE productos_atributos ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 6. Tabla metodos_pago - convertir columna 'requiere_referencia'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'metodos_pago' AND column_name = 'requiere_referencia' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia TYPE SMALLINT USING CASE WHEN requiere_referencia THEN 1 ELSE 0 END;
        ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia SET DEFAULT 0;
        ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia SET NOT NULL;
    END IF;
END $$;

-- 7. Tabla metodos_pago - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'metodos_pago' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE metodos_pago ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE metodos_pago ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE metodos_pago ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 8. Tabla proveedores - convertir columna 'activo'
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE proveedores ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE proveedores ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE proveedores ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;

-- 9. Tabla sucursales - convertir columna 'activo' si existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'activo' 
        AND data_type IN ('boolean', 'bool')
    ) THEN
        ALTER TABLE sucursales ALTER COLUMN activo TYPE SMALLINT USING CASE WHEN activo THEN 1 ELSE 0 END;
        ALTER TABLE sucursales ALTER COLUMN activo SET DEFAULT 1;
        ALTER TABLE sucursales ALTER COLUMN activo SET NOT NULL;
    END IF;
END $$;
