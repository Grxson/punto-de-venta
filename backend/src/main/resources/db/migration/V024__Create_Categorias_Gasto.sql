-- V022__Create_Categorias_Gasto.sql
-- Crear tabla para Categorías de Gastos con segregación por sucursal

CREATE TABLE IF NOT EXISTS categorias_gasto (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    presupuesto_mensual NUMERIC(12,2),
    activo SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cat_gasto_nombre_sucursal UNIQUE(sucursal_id, nombre)
);

-- Índices para categorias_gasto
CREATE INDEX idx_categorias_gasto_sucursal ON categorias_gasto(sucursal_id);
CREATE INDEX idx_categorias_gasto_activo ON categorias_gasto(activo);
CREATE INDEX idx_categorias_gasto_nombre ON categorias_gasto(nombre);

-- Insertar categorías de gasto por defecto para cada sucursal existente
INSERT INTO categorias_gasto (sucursal_id, nombre, descripcion, activo)
SELECT s.id, cat.nombre, cat.descripcion, 1
FROM sucursales s
CROSS JOIN (
    VALUES 
        ('Insumos', 'Ingredientes y materiales para producción'),
        ('Servicios', 'Servicios público (luz, agua, internet)'),
        ('Renta', 'Renta o alquiler del local'),
        ('Mantenimiento', 'Mantenimiento y reparaciones'),
        ('Nómina', 'Salarios y sueldos del personal'),
        ('Suministros', 'Suministros de oficina y operación'),
        ('Transporte', 'Gastos de transporte y combustible'),
        ('Publicidad', 'Gastos de publicidad y marketing'),
        ('Otros', 'Otros gastos misceláneos')
) AS cat(nombre, descripcion)
WHERE s.activo = 1
ON CONFLICT (sucursal_id, nombre) DO NOTHING;
