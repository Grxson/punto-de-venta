# Especificación de Base de Datos (PostgreSQL)

Este documento describe la estructura de datos para el sistema de punto de venta, inventario y reportes. Incluye tablas, columnas, claves, relaciones, índices, vistas y lineamientos de particionado y triggers.

- Motor sugerido: PostgreSQL >= 13
- Codificación: UTF-8
- Zona horaria: UTC (la app muestra en local)
- Moneda: NUMERIC(12,2) para montos

## Convenciones
- snake_case para nombres.
- PK: id SERIAL/BIGSERIAL o UUID (según preferencia de la app).
- FK nombradas fk_<tabla>_<columna>.
- Campos de auditoría: created_at, updated_at (opcional en todas los catálogos).
- Soft-delete para entidades críticas (activo boolean) cuando aplique.

## Catálogos y operativos

### Sucursales y operación
- sucursales
  - id PK
  - nombre TEXT NOT NULL
  - direccion TEXT NULL
  - activa BOOLEAN DEFAULT TRUE
- cajas
  - id PK
  - sucursal_id FK -> sucursales.id
  - nombre TEXT NOT NULL
  - activa BOOLEAN DEFAULT TRUE
- turnos
  - id PK
  - sucursal_id FK -> sucursales.id
  - caja_id FK -> cajas.id
  - usuario_id_apertura FK -> usuarios.id
  - fecha_apertura TIMESTAMPTZ NOT NULL
  - usuario_id_cierre FK -> usuarios.id NULL
  - fecha_cierre TIMESTAMPTZ NULL
  - activo BOOLEAN DEFAULT TRUE

### Productos y ventas
- categorias_productos
  - id PK
  - nombre TEXT UNIQUE NOT NULL
- productos
  - id PK
  - nombre TEXT NOT NULL
  - categoria_id FK -> categorias_productos.id
  - precio NUMERIC(12,2) NOT NULL
  - activo BOOLEAN DEFAULT TRUE
- descuentos
  - id PK
  - nombre TEXT NOT NULL
  - tipo TEXT CHECK (tipo IN ('porcentaje','monto'))
  - valor NUMERIC(12,4) NOT NULL
  - activo BOOLEAN DEFAULT TRUE
  - max_por_rol_json JSONB NULL
- clientes
  - id PK
  - nombre TEXT NOT NULL
  - telefono TEXT NULL
  - email TEXT NULL
- metodos_pago
  - id PK
  - nombre TEXT UNIQUE NOT NULL
  - requiere_referencia BOOLEAN DEFAULT FALSE
- ventas
  - id PK
  - sucursal_id FK -> sucursales.id
  - caja_id FK -> cajas.id
  - turno_id FK -> turnos.id
  - fecha TIMESTAMPTZ NOT NULL
  - total NUMERIC(12,2) NOT NULL
  - impuestos NUMERIC(12,2) NOT NULL DEFAULT 0
  - descuento NUMERIC(12,2) NOT NULL DEFAULT 0
  - cliente_id FK -> clientes.id NULL
  - canal TEXT NULL -- mostrador, delivery, etc.
  - estado TEXT CHECK (estado IN ('abierta','cerrada','cancelada')) NOT NULL
- ventas_items
  - id PK
  - venta_id FK -> ventas.id
  - producto_id FK -> productos.id
  - cantidad NUMERIC(12,3) NOT NULL
  - precio_unitario NUMERIC(12,2) NOT NULL
  - costo_estimado NUMERIC(12,4) NULL
  - nota TEXT NULL
- pagos
  - id PK
  - venta_id FK -> ventas.id
  - metodo_pago_id FK -> metodos_pago.id
  - monto NUMERIC(12,2) NOT NULL
  - referencia TEXT NULL
  - fecha TIMESTAMPTZ NOT NULL

### Inventario
- unidades
  - id PK
  - nombre TEXT NOT NULL -- gr, ml, pieza
  - abreviatura TEXT NOT NULL -- g, ml, pza
  - factor_base NUMERIC(12,6) NOT NULL -- vs unidad_base del ingrediente
- ingredientes
  - id PK
  - nombre TEXT NOT NULL
  - categoria TEXT NULL
  - unidad_base_id FK -> unidades.id
  - costo_unitario_base NUMERIC(12,6) NOT NULL
  - stock_minimo NUMERIC(12,3) NULL
  - proveedor_id FK -> proveedores.id NULL
  - activo BOOLEAN DEFAULT TRUE
- recetas
  - producto_id FK -> productos.id (PK compuesto con ingrediente_id)
  - ingrediente_id FK -> ingredientes.id
  - cantidad NUMERIC(12,6) NOT NULL
  - unidad_id FK -> unidades.id NOT NULL
  - merma_teorica NUMERIC(6,4) DEFAULT 0 -- 0..1
