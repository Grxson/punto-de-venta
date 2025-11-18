# Modelo de datos (propuesta inicial)

> Nota: Es un ERD textual para guiar la implementación; los nombres y tipos pueden ajustarse al stack elegido.

## Productos y ventas
- productos(id, nombre, categoria_id, precio, activo)
- categorias_productos(id, nombre)
- ventas(id, sucursal_id, caja_id, turno_id, fecha, total, impuestos, descuento, cliente_id?, canal, estado)
- ventas_items(id, venta_id, producto_id, cantidad, precio_unitario, costo_estimado, nota)
- pagos(id, venta_id, metodo_pago_id, monto, referencia, fecha)
- metodos_pago(id, nombre, requiere_referencia)
 - descuentos(id, nombre, tipo[porcentaje|monto], valor, activo, max_por_rol_json?)
 - clientes(id, nombre, telefono?, email?)

## Sucursales, cajas y turnos
- sucursales(id, nombre, direccion?, activa)
- cajas(id, sucursal_id, nombre, activa)
- turnos(id, sucursal_id, caja_id, usuario_id_apertura, fecha_apertura, usuario_id_cierre?, fecha_cierre?, activo)

## Inventario e insumos
- ingredientes(id, nombre, categoria, unidad_base_id, costo_unitario_base, stock_minimo, activo, proveedor_id?)
- unidades(id, nombre, abreviatura, factor_base, unidad_base_id)
  - factor_base: multiplicador vs la unidad_base (p. ej., 1 kg = 1000 gr)
- recetas(producto_id, ingrediente_id, cantidad, unidad_id, merma_teorica)
- inventario_movimientos(id, ingrediente_id, tipo[entrada|consumo|ajuste|merma|devolucion], cantidad, unidad_id, costo_unitario, costo_total, fecha, ref_tipo, ref_id, lote?, caducidad?, nota)
- mermas(id, ingrediente_id, cantidad, unidad_id, motivo, fecha, responsable_id)
 - proveedores(id, nombre, contacto?, telefono?, email?)
 - compras(id, proveedor_id, sucursal_id, fecha, subtotal, impuestos, total, metodo_pago_id, referencia?)
 - compras_items(id, compra_id, ingrediente_id, cantidad, unidad_id, costo_unitario, costo_total, lote?, caducidad?)

## Finanzas y gastos
- gastos(id, categoria_gasto_id, proveedor_id?, monto, fecha, metodo_pago_id, nota, comprobante_url)
- categorias_gasto(id, nombre, presupuesto_mensual?)
 - cierres_caja(id, sucursal_id, caja_id, turno_id, usuario_id, fecha_apertura, fecha_cierre, efectivo_inicial, efectivo_declarado, efectivo_esperado, diferencia, notas)

## Seguridad
- usuarios(id, nombre, rol_id, activo, sucursal_id?)
- roles(id, nombre, permisos_json)
 - auditoria_eventos(id, usuario_id, fecha, entidad, entidad_id, evento, antes_json?, despues_json?, motivo?)

## Relaciones clave
- productos N:1 categorias_productos
- ventas N:1 sucursales, N:1 cajas, N:1 turnos
- ventas_items N:1 ventas, N:1 productos
- pagos N:1 ventas, N:1 metodos_pago
- recetas N:1 productos, N:1 ingredientes
- inventario_movimientos N:1 ingredientes
- mermas N:1 ingredientes, N:1 usuarios (responsable)
- gastos N:1 categorias_gasto, N:1 metodos_pago
 - compras N:1 proveedores, N:1 sucursales, N:1 metodos_pago
 - compras_items N:1 compras, N:1 ingredientes

## Reglas y consideraciones
- Integridad: no eliminar físico registros críticos; usar bandera activo o soft-delete.
- Valorización de inventario: promedio ponderado o FIFO (definir una sola para consistencia).
- Consumo automático: al confirmar venta -> generar movimientos por receta*cantidad.
- Costeo estándar del producto: incluir merma_teórica en la cantidad efectiva.
- Auditoría: bitácora para cancelaciones, descuentos, ajustes y cambios de costo.
 - Multi-sucursal: filtrar reportes y permisos por sucursal; cajas y turnos asociados a sucursal.
 - Cierres de caja: bloquear edición posterior al cierre (solo reversión por Admin con auditoría).

## Fórmulas útiles
- Costo por ingrediente: cantidad_real_base * costo_unitario_base
- cantidad_real_base = (cantidad / (1 - merma_teorica)) convertida a unidad_base
- Costo receta (unitario) = Σ costo_ingrediente
- Costo de ventas periodo ≈ Σ (consumo valorizado) del periodo
- Margen bruto = (Ventas - Costo de ventas) / Ventas
- % Merma = merma_valorizada / costo_disponible (o vs ventas como referencia)
