-- Crear tabla de relaciones categoria-subcategorías
-- Permite que una categoría tenga múltiples subcategorías
CREATE TABLE IF NOT EXISTS categoria_subcategorias (
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

-- Insertar subcategorías de Desayunos
-- Primero obtener el ID de la categoría Desayunos
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