- inventario_movimientos
  - id PK
  - ingrediente_id FK -> ingredientes.id
  - tipo TEXT CHECK (tipo IN ('entrada','consumo','ajuste','merma','devolucion')) NOT NULL
  - cantidad NUMERIC(14,6) NOT NULL
  - unidad_id FK -> unidades.id NOT NULL
  - costo_unitario NUMERIC(14,6) NOT NULL
  - costo_total NUMERIC(14,6) NOT NULL
  - fecha TIMESTAMPTZ NOT NULL
  - ref_tipo TEXT NULL -- 'venta','compra','ajuste','merma'
  - ref_id BIGINT NULL
  - lote TEXT NULL
  - caducidad DATE NULL
  - nota TEXT NULL
- mermas
  - id PK
  - ingrediente_id FK -> ingredientes.id
  - cantidad NUMERIC(14,6) NOT NULL
  - unidad_id FK -> unidades.id NOT NULL
  - motivo TEXT NOT NULL
  - fecha TIMESTAMPTZ NOT NULL
  - responsable_id FK -> usuarios.id

### Compras y proveedores
- proveedores
  - id PK
  - nombre TEXT NOT NULL
  - contacto TEXT NULL
  - telefono TEXT NULL
  - email TEXT NULL
- compras
  - id PK
  - proveedor_id FK -> proveedores.id
  - sucursal_id FK -> sucursales.id
  - fecha TIMESTAMPTZ NOT NULL
  - subtotal NUMERIC(12,2) NOT NULL
  - impuestos NUMERIC(12,2) NOT NULL DEFAULT 0
  - total NUMERIC(12,2) NOT NULL
  - metodo_pago_id FK -> metodos_pago.id
  - referencia TEXT NULL
- compras_items
  - id PK
  - compra_id FK -> compras.id
  - ingrediente_id FK -> ingredientes.id
  - cantidad NUMERIC(14,6) NOT NULL
  - unidad_id FK -> unidades.id NOT NULL
  - costo_unitario NUMERIC(14,6) NOT NULL
  - costo_total NUMERIC(14,6) NOT NULL
  - lote TEXT NULL
  - caducidad DATE NULL

### Finanzas
- categorias_gasto
  - id PK
  - nombre TEXT UNIQUE NOT NULL
  - presupuesto_mensual NUMERIC(12,2) NULL
- gastos
  - id PK
  - categoria_gasto_id FK -> categorias_gasto.id
  - proveedor_id FK -> proveedores.id NULL
  - monto NUMERIC(12,2) NOT NULL
  - fecha TIMESTAMPTZ NOT NULL
  - metodo_pago_id FK -> metodos_pago.id NOT NULL
  - nota TEXT NULL
  - tipo_gasto VARCHAR(50) DEFAULT 'Operacional' NOT NULL -- 'Operacional' o 'Administrativo'
  - comprobante_url TEXT NULL
  - usuario_id FK -> usuarios.id NULL
  - created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  - updated_at TIMESTAMPTZ NULL
- cierres_caja
  - id PK
  - sucursal_id FK -> sucursales.id
  - caja_id FK -> cajas.id
  - turno_id FK -> turnos.id
  - usuario_id FK -> usuarios.id
  - fecha_apertura TIMESTAMPTZ NOT NULL
  - fecha_cierre TIMESTAMPTZ NOT NULL
  - efectivo_inicial NUMERIC(12,2) NOT NULL
  - efectivo_esperado NUMERIC(12,2) NOT NULL
  - efectivo_declarado NUMERIC(12,2) NOT NULL
  - diferencia NUMERIC(12,2) NOT NULL
  - notas TEXT NULL

### Seguridad y auditoría
- roles
  - id PK
  - nombre TEXT UNIQUE NOT NULL -- mesero, cajero, cocina, supervisor, admin
  - permisos_json JSONB NOT NULL
- usuarios
  - id PK
  - nombre TEXT NOT NULL
  - rol_id FK -> roles.id
  - sucursal_id FK -> sucursales.id NULL
  - activo BOOLEAN DEFAULT TRUE
- auditoria_eventos
  - id PK
  - usuario_id FK -> usuarios.id
  - fecha TIMESTAMPTZ NOT NULL
  - entidad TEXT NOT NULL
  - entidad_id BIGINT NULL
  - evento TEXT NOT NULL -- cancelacion, descuento_alto, ajuste_inventario, cierre_caja, etc.
  - antes_json JSONB NULL
  - despues_json JSONB NULL
  - motivo TEXT NULL

## Relaciones clave (resumen)
- ventas N:1 sucursales, N:1 cajas, N:1 turnos, N:1 clientes?
- ventas_items N:1 ventas, N:1 productos
- pagos N:1 ventas, N:1 metodos_pago
- recetas N:1 productos, N:1 ingredientes
- inventario_movimientos N:1 ingredientes
- compras N:1 proveedores, N:1 sucursales, N:1 metodos_pago
- compras_items N:1 compras, N:1 ingredientes
- gastos N:1 categorias_gasto, N:1 metodos_pago
- usuarios N:1 roles, N:1 sucursales?

