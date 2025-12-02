-- Agregar columna tipo_gasto a la tabla gastos
-- Valores: 'Operacional' (por defecto) o 'Administrativo'

ALTER TABLE gastos 
ADD COLUMN tipo_gasto VARCHAR(50) DEFAULT 'Operacional' NOT NULL;

-- Crear índice para búsquedas por tipo de gasto
CREATE INDEX idx_gasto_tipo ON gastos(tipo_gasto);

-- Comentario
COMMENT ON COLUMN gastos.tipo_gasto IS 'Tipo de gasto: Operacional (aparece en resumen del día) o Administrativo (no se incluye en resumen)';
