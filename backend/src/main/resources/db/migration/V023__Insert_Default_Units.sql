-- Insertar unidades de medida predeterminadas
-- Se ejecuta una sola vez durante la migración

-- Limpiar unidades existentes (si es necesario)
TRUNCATE TABLE unidades RESTART IDENTITY CASCADE;

-- Insertar unidades estándar para ingredientes
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) VALUES
    ('Kilogramo', 'kg', 1.0, 'Unidad de peso - 1000 gramos'),
    ('Gramo', 'g', 0.001, 'Unidad de peso - 1/1000 kilogramo'),
    ('Litro', 'l', 1.0, 'Unidad de volumen - 1000 mililitros'),
    ('Mililitro', 'ml', 0.001, 'Unidad de volumen - 1/1000 litro'),
    ('Unidad', 'u', 1.0, 'Unidad individual'),
    ('Docena', 'dz', 12.0, 'Grupo de 12 unidades'),
    ('Metro', 'm', 1.0, 'Unidad de longitud'),
    ('Centímetro', 'cm', 0.01, 'Unidad de longitud - 1/100 metro'),
    ('Miligramo', 'mg', 0.000001, 'Unidad de peso - 1/1,000,000 kilogramo'),
    ('Tonelada', 'tn', 1000.0, 'Unidad de peso - 1000 kilogramos'),
    ('Onza', 'oz', 0.0283495, 'Unidad de peso - 28.3495 gramos'),
    ('Libra', 'lb', 0.453592, 'Unidad de peso - 453.592 gramos'),
    ('Taza', 'tz', 0.236588, 'Unidad de volumen - 236.588 mililitros'),
    ('Cucharada', 'cda', 0.014787, 'Unidad de volumen - 14.787 mililitros'),
    ('Cucharadita', 'cdita', 0.004929, 'Unidad de volumen - 4.929 mililitros'),
    ('Galón', 'gal', 3.78541, 'Unidad de volumen - 3785.41 mililitros'),
    ('Paquete', 'paq', 1.0, 'Paquete o caja'),
    ('Botella', 'bot', 1.0, 'Botella individual'),
    ('Lata', 'lat', 1.0, 'Lata individual'),
    ('Caja', 'caja', 1.0, 'Caja de producto');

-- Mostrar unidades insertadas
SELECT id, nombre, abreviatura FROM unidades ORDER BY id;