## Índices recomendados
- ventas(fecha), ventas(sucursal_id, fecha), ventas(estado)
- ventas_items(venta_id), ventas_items(producto_id)
- pagos(venta_id), pagos(metodo_pago_id)
- inventario_movimientos(ingrediente_id, fecha), inventario_movimientos(tipo, fecha)
- compras(fecha), compras(proveedor_id, fecha)
- compras_items(compra_id), compras_items(ingrediente_id)
- gastos(fecha), gastos(categoria_gasto_id)
- cierres_caja(sucursal_id, caja_id, fecha_cierre)

Índices compuestos por periodo y entidad ayudan a reportes por rango. Evaluar índices parciales por estado (ventas cerradas).

## Particionamiento (opcional recomendado)
- Por mes (RANGE sobre fecha) para: ventas, ventas_items, pagos, inventario_movimientos.
- Beneficio: consultas por rango más rápidas y mantenimiento particionado.

## Vistas operativas y analíticas
- vw_ventas_diarias
```sql
CREATE VIEW vw_ventas_diarias AS
SELECT date_trunc('day', v.fecha) AS dia, v.sucursal_id,
       COUNT(*) AS tickets, SUM(v.total) AS ventas
FROM ventas v WHERE v.estado='cerrada'
GROUP BY 1,2;
```
- vw_top_productos
```sql
CREATE VIEW vw_top_productos AS
SELECT p.id, p.nombre, SUM(vi.cantidad) AS unidades, SUM(vi.cantidad*vi.precio_unitario) AS importe
FROM ventas_items vi JOIN ventas v ON v.id=vi.venta_id AND v.estado='cerrada'
JOIN productos p ON p.id=vi.producto_id
GROUP BY p.id, p.nombre;
```
- vw_costo_ventas_diario (consumo valorizado)
```sql
CREATE VIEW vw_costo_ventas_diario AS
SELECT date_trunc('day', m.fecha) AS dia, m.ingrediente_id, SUM(m.costo_total) AS costo
FROM inventario_movimientos m WHERE m.tipo='consumo'
GROUP BY 1,2;
```
- vw_merma_diaria
```sql
CREATE VIEW vw_merma_diaria AS
SELECT date_trunc('day', m.fecha) AS dia, SUM(m.costo_total) AS merma
FROM inventario_movimientos m WHERE m.tipo='merma'
GROUP BY 1;
```
- vw_gastos_por_categoria
```sql
CREATE VIEW vw_gastos_por_categoria AS
SELECT cg.nombre AS categoria, DATE_TRUNC('month', g.fecha) AS mes, SUM(g.monto) AS total
FROM gastos g JOIN categorias_gasto cg ON cg.id=g.categoria_gasto_id
GROUP BY 1,2;
```

## Vistas materializadas (sumarios)
- mv_sumario_ventas_diario(dia, sucursal_id, tickets, ventas)
- mv_sumario_costo_ventas_diario(dia, costo)
- mv_sumario_merma_diario(dia, merma)
- mv_sumario_gastos_diario(dia, total)

Refrescar nocturno y bajo demanda tras cierres.

## Triggers y procesos
- Al confirmar venta (estado -> 'cerrada'):
  - Generar movimientos de inventario tipo 'consumo' por receta*cantidad.
  - Registrar evento en auditoría.
- Al registrar compra y sus items:
  - Generar movimientos de inventario tipo 'entrada'.
- Al registrar merma:
  - Crear movimiento 'merma' y evento en auditoría.
- Opcional: mantener tabla de saldos por ingrediente (existencias) actualizada por triggers o vía proceso batch nocturno.

## Reglas y constraints
- Checks para tipos (estado de venta, tipo de movimiento, tipo de descuento).
- Unicidad en catálogos (nombres de métodos de pago, categorías, etc.).
- No permitir ventas cerradas sin al menos un pago cuyo total >= total de venta (regla de app y/o constraint diferible).
- Bloquear edición de ventas/items tras cierre (a nivel app; DB con permisos/estados o triggers si se desea estricto).

## Seguridad a nivel BD (mínimo viable)
- Roles DB: app_read (SELECT), app_write (DML en tablas operativas), app_admin (DDL).
- Conceder privilegios mínimos al rol usado por la app.

## Migraciones y mantenimiento
- Mantener migraciones versionadas (p. ej. con Prisma, Sequelize, Knex o Flyway/liquibase). 
- Vacío y ANALYZE regulares; monitoreo de consultas lentas.
- Backups diarios + prueba de restauración.

## Notas finales
- Este diseño prioriza reportes rápidos por periodo y control de inventario con costo de ventas. Si prefieres FIFO por lotes, anclar costo unitario por lote y consumir en orden; caso contrario, promedio ponderado por ingrediente.
