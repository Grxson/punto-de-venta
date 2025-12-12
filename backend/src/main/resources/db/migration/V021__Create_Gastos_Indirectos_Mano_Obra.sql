-- V021__Create_Gastos_Indirectos_Mano_Obra.sql
-- Crear tablas para Gastos Indirectos y Mano de Obra

-- Tabla para Gastos Indirectos (servicios, renta, mantenimiento, etc.)
CREATE TABLE IF NOT EXISTS gastos_indirectos (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    monto_mensual NUMERIC(12,2),
    monto_semanal NUMERIC(12,2),
    monto_diario NUMERIC(12,2),
    activo SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para gastos_indirectos
CREATE INDEX idx_gastos_indirectos_sucursal ON gastos_indirectos(sucursal_id);
CREATE INDEX idx_gastos_indirectos_activo ON gastos_indirectos(activo);

-- Tabla para Mano de Obra (sueldos, salarios, pagos por turno, etc.)
CREATE TABLE IF NOT EXISTS mano_obra (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    puesto VARCHAR(100) NOT NULL,
    salario_mensual NUMERIC(12,2),
    pago_por_turno NUMERIC(12,2),
    periodo VARCHAR(20),
    activo SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mano_obra
CREATE INDEX idx_mano_obra_sucursal ON mano_obra(sucursal_id);
CREATE INDEX idx_mano_obra_usuario ON mano_obra(usuario_id);
CREATE INDEX idx_mano_obra_activo ON mano_obra(activo);
