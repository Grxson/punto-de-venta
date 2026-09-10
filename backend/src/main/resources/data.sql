-- ==============================================
-- Script de datos iniciales para desarrollo
-- Usa INSERT con ON CONFLICT para evitar duplicados
-- No especifica IDs para permitir auto-increment correcto
-- ==============================================

-- Insertar sucursal principal (solo si no existe por nombre)
INSERT INTO sucursales (nombre, direccion, telefono, email, activo, created_at) 
SELECT 'Sucursal Principal', 'Calle Principal #123', '5551234567', 'principal@puntodeventa.com', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE nombre = 'Sucursal Principal');

-- Insertar roles (solo si no existen por nombre)
INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'ADMIN', 'Administrador del sistema', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN');

INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'CAJERO', 'Cajero de ventas', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'CAJERO');

INSERT INTO roles (nombre, descripcion, activo, created_at) 
SELECT 'GERENTE', 'Gerente de sucursal', true, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'GERENTE');

-- Insertar usuario administrador (reset por si ya existe con hash previo)
DELETE FROM usuarios WHERE username = 'admin';
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'admin', '$2b$10$M03236a.DlrNxiTCnw88wOAJxzyOGD24vp.ReYe5F7tVlTLNozs5S', 'Administrador', 'Sistema', 'admin@puntodeventa.com', true, 
       (SELECT id FROM roles WHERE nombre = 'ADMIN'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'admin');

-- Insertar usuario cajero de prueba (reset por si ya existe con hash previo)
DELETE FROM usuarios WHERE username = 'cajero';
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'cajero', '$2b$10$cuy/5eecn0bppS06YQ/xFuW0tgSZaGgrXVh7KFobxMGtgdqVFaGtq', 'Juan', 'Pérez', 'cajero@puntodeventa.com', true, 
       (SELECT id FROM roles WHERE nombre = 'CAJERO'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'cajero');

-- Insertar usuario gerente de prueba (reset por si ya existe con hash previo)
DELETE FROM usuarios WHERE username = 'gerente';
INSERT INTO usuarios (username, password, nombre, apellido, email, activo, rol_id, sucursal_id, created_at) 
SELECT 'gerente', '$2b$10$0HJCsTqJjp33o7X76IO1tO4Vaeifah1XFXw24Y010zLwDrUpmUL8i', 'María', 'González', 'gerente@puntodeventa.com', true, 
       (SELECT id FROM roles WHERE nombre = 'GERENTE'), 
       (SELECT id FROM sucursales WHERE nombre = 'Sucursal Principal'), 
       CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE username = 'gerente');

-- ==============================================
-- Unidades de medida (seed estándar; V025 no corre si flyway deshabilitado)
-- ==============================================
INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Kilogramo', 'kg', 1.0, 'Unidad de peso - 1000 gramos'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Kilogramo');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Gramo', 'g', 0.001, 'Unidad de peso - 1/1000 kilogramo'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Gramo');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Litro', 'l', 1.0, 'Unidad de volumen - 1000 mililitros'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Litro');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Mililitro', 'ml', 0.001, 'Unidad de volumen - 1/1000 litro'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Mililitro');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Unidad', 'u', 1.0, 'Unidad individual'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Unidad');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Docena', 'dz', 12.0, 'Grupo de 12 unidades'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Docena');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Metro', 'm', 1.0, 'Unidad de longitud'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Metro');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Centímetro', 'cm', 0.01, 'Unidad de longitud - 1/100 metro'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Centímetro');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Miligramo', 'mg', 0.000001, 'Unidad de peso - 1/1,000,000 kilogramo'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Miligramo');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Tonelada', 'tn', 1000.0, 'Unidad de peso - 1000 kilogramos'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Tonelada');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Onza', 'oz', 0.0283495, 'Unidad de peso - 28.3495 gramos'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Onza');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Libra', 'lb', 0.453592, 'Unidad de peso - 453.592 gramos'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Libra');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Taza', 'tz', 0.236588, 'Unidad de volumen - 236.588 mililitros'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Taza');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Cucharada', 'cda', 0.014787, 'Unidad de volumen - 14.787 mililitros'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Cucharada');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Cucharadita', 'cdita', 0.004929, 'Unidad de volumen - 4.929 mililitros'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Cucharadita');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Galón', 'gal', 3.78541, 'Unidad de volumen - 3785.41 mililitros'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Galón');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Paquete', 'paq', 1.0, 'Paquete o caja'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Paquete');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Botella', 'bot', 1.0, 'Botella individual'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Botella');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Lata', 'lat', 1.0, 'Lata individual'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Lata');

INSERT INTO unidades (nombre, abreviatura, factor_base, descripcion) 
SELECT 'Caja', 'caja', 1.0, 'Caja de producto'
WHERE NOT EXISTS (SELECT 1 FROM unidades WHERE nombre = 'Caja');

-- ==============================================
-- Métodos de pago
-- ==============================================
INSERT INTO metodos_pago (nombre, requiere_referencia, activo) 
SELECT 'Efectivo', FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE nombre = 'Efectivo');

INSERT INTO metodos_pago (nombre, requiere_referencia, activo) 
SELECT 'Transferencia', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE nombre = 'Transferencia');

