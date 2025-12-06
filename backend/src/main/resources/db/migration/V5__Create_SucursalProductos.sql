-- Migration: Crear tabla sucursal_productos para multi-sucursal
-- Fecha: 2025-12-06
-- Descripción: Tabla intermedia para definir qué productos están disponibles en cada sucursal

-- Crear tabla sucursal_productos
CREATE TABLE IF NOT EXISTS sucursal_productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    precio_sucursal DECIMAL(12, 2),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    orden_visualizacion INT,
    stock_maximo INT,
    horario_disponibilidad TEXT,
    dias_disponibilidad TEXT,
    notas VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY uk_sucursal_producto (sucursal_id, producto_id),
    FOREIGN KEY fk_sucursal_producto_sucursal (sucursal_id) 
        REFERENCES sucursales(id) ON DELETE CASCADE,
    FOREIGN KEY fk_sucursal_producto_producto (producto_id) 
        REFERENCES productos(id) ON DELETE CASCADE,
    
    -- Índices
    INDEX idx_sucursal_producto_sucursal (sucursal_id),
    INDEX idx_sucursal_producto_producto (producto_id),
    INDEX idx_sucursal_producto_disponible (disponible),
    INDEX idx_sucursal_producto_orden (orden_visualizacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inicializar datos: Asignar todos los productos activos a todas las sucursales activas
-- Esto crea la relación many-to-many base
INSERT INTO sucursal_productos (sucursal_id, producto_id, disponible, orden_visualizacion, created_at, updated_at)
SELECT s.id, p.id, 1, 0, NOW(), NOW()
FROM sucursales s
CROSS JOIN productos p
WHERE s.activo = 1 
  AND p.activo = 1
  AND NOT EXISTS (
    SELECT 1 FROM sucursal_productos sp 
    WHERE sp.sucursal_id = s.id AND sp.producto_id = p.id
  );

-- Comentarios sobre la estructura
-- 
-- Estructura:
-- - precio_sucursal: Permite precios diferentes por sucursal (NULL = usa precio del producto)
-- - disponible: Booleano para desactivar un producto en una sucursal sin eliminarlo
-- - orden_visualizacion: Ordena el menú de cada sucursal independientemente
-- - stock_maximo: Límite de existencias por sucursal (NULL = sin límite)
-- - horario_disponibilidad: JSON {"inicio": "06:00", "fin": "12:00"} para productos con horarios específicos
-- - dias_disponibilidad: JSON {"dias": [1,2,3,4,5]} para jugos (L-S) y alitas (V-D)
--                       1=lunes, 2=martes, ..., 7=domingo
--
-- Uso:
-- 1. Jugos disponibles L-S mañana:
--    INSERT INTO sucursal_productos VALUES (..., dias=[1,2,3,4,5,6], horario={inicio:"06:00", fin:"12:00"})
--
-- 2. Alitas disponibles V-D noche:
--    INSERT INTO sucursal_productos VALUES (..., dias=[5,6,7], horario={inicio:"18:00", fin:"23:59"})
--
-- 3. Producto con precio diferente en sucursal 2:
--    UPDATE sucursal_productos SET precio_sucursal=15.50 
--    WHERE sucursal_id=2 AND producto_id=5
--
-- 4. Deshabilitar producto en sucursal 1:
--    UPDATE sucursal_productos SET disponible=0 
--    WHERE sucursal_id=1 AND producto_id=3
