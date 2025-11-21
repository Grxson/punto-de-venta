-- ========================================
-- PUNTO DE VENTA - SCRIPT DE INICIALIZACIÓN
-- Versión: 1.0.0
-- Base de datos: PostgreSQL / H2
-- ========================================

-- ----------------------------------------
-- CATÁLOGOS: Sucursales y Operación
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS sucursales (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cajas (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cajas_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    permisos_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id BIGINT NOT NULL,
    sucursal_id BIGINT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id),
    CONSTRAINT fk_usuarios_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

CREATE TABLE IF NOT EXISTS turnos (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    caja_id BIGINT NOT NULL,
    usuario_id_apertura BIGINT NOT NULL,
    fecha_apertura TIMESTAMP NOT NULL,
    usuario_id_cierre BIGINT,
    fecha_cierre TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_turnos_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    CONSTRAINT fk_turnos_caja FOREIGN KEY (caja_id) REFERENCES cajas(id),
    CONSTRAINT fk_turnos_usuario_apertura FOREIGN KEY (usuario_id_apertura) REFERENCES usuarios(id),
    CONSTRAINT fk_turnos_usuario_cierre FOREIGN KEY (usuario_id_cierre) REFERENCES usuarios(id)
);

-- ----------------------------------------
-- CATÁLOGOS: Productos
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS categorias_productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    categoria_id BIGINT NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id)
);

-- ----------------------------------------
-- CATÁLOGOS: Métodos de Pago y Clientes
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS metodos_pago (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    requiere_referencia BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS descuentos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('porcentaje', 'monto')),
    valor DECIMAL(12,4) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    max_por_rol_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------
-- OPERACIONES: Ventas
-- ----------------------------------------

CREATE TABLE IF NOT EXISTS ventas (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    caja_id BIGINT NOT NULL,
    turno_id BIGINT NOT NULL,
    fecha TIMESTAMP NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    impuestos DECIMAL(12,2) DEFAULT 0,
    descuento DECIMAL(12,2) DEFAULT 0,
    cliente_id BIGINT,
    canal VARCHAR(50),
    estado VARCHAR(20) CHECK (estado IN ('abierta', 'cerrada', 'cancelada')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ventas_sucursal FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    CONSTRAINT fk_ventas_caja FOREIGN KEY (caja_id) REFERENCES cajas(id),
    CONSTRAINT fk_ventas_turno FOREIGN KEY (turno_id) REFERENCES turnos(id),
    CONSTRAINT fk_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS ventas_items (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad DECIMAL(12,3) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    costo_estimado DECIMAL(12,4),
    nota TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ventas_items_venta FOREIGN KEY (venta_id) REFERENCES ventas(id),
    CONSTRAINT fk_ventas_items_producto FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pagos (
    id BIGSERIAL PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    metodo_pago_id BIGINT NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    referencia VARCHAR(255),
    fecha TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pagos_venta FOREIGN KEY (venta_id) REFERENCES ventas(id),
    CONSTRAINT fk_pagos_metodo_pago FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
);

-- ----------------------------------------
-- ÍNDICES PARA OPTIMIZACIÓN
-- ----------------------------------------

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal_fecha ON ventas(sucursal_id, fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);
CREATE INDEX IF NOT EXISTS idx_ventas_items_venta ON ventas_items(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_items_producto ON ventas_items(producto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);
CREATE INDEX IF NOT EXISTS idx_turnos_activo ON turnos(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);

-- ----------------------------------------
-- DATOS INICIALES
-- ----------------------------------------

-- Roles por defecto
INSERT INTO roles (nombre, permisos_json) VALUES
('ADMIN', '{"all": true}'),
('CAJERO', '{"ventas": true, "caja": true}'),
('MESERO', '{"pedidos": true}'),
('COCINA', '{"pedidos": true, "inventario": true}'),
('SUPERVISOR', '{"ventas": true, "reportes": true, "caja": true}')
ON CONFLICT (nombre) DO NOTHING;

-- Métodos de pago
INSERT INTO metodos_pago (nombre, requiere_referencia) VALUES
('Efectivo', FALSE),
('Tarjeta', TRUE),
('Transferencia', TRUE),
('Wallet Digital', TRUE)
ON CONFLICT (nombre) DO NOTHING;

-- Sucursal principal
INSERT INTO sucursales (nombre, direccion, activa) VALUES
('Sucursal Principal', 'Dirección ejemplo', TRUE)
ON CONFLICT DO NOTHING;

-- Categorías de productos ejemplo
INSERT INTO categorias_productos (nombre) VALUES
('Desayunos'),
('Jugos'),
('Licuados'),
('Comidas'),
('Postres'),
('Extras'),
('Bebidas'),
('Especiales')
ON CONFLICT (nombre) DO NOTHING;

COMMIT;
