-- V025__Add_Gasto_Link_To_Ingredientes.sql
-- Agregar campos para vincular ingredientes con gastos de materia prima

ALTER TABLE ingredientes ADD COLUMN gasto_id BIGINT;
ALTER TABLE ingredientes ADD COLUMN costo_total_gasto NUMERIC(14,6);
ALTER TABLE ingredientes ADD COLUMN unidad_gasto_id BIGINT;
ALTER TABLE ingredientes ADD COLUMN factor_conversion INTEGER DEFAULT 1;
ALTER TABLE ingredientes ADD COLUMN descripcion VARCHAR(500);

-- Agregar constraint de foreign key
ALTER TABLE ingredientes ADD CONSTRAINT fk_ingredientes_gasto_id 
  FOREIGN KEY (gasto_id) REFERENCES gastos(id) ON DELETE SET NULL;

ALTER TABLE ingredientes ADD CONSTRAINT fk_ingredientes_unidad_gasto_id 
  FOREIGN KEY (unidad_gasto_id) REFERENCES unidades(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por gasto
CREATE INDEX idx_ingredientes_gasto_id ON ingredientes(gasto_id);