INSERT INTO metodos_pago (nombre, requiere_referencia, activo) 
SELECT 'Tarjeta', TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM metodos_pago WHERE nombre = 'Tarjeta');

-- ==============================================
-- Catálogo de prueba: categorías
-- ==============================================
INSERT INTO categorias_productos (nombre, descripcion, activa, orden, sucursal_id) 
SELECT 'Desayunos', 'Desayunos tradicionales', true, 1, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Desayunos');

INSERT INTO categorias_productos (nombre, descripcion, activa, orden, sucursal_id) 
SELECT 'Especialidades', 'Platos especiales de la casa', true, 2, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Especialidades');

INSERT INTO categorias_productos (nombre, descripcion, activa, orden, sucursal_id) 
SELECT 'Bebidas', 'Bebidas calientes y frías', true, 3, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Bebidas');

INSERT INTO categorias_productos (nombre, descripcion, activa, orden, sucursal_id) 
SELECT 'Extras', 'Complementos y adicionales', true, 4, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM categorias_productos WHERE nombre = 'Extras');

-- ==============================================
-- Catálogo de prueba: productos simples
-- ==============================================
UPDATE productos SET sucursal_id = (SELECT id FROM sucursales ORDER BY id LIMIT 1) WHERE sucursal_id IS NULL;

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Desayuno Tradicional', 'Huevos, frijoles, pan y café', c.id, 65.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Desayunos' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Desayuno Tradicional' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Huevos al Gusto', 'Huevos preparados al gusto del cliente', c.id, 55.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Desayunos' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Huevos al Gusto' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Hot Cakes', 'Hot cakes con miel y mantequilla', c.id, 70.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Desayunos' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Hot Cakes' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Chilaquiles Verdes', 'Chilaquiles con salsa verde y crema', c.id, 85.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Especialidades' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Chilaquiles Verdes' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Molletes', 'Bolillo con frijoles, queso y pico de gallo', c.id, 60.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Especialidades' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Molletes' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Sincronizadas', 'Tortilla de harina con queso y jamón', c.id, 55.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Especialidades' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Sincronizadas' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Café de Olla', 'Café de olla con piloncillo y canela', c.id, 25.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Bebidas' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Café de Olla' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Café Americano', 'Café americano recién preparado', c.id, 20.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Bebidas' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Café Americano' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Café con Leche', 'Café con leche estilo tradicional', c.id, 30.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Bebidas' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Café con Leche' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Tortillas Extra', 'Orden de tortillas de maíz o harina', c.id, 10.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Extras' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Tortillas Extra' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Frijoles Extra', 'Orden de frijoles refritos', c.id, 15.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Extras' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Frijoles Extra' AND p.producto_base_id IS NULL);

-- ==============================================
-- Catálogo de prueba: productos con variantes
-- ==============================================
INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Jugo Natural', 'Jugo de naranja recién exprimido', c.id, 35.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Bebidas' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Jugo Natural' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT b.nombre, b.descripcion, b.categoria_id, 30.00, true, true, b.id, 'Chico', 1, b.sucursal_id
FROM productos b
WHERE b.nombre = 'Jugo Natural' AND b.producto_base_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM productos v WHERE v.producto_base_id = b.id AND v.nombre_variante = 'Chico');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT b.nombre, b.descripcion, b.categoria_id, 35.00, true, true, b.id, 'Mediano', 2, b.sucursal_id
FROM productos b
WHERE b.nombre = 'Jugo Natural' AND b.producto_base_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM productos v WHERE v.producto_base_id = b.id AND v.nombre_variante = 'Mediano');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT b.nombre, b.descripcion, b.categoria_id, 40.00, true, true, b.id, 'Grande', 3, b.sucursal_id
FROM productos b
WHERE b.nombre = 'Jugo Natural' AND b.producto_base_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM productos v WHERE v.producto_base_id = b.id AND v.nombre_variante = 'Grande');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT 'Agua Fresca de Piña', 'Agua fresca de piña', c.id, 25.00, true, true, NULL, NULL, NULL, (SELECT id FROM sucursales ORDER BY id LIMIT 1)
FROM categorias_productos c
WHERE c.nombre = 'Bebidas' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.nombre = 'Agua Fresca de Piña' AND p.producto_base_id IS NULL);

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT b.nombre, b.descripcion, b.categoria_id, 20.00, true, true, b.id, 'Chico', 1, b.sucursal_id
FROM productos b
WHERE b.nombre = 'Agua Fresca de Piña' AND b.producto_base_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM productos v WHERE v.producto_base_id = b.id AND v.nombre_variante = 'Chico');

INSERT INTO productos (nombre, descripcion, categoria_id, precio, activo, disponible_en_menu, producto_base_id, nombre_variante, orden_variante, sucursal_id)
SELECT b.nombre, b.descripcion, b.categoria_id, 25.00, true, true, b.id, 'Mediano', 2, b.sucursal_id
FROM productos b
WHERE b.nombre = 'Agua Fresca de Piña' AND b.producto_base_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM productos v WHERE v.producto_base_id = b.id AND v.nombre_variante = 'Mediano');
