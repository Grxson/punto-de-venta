-- ==============================================
-- Script de datos iniciales para desarrollo
-- ==============================================

-- Insertar sucursal principal
INSERT INTO sucursales (id, nombre, direccion, telefono, email, activo, created_at) 
VALUES (1, 'Sucursal Principal', 'Calle Principal #123', '5551234567', 'principal@puntodeventa.com', true, CURRENT_TIMESTAMP);

-- Insertar roles
INSERT INTO roles (id, nombre, descripcion, activo, created_at) 
VALUES (1, 'ADMIN', 'Administrador del sistema', true, CURRENT_TIMESTAMP);

INSERT INTO roles (id, nombre, descripcion, activo, created_at) 
VALUES (2, 'CAJERO', 'Cajero de ventas', true, CURRENT_TIMESTAMP);

INSERT INTO roles (id, nombre, descripcion, activo, created_at) 
VALUES (3, 'GERENTE', 'Gerente de sucursal', true, CURRENT_TIMESTAMP);

-- Insertar usuario administrador
-- Password: admin123 (BCrypt hash)
INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
VALUES (1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'Sistema', 'admin@puntodeventa.com', true, 1, 1, CURRENT_TIMESTAMP);

-- Insertar usuario cajero de prueba
-- Password: cajero123
INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
VALUES (2, 'cajero', '$2a$10$xnV5lNmFqEOPKPWBwKQh.e1bP0NdCxJZd7kZ0fXqKzm5LJoF7lJXK', 'Juan', 'Pérez', 'cajero@puntodeventa.com', true, 2, 1, CURRENT_TIMESTAMP);

-- Insertar usuario gerente de prueba  
-- Password: gerente123
INSERT INTO usuarios (id, username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
VALUES (3, 'gerente', '$2a$10$8cjz7Z3sRzpLq5hqHQKLKeF7J0LKQr1MJzF9vK5nZ4kL1qJ8mK2Li', 'María', 'González', 'gerente@puntodeventa.com', true, 3, 1, CURRENT_TIMESTAMP);
