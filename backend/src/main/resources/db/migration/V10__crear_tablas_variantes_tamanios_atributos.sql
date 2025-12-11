-- Migración V10: Crear tablas para variantes multi-paso con tamaños y atributos
-- Fecha: 2025-12-10

-- ============================================================
-- Tabla: producto_tamaño
-- Descripción: Define los tamaños disponibles para productos
-- ============================================================
CREATE TABLE IF NOT EXISTS producto_tamaño (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_extra DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_producto_tamaño_nombre ON producto_tamaño(nombre) WHERE activo = TRUE;

-- ============================================================
-- Tabla: producto_variante_tamaño
-- Descripción: Relación M-M entre variantes y tamaños
-- ============================================================
CREATE TABLE IF NOT EXISTS producto_variante_tamaño (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tamaño_id BIGINT NOT NULL REFERENCES producto_tamaño(id) ON DELETE CASCADE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, tamaño_id)
);

CREATE INDEX IF NOT EXISTS idx_producto_variante_tamaño_producto ON producto_variante_tamaño(producto_id);
CREATE INDEX IF NOT EXISTS idx_producto_variante_tamaño_tamaño ON producto_variante_tamaño(tamaño_id);

-- ============================================================
-- Tabla: producto_atributo
-- Descripción: Define atributos de un producto (ej: Ingrediente, Salsa, Complemento)
-- ============================================================
CREATE TABLE IF NOT EXISTS producto_atributo (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('SIMPLE', 'MULTIPLE')),
    requerido BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_producto_atributo_producto ON producto_atributo(producto_id);

-- ============================================================
-- Tabla: producto_atributo_opcion
-- Descripción: Opciones disponibles para cada atributo
-- ============================================================
CREATE TABLE IF NOT EXISTS producto_atributo_opcion (
    id BIGSERIAL PRIMARY KEY,
    atributo_id BIGINT NOT NULL REFERENCES producto_atributo(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    precio_extra DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_producto_atributo_opcion_atributo ON producto_atributo_opcion(atributo_id);

-- ============================================================
-- Tabla: venta_item_atributo_seleccionado
-- Descripción: Guarda las selecciones de atributos en una venta
-- ============================================================
CREATE TABLE IF NOT EXISTS venta_item_atributo_seleccionado (
    id BIGSERIAL PRIMARY KEY,
    venta_item_id BIGINT NOT NULL REFERENCES ventas_items(id) ON DELETE CASCADE,
    atributo_id BIGINT REFERENCES producto_atributo(id) ON DELETE SET NULL,
    opcion_id BIGINT REFERENCES producto_atributo_opcion(id) ON DELETE SET NULL,
    valor_seleccionado VARCHAR(255),
    precio_extra DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_venta_item_atributo_seleccionado_venta_item ON venta_item_atributo_seleccionado(venta_item_id);
CREATE INDEX IF NOT EXISTS idx_venta_item_atributo_seleccionado_atributo ON venta_item_atributo_seleccionado(atributo_id);

-- ============================================================
-- Ampliación de tabla: ventas_items
-- Agregar campos para tamaño seleccionado
-- ============================================================
ALTER TABLE ventas_items
    ADD COLUMN IF NOT EXISTS tamaño_id BIGINT REFERENCES producto_tamaño(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS tamaño_nombre VARCHAR(100),
    ADD COLUMN IF NOT EXISTS precio_extra_tamaño DECIMAL(12, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ventas_items_tamaño ON ventas_items(tamaño_id);

-- ============================================================
-- Comentarios para documentación
-- ============================================================
COMMENT ON TABLE producto_tamaño IS 'Catálogo de tamaños reutilizables (Pequeño, Mediano, Grande)';
COMMENT ON TABLE producto_variante_tamaño IS 'Relación entre variantes de producto y tamaños disponibles';
COMMENT ON TABLE producto_atributo IS 'Atributos de un producto (Ingrediente, Salsa, etc.)';
COMMENT ON TABLE producto_atributo_opcion IS 'Opciones disponibles para cada atributo';
COMMENT ON TABLE venta_item_atributo_seleccionado IS 'Registro de atributos seleccionados en una venta';
