# Área administrativa: visión y alcance

Este documento describe el alcance del área administrativa del punto de venta, orientada a control operativo y toma de decisiones con métricas claras.

## Objetivos
- Visibilidad de ventas e indicadores por día, semana, mes y periodos personalizados.
- Control de inventario por insumo con recetas (BOM), costos y mermas.
- Gestión financiera básica: ingresos, gastos, caja y conciliaciones.
- Seguridad por roles (caja, mesero, cocina, administrador/owner).

## Módulos principales
1. Reportes y analítica
   - Ventas por periodo, ticket promedio, margen bruto, top productos, horas pico.
2. Inventario e insumos
   - Catálogo de insumos, unidades y conversiones, recetas, movimientos (entradas/consumo/mermas/ajustes), alertas de stock.
3. Finanzas operativas
   - Ingresos por ventas y otros, gastos por categorías, caja chica, cierres y conciliaciones con métodos de pago.
4. Seguridad y auditoría
   - Usuarios, roles, permisos, bitácora de operaciones críticas (cancelaciones, descuentos, ajustes de inventario).

## KPIs sugeridos (primer release)
- Ventas totales por periodo y por canal.
- Ticket promedio = Ventas / Número de tickets.
- Costo de ventas (basado en consumo de recetas) y margen bruto.
- Merma valorizada y % de merma.
- Top N productos por unidades y por importe.

## Consideraciones de implementación
- Costeo: promedio ponderado o FIFO para valorización de inventario.
- Recetas: soportar merma teórica por ingrediente en el costo estándar del producto.
- Movimientos automáticos de consumo al cerrar una venta.
- Separación de permisos para modificar costos y realizar ajustes manuales.

## Roadmap (alto nivel)
1) MVP reportes + recetas + consumo automático + gastos básicos.
2) Alertas de stock, stock mínimo, y mermas con motivos.
3) Presupuestos de gasto y metas de venta.
4) Exportaciones (CSV/PDF) y tableros interactivos.
