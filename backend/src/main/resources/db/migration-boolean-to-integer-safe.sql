-- Migración segura BOOLEAN -> INTEGER para columnas de flags
-- Esta migración es idempotente y funciona tanto si la columna está en BOOLEAN como si ya está en INTEGER.
-- Convierte valores ('t','true','1') a 1 y cualquier otro (incl. 'f','false','0' y NULL) a 0.

-- Sucursales.activo
BEGIN;
ALTER TABLE sucursales ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE sucursales ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE sucursales ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Roles.activo
BEGIN;
ALTER TABLE roles ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE roles ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE roles ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Usuarios.activo
BEGIN;
ALTER TABLE usuarios ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE usuarios ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE usuarios ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Metodos_pago.activo
BEGIN;
ALTER TABLE metodos_pago ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE metodos_pago ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE metodos_pago ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Metodos_pago.requiere_referencia
BEGIN;
ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia DROP DEFAULT;
ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia TYPE INTEGER
USING (
  CASE
    WHEN requiere_referencia::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE metodos_pago ALTER COLUMN requiere_referencia SET DEFAULT 0;
COMMIT;

-- Ingredientes.activo
BEGIN;
ALTER TABLE ingredientes ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE ingredientes ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE ingredientes ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Proveedores.activo
BEGIN;
ALTER TABLE proveedores ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE proveedores ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE proveedores ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Categorias_producto.activo
BEGIN;
ALTER TABLE categorias_producto ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE categorias_producto ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE categorias_producto ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Productos.activo
BEGIN;
ALTER TABLE productos ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE productos ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE productos ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Productos.disponible_en_menu
BEGIN;
ALTER TABLE productos ALTER COLUMN disponible_en_menu DROP DEFAULT;
ALTER TABLE productos ALTER COLUMN disponible_en_menu TYPE INTEGER
USING (
  CASE
    WHEN disponible_en_menu::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE productos ALTER COLUMN disponible_en_menu SET DEFAULT 1;
COMMIT;

-- Categorias_gasto.activo
BEGIN;
ALTER TABLE categorias_gasto ALTER COLUMN activo DROP DEFAULT;
ALTER TABLE categorias_gasto ALTER COLUMN activo TYPE INTEGER
USING (
  CASE
    WHEN activo::text IN ('t','true','1') THEN 1
    ELSE 0
  END
);
ALTER TABLE categorias_gasto ALTER COLUMN activo SET DEFAULT 1;
COMMIT;

-- Verificación rápida (opcional): ejecutar después con una consulta aparte sobre information_schema.
