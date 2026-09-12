-- V1.0.2: Stock actual en ingredientes + optimistic locking (@Version)
-- Auditoría 2026-09-11 (T0.2, T0.6)

-- 1. Stock actual (unidad base) en ingredientes, inicializado desde historial de movimientos
ALTER TABLE ingredientes ADD COLUMN IF NOT EXISTS stock_actual NUMERIC(14,6) NOT NULL DEFAULT 0;

-- Si existen movimientos previos ENTRADA/EGRESO en la unidad base, calcular saldo inicial.
-- Ingredientes sin movimientos quedan en 0 (sistema nunca trackeó inventario para ellos).
UPDATE ingredientes i
SET stock_actual = COALESCE((
    SELECT SUM(CASE WHEN m.tipo = 'ENTRADA' THEN m.cantidad ELSE -m.cantidad END)
    FROM inventario_movimientos m
    WHERE m.ingrediente_id = i.id
      AND m.tipo IN ('ENTRADA', 'EGRESO')
      AND m.unidad_id = i.unidad_base_id
), 0);

-- 2. Columnas version para optimistic locking (evitar lost updates)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE ingredientes ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE ventas_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE compra_items ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;