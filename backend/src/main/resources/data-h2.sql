-- Minimal seed data for H2 dev

-- Sucursal
INSERT INTO sucursales (id, nombre, direccion, activa) VALUES (1, 'Sucursal Principal', 'Centro', TRUE);

-- Roles
INSERT INTO roles (id, nombre, permisos_json) VALUES (1, 'admin', '{"all":true}');

-- Usuarios
INSERT INTO usuarios (id, nombre, rol_id, sucursal_id, activo) VALUES (1, 'Admin', 1, 1, TRUE);

-- Cajas
INSERT INTO cajas (id, sucursal_id, nombre, activa) VALUES (1, 1, 'Caja 1', TRUE);

-- Turno activo
INSERT INTO turnos (id, sucursal_id, caja_id, usuario_id_apertura, fecha_apertura, activo) VALUES (1, 1, 1, 1, CURRENT_TIMESTAMP, TRUE);

-- Categorías y Productos mínimos
INSERT INTO categorias_productos (id, nombre) VALUES (1, 'General');
INSERT INTO productos (id, nombre, categoria_id, precio, activo) VALUES (1, 'Producto Demo', 1, 50.00, TRUE);

-- Métodos de pago: efectivo, transferencia, tarjeta
INSERT INTO metodos_pago (id, nombre, requiere_referencia, activo) VALUES (1, 'Efectivo', FALSE, TRUE);
INSERT INTO metodos_pago (id, nombre, requiere_referencia, activo) VALUES (2, 'Transferencia', TRUE, TRUE);
INSERT INTO metodos_pago (id, nombre, requiere_referencia, activo) VALUES (3, 'Tarjeta', TRUE, TRUE);
