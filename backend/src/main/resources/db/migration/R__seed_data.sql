-- ==============================================
-- Seed de datos iniciales (ambos entornos)
-- Idempotente: usa INSERT ... SELECT ... WHERE NOT EXISTS
-- Gestionado por Flyway como migración repetible (R__*)
-- ==============================================

-- Sucursal principal
INSERT INTO sucursales (nombre, direccion, telefono, email, activo, created_at)
SELECT 'Sucursal Principal', 'Calle Principal #123', '5551234567', 'principal@puntodeventa.com', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE nombre = 'Sucursal Principal');

-- Roles
INSERT INTO roles (nombre, descripcion, activo, created_at)
SELECT 'ADMIN', 'Administrador del sistema', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');

INSERT INTO roles (nombre, descripcion, activo, created_at)
SELECT 'CAJERO', 'Cajero de ventas', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');

INSERT INTO roles (nombre, descripcion, activo, created_at)
SELECT 'GERENTE', 'Gerente de sucursal', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'GERENTE');

-- Usuarios (passwords en BCrypt)
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at)
SELECT 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador', 'Sistema', 'admin@puntodeventa.com', true,
       (SELECT id FROM roles WHERE nombre = 'ADMIN'),
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'),
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at)
SELECT 'cajero', '$2a$10$xnV5lNmFqEOPKPWBwKQh.e1bP0NdCxJZd7kZ0fXqKzm5LJoF7lJXK', 'Juan', 'Pérez', 'cajero@puntodeventa.com', true,
       (SELECT id FROM roles WHERE nombre = 'CAJERO'),
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'),
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'cajero');

INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at)
SELECT 'gerente', '$2a$10$8cjz7Z3sRzpLq5hqHQKLKeF7J0LKQr1MJzF9vK5nZ4kL1qJ8mK2Li', 'María', 'González', 'gerente@puntodeventa.com', true,
       (SELECT id FROM roles WHERE nombre = 'GERENTE'),
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'),
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'gerente');
