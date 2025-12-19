-- ============================================================================
-- MIGRACIÓN: Sistema de Compras de Materia Prima
-- Fecha: 2025-12-18
-- Descripción: Tablas para gestionar compras a proveedores con segregación
--              por sucursal y auditoría completa.
-- ============================================================================

-- Tabla: COMPRAS
-- Registra cada compra de materia prima a un proveedor
CREATE TABLE IF NOT EXISTS compras (
    id BIGSERIAL PRIMARY KEY,
    sucursal_id BIGINT NOT NULL,
    proveedor_id BIGINT NOT NULL,
    usuario_id BIGINT,
    fecha TIMESTAMP NOT NULL,
    monto_total NUMERIC(14, 2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    -- Estados: pendiente, recibida, cancelada, rechazada
    notas VARCHAR(500),
    numero_factura VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Claves foráneas
    CONSTRAINT fk_compras_sucursal FOREIGN KEY (sucursal_id) 
        REFERENCES sucursales(id) ON DELETE RESTRICT,
    CONSTRAINT fk_compras_proveedor FOREIGN KEY (proveedor_id) 
        REFERENCES proveedores(id) ON DELETE RESTRICT,
    CONSTRAINT fk_compras_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices para segregación y rendimiento (PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_compras_sucursal ON compras(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);
CREATE INDEX IF NOT EXISTS idx_compras_sucursal_fecha ON compras(sucursal_id, fecha);
CREATE INDEX IF NOT EXISTS idx_compras_usuario ON compras(usuario_id);

-- Tabla: COMPRA_ITEMS
-- Items (ingredientes) dentro de cada compra
CREATE TABLE IF NOT EXISTS compra_items (
    id BIGSERIAL PRIMARY KEY,
    compra_id BIGINT NOT NULL,
    ingrediente_id BIGINT NOT NULL,
    unidad_id BIGINT NOT NULL,
    cantidad NUMERIC(12, 6) NOT NULL,
    precio_unitario NUMERIC(14, 6) NOT NULL,
    subtotal NUMERIC(14, 2),
    cantidad_recibida NUMERIC(12, 6) DEFAULT 0,
    
    -- Claves foráneas
    CONSTRAINT fk_compra_items_compra FOREIGN KEY (compra_id) 
        REFERENCES compras(id) ON DELETE CASCADE,
    CONSTRAINT fk_compra_items_ingrediente FOREIGN KEY (ingrediente_id) 
        REFERENCES ingredientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_compra_items_unidad FOREIGN KEY (unidad_id) 
        REFERENCES unidades(id) ON DELETE RESTRICT
);

-- Índices para CompraItems (PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_compra_items_compra ON compra_items(compra_id);
CREATE INDEX IF NOT EXISTS idx_compra_items_ingrediente ON compra_items(ingrediente_id);

-- ============================================================================
-- Agregar columnas de auditoría a tabla GASTOS (si no existen)
-- ============================================================================

ALTER TABLE gastos ADD COLUMN IF NOT EXISTS compra_id BIGINT;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS tipo_gasto VARCHAR(50);

-- Índice para vincular compra con gasto (PostgreSQL)
CREATE INDEX IF NOT EXISTS idx_gastos_compra ON gastos(compra_id);
CREATE INDEX IF NOT EXISTS idx_gastos_tipo ON gastos(tipo_gasto);

-- ============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

/*
FLUJO AUTOMÁTICO DE COMPRAS:

1. CREAR COMPRA (estado = 'pendiente')
   └─ Registra: proveedor, fecha, items

2. RECIBIR COMPRA (estado = 'recibida')
   └─ Sistema automáticamente:
      ├─ Actualiza stock del ingrediente: stock += cantidad_recibida
      ├─ Actualiza costo_unitario del ingrediente
      ├─ Crea GASTO tipo "Compra" (reflejo contable)
      └─ Crea movimiento ENTRADA en InventarioMovimiento

3. REPORTES
   └─ Gasto aparece en corte de caja
   └─ Stock aparece en reportes de inventario
   └─ Auditoría completa de dónde vino cada ingrediente

CAMPOS IMPORTANTES:
- sucursal_id: Segregación. Usuario solo ve compras de su sucursal.
- usuario_id: Preferencias. Se guarda quién creó la compra.
- estado: Ciclo de vida. pendiente → recibida
- cantidad_recibida: Auditoría. ¿Se recibió todo o hay discrepancias?
- numero_factura: Referencia. Para conciliar con proveedor.
*/

-- ============================================================================
-- VERIFICAR CREACIÓN (comentado, ejecutar manualmente si necesario)
-- ============================================================================

-- SELECT COUNT(*) as compras FROM compras;
-- SELECT COUNT(*) as items FROM compra_items;
-- SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES 
--   WHERE TABLE_SCHEMA = 'railway' 
--   AND TABLE_NAME IN ('compras', 'compra_items');
