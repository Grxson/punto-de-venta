-- ==============================================
-- Script de datos iniciales para PostgreSQL (Railway)
-- Usa INSERT ON CONFLICT y WHERE NOT EXISTS para evitar duplicados
-- Compatible con PostgreSQL 9.5+
-- ==============================================

-- Insertar sucursal principal (verificar por nombre antes de insertar)
INSERT INTO sucursales (nombre, direccion, telefono, email, activo, created_at) 
SELECT 'Sucursal Principal', 'Calle Principal #123', '5551234567', 'principal@puntodeventa.com', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE nombre = 'Sucursal Principal');

-- Insertar roles (verificar por nombre antes de insertar)
-- Rol ADMIN
INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'ADMIN', 'Administrador del sistema', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');

-- Rol CAJERO
INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'CAJERO', 'Cajero de ventas', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');

-- Rol GERENTE
INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'GERENTE', 'Gerente de sucursal', 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'GERENTE');

-- Insertar usuario administrador (solo si no existe por username)
-- Password: admin123 (BCrypt hash)
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'Sistema', 'admin@puntodeventa.com', 1, 
       (SELECT id FROM roles WHERE nombre = 'ADMIN'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- Insertar usuario cajero de prueba (solo si no existe por username)
-- Password: cajero123
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'cajero', '$2a$10$xnV5lNmFqEOPKPWBwKQh.e1bP0NdCxJZd7kZ0fXqKzm5LJoF7lJXK', 'Juan', 'Pérez', 'cajero@puntodeventa.com', 1, 
       (SELECT id FROM roles WHERE nombre = 'CAJERO'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'cajero');

-- Insertar usuario gerente de prueba (solo si no existe por username)
-- Password: gerente123
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'gerente', '$2a$10$8cjz7Z3sRzpLq5hqHQKLKeF7J0LKQr1MJzF9vK5nZ4kL1qJ8mK2Li', 'María', 'González', 'gerente@puntodeventa.com', 1, 
       (SELECT id FROM roles WHERE nombre = 'GERENTE'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'gerente');
