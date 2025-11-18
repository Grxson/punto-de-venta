# Consultas base para KPIs (borrador SQL)

> Notación SQL genérica (PostgreSQL). Ajustar nombres según modelo final.

## Ventas por día
SELECT date_trunc('day', v.fecha) AS dia,
       SUM(v.total) AS ventas
FROM ventas v
GROUP BY 1
ORDER BY 1;

## Ticket promedio por día
WITH t AS (
  SELECT date_trunc('day', v.fecha) AS dia, COUNT(*) AS tickets, SUM(v.total) AS ventas
  FROM ventas v
  GROUP BY 1
)
SELECT dia, ventas / NULLIF(tickets,0) AS ticket_promedio FROM t ORDER BY 1;

## Top productos por unidades
SELECT p.nombre, SUM(vi.cantidad) AS unidades
FROM ventas_items vi
JOIN productos p ON p.id = vi.producto_id
GROUP BY p.nombre
ORDER BY unidades DESC
LIMIT 10;

## Costo de ventas por día (estimado por consumo)
SELECT date_trunc('day', m.fecha) AS dia, SUM(m.costo_total) AS costo_ventas
FROM inventario_movimientos m
WHERE m.tipo = 'consumo'
GROUP BY 1
ORDER BY 1;

## Margen bruto por día
WITH v AS (
  SELECT date_trunc('day', fecha) AS dia, SUM(total) AS ventas FROM ventas GROUP BY 1
), c AS (
  SELECT date_trunc('day', fecha) AS dia, SUM(costo_total) AS costo FROM inventario_movimientos WHERE tipo='consumo' GROUP BY 1
)
SELECT v.dia, v.ventas, c.costo, v.ventas - c.costo AS margen, (v.ventas - c.costo)/NULLIF(v.ventas,0) AS margen_pct
FROM v LEFT JOIN c ON v.dia = c.dia
ORDER BY 1;

## Merma valorizada por periodo
SELECT date_trunc('day', fecha) AS dia, SUM(costo_total) AS merma
FROM inventario_movimientos
WHERE tipo='merma'
GROUP BY 1
ORDER BY 1;

## Gastos por categoría
SELECT cg.nombre AS categoria, SUM(g.monto) AS total
FROM gastos g JOIN categorias_gasto cg ON cg.id = g.categoria_gasto_id
GROUP BY cg.nombre
ORDER BY total DESC;
