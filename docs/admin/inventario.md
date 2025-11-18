# Inventario, recetas (BOM) y mermas

## Catálogo de insumos
Campos sugeridos:
- id, nombre, categoría, unidad_base, costo_unitario_base
- proveedor (opcional), sku/código (opcional)
- stock_mínimo, activo

## Unidades y conversiones
- Definir una unidad base por insumo (p. ej., gr, ml, pieza).
- Tabla de unidades y factores de conversión para registrar entradas o recetas en distintas unidades.

## Recetas (BOM)
- Por cada producto del menú definir: ingrediente, cantidad, unidad, merma_teórica% (opcional).
- Cálculo de costo estándar por unidad del producto:
  - cantidad_real = cantidad / (1 - merma_teórica)
  - costo_ing = (cantidad_real_en_unidad_base) * costo_unitario_base
  - costo_receta = suma(costo_ing)

## Movimientos de inventario
- Tipos: entrada, consumo (automático por venta), ajuste, merma, devolución.
- Campos: id, ingrediente_id, tipo, cantidad, unidad, costo_unitario, costo_total, fecha, referencia (venta/gasto/ajuste), lote y caducidad (opcionales), nota.
- Valorización: promedio ponderado o FIFO configurable.

## Consumo automático por venta
- Al cerrar una venta, por cada item del ticket se generan movimientos de tipo consumo con base en su receta x cantidad.
- Si no hay receta, opcionalmente no consume inventario (marcar productos de servicio).

## Mermas
- Registro de merma con motivo (daño, caducidad, preparación fallida, evaporación, etc.) y responsable.
- KPIs: merma valorizada por periodo y % merma = merma_valorizada / costo_disponible (o sobre ventas para referencia).

## Alertas y control
- Stock bajo: alerta cuando existencias < stock_mínimo.
- Caducidad próxima (si se usan lotes). 
- Permisos: ajustes y cambios de costo solo para roles autorizados.

## Reportes de inventario
- Kardex por insumo.
- Existencias valorizadas.
- Consumo por producto y por ingrediente.
- Top ingredientes por costo.
