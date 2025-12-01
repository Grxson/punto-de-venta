-- H2 schema for local dev, mirroring core Railway tables needed for ventas/pagos

CREATE TABLE IF NOT EXISTS sucursales (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255),
  activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  permisos_json CLOB NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rol_id BIGINT NOT NULL,
  sucursal_id BIGINT,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (rol_id) REFERENCES roles(id),
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

CREATE TABLE IF NOT EXISTS cajas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id BIGINT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  activa BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
);

CREATE TABLE IF NOT EXISTS turnos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id BIGINT NOT NULL,
  caja_id BIGINT NOT NULL,
  usuario_id_apertura BIGINT NOT NULL,
  fecha_apertura TIMESTAMP NOT NULL,
  usuario_id_cierre BIGINT,
  fecha_cierre TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
  FOREIGN KEY (caja_id) REFERENCES cajas(id),
  FOREIGN KEY (usuario_id_apertura) REFERENCES usuarios(id),
  FOREIGN KEY (usuario_id_cierre) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS categorias_productos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion CLOB,
  categoria_id BIGINT,
  precio DECIMAL(12,2) NOT NULL,
  costo_estimado DECIMAL(12,4),
  sku VARCHAR(50),
  activo BOOLEAN DEFAULT TRUE,
  disponible_en_menu BOOLEAN DEFAULT TRUE,
  producto_base_id BIGINT,
  nombre_variante VARCHAR(255),
  orden_variante INTEGER,
  FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id),
  FOREIGN KEY (producto_base_id) REFERENCES productos(id)
);

-- metodos_pago: Railway uses integer flags; use BOOLEAN for H2 but allow 0/1 inserts
CREATE TABLE IF NOT EXISTS metodos_pago (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  requiere_referencia BOOLEAN DEFAULT FALSE,
  descripcion CLOB,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ventas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  sucursal_id BIGINT NOT NULL,
  caja_id BIGINT NOT NULL,
  turno_id BIGINT NOT NULL,
  fecha TIMESTAMP NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  impuestos DECIMAL(12,2) DEFAULT 0,
  descuento DECIMAL(12,2) DEFAULT 0,
  cliente_id BIGINT,
  canal VARCHAR(50),
  estado VARCHAR(20) NOT NULL,
  FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
  FOREIGN KEY (caja_id) REFERENCES cajas(id),
  FOREIGN KEY (turno_id) REFERENCES turnos(id)
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_sucursal_fecha ON ventas(sucursal_id, fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

CREATE TABLE IF NOT EXISTS ventas_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  venta_id BIGINT NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad DECIMAL(12,3) NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  costo_estimado DECIMAL(12,4),
  nota CLOB,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pagos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  venta_id BIGINT NOT NULL,
  metodo_pago_id BIGINT NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  referencia VARCHAR(255),
  fecha TIMESTAMP NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
);

CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);
