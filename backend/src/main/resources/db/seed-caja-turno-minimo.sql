-- Script para sembrar una caja y un turno activos mínimos en Railway
-- Ejecutar vía psql o el cliente de Railway una sola vez

BEGIN;

-- 1. Insertar una caja activa (si no existe)
INSERT INTO cajas (id, sucursal_id, nombre, activa, created_at, updated_at)
VALUES (1, 1, 'Caja Principal', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar un turno activo (si no existe)
-- Asume que existe al menos un usuario con id 1; si no, ajustar usuario_id_apertura
INSERT INTO turnos (id, sucursal_id, caja_id, usuario_id_apertura, fecha_apertura, activo, created_at, updated_at)
VALUES (1, 1, 1, 1, NOW(), true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Actualizar secuencias si los IDs fueron insertados manualmente
SELECT setval('cajas_id_seq', COALESCE((SELECT MAX(id) FROM cajas), 1), true);
SELECT setval('turnos_id_seq', COALESCE((SELECT MAX(id) FROM turnos), 1), true);

COMMIT;

-- Verificar inserción
SELECT 'Cajas insertadas:' AS info, COUNT(*) AS total FROM cajas;
SELECT 'Turnos insertados:' AS info, COUNT(*) AS total FROM turnos;
