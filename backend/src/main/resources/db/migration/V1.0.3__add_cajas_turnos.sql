-- V1.0.3: Crear tablas cajas y turnos (Auditoría 2026-09-11, A5/T1.4)
-- Elimina el SQL nativo con fallback silencioso de VentaService.

CREATE TABLE IF NOT EXISTS cajas (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id),
    nombre VARCHAR(100) NOT NULL DEFAULT 'Caja principal',
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_cajas_sucursal_activa ON cajas (sucursal_id, activa);

CREATE TABLE IF NOT EXISTS turnos (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id),
    caja_id BIGINT NOT NULL REFERENCES cajas(id),
    usuario_id_apertura BIGINT REFERENCES usuarios(id),
    fecha_apertura TIMESTAMPTZ NOT NULL DEFAULT now(),
    usuario_id_cierre BIGINT REFERENCES usuarios(id),
    fecha_cierre TIMESTAMPTZ,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_turnos_caja_activo ON turnos (caja_id, activo);
CREATE INDEX IF NOT EXISTS idx_turnos_sucursal_activo ON turnos (sucursal_id, activo);

-- Seed: caja id=1 (compatibilidad con ventas históricas que usan fallback cajaId=1)
INSERT INTO cajas (id, sucursal_id, nombre, activa)
SELECT 1, id, 'Caja principal', TRUE FROM sucursales ORDER BY id LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Seed: un turno activo por caja (las ventas exigen turno_id NOT NULL)
INSERT INTO turnos (sucursal_id, caja_id, usuario_id_apertura, fecha_apertura, activo)
SELECT c.sucursal_id, c.id, NULL, now(), TRUE
FROM cajas c
WHERE NOT EXISTS (SELECT 1 FROM turnos t WHERE t.caja_id = c.id AND t.activo);

-- Ajustar secuencias tras inserts con id explícito
SELECT setval(pg_get_serial_sequence('cajas', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM cajas), 1));
SELECT setval(pg_get_serial_sequence('turnos', 'id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM turnos), 1));