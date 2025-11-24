-- Ensure 'activo' columns exist with defaults and not null constraints
-- This migration is idempotent thanks to IF NOT EXISTS and COALESCE updates

-- Roles
ALTER TABLE IF EXISTS roles
    ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

UPDATE roles SET activo = COALESCE(activo, true);

ALTER TABLE IF EXISTS roles
    ALTER COLUMN activo SET NOT NULL;

-- Sucursales
ALTER TABLE IF EXISTS sucursales
    ADD COLUMN IF NOT EXISTS activo boolean DEFAULT true;

UPDATE sucursales SET activo = COALESCE(activo, true);

ALTER TABLE IF EXISTS sucursales
    ALTER COLUMN activo SET NOT NULL;
