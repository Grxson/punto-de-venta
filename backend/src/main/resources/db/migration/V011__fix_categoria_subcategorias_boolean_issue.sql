-- V010: Arreglar el problema de tipo BOOLEAN en Railway
-- Railway tiene la tabla con BOOLEAN, PostgreSQL no puede comparar boolean = integer
-- Solución: Eliminar y recrear la tabla con SMALLINT desde el inicio

-- Eliminar la tabla anterior (incluye los datos de prueba)
DROP TABLE IF EXISTS categoria_subcategorias CASCADE;

-- Recrear la tabla con SMALLINT desde el inicio
CREATE TABLE categoria_subcategorias (
    id BIGSERIAL PRIMARY KEY,
    categoria_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INTEGER DEFAULT 0,
    activa SMALLINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria_id, nombre),
    FOREIGN KEY (categoria_id) REFERENCES categorias_productos(id) ON DELETE CASCADE
);

-- Crear índices para consultas frecuentes
CREATE INDEX idx_subcategorias_categoria_id ON categoria_subcategorias(categoria_id);
CREATE INDEX idx_subcategorias_activa ON categoria_subcategorias(activa);

-- Reinsertar subcategorías de Desayunos con valores SMALLINT
INSERT INTO categoria_subcategorias (categoria_id, nombre, descripcion, orden, activa)
SELECT id, 'DULCES', 'Molletes, Waffles, Mini Hot-Cakes', 1, 1
FROM categorias_productos WHERE nombre = 'Desayunos'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

INSERT INTO categoria_subcategorias (categoria_id, nombre, descripcion, orden, activa)
SELECT id, 'LONCHES', 'Lonches, Sándwiches de Lonche', 2, 1
FROM categorias_productos WHERE nombre = 'Desayunos'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

INSERT INTO categoria_subcategorias (categoria_id, nombre, descripcion, orden, activa)
SELECT id, 'SANDWICHES', 'Sándwiches', 3, 1
FROM categorias_productos WHERE nombre = 'Desayunos'
ON CONFLICT (categoria_id, nombre) DO NOTHING;

INSERT INTO categoria_subcategorias (categoria_id, nombre, descripcion, orden, activa)
SELECT id, 'OTROS', 'Otros productos de desayuno', 4, 1
FROM categorias_productos WHERE nombre = 'Desayunos'
ON CONFLICT (categoria_id, nombre) DO NOTHING;
