# Finanzas operativas: ingresos, gastos y caja

## Ingresos
- Origen principal: ventas del punto de venta (por ticket, por método de pago).
- Otros ingresos: abonos, eventos especiales, etc.
- Métodos de pago: efectivo, tarjeta, transferencia, vales, etc. con referencia opcional.

## Gastos
- Registrar gastos con categoría (insumos, nómina, servicios, renta, mantenimiento, etc.).
- Campos: id, categoría, proveedor (opcional), monto, fecha, método de pago, nota, comprobante_url (opcional).
- Presupuestos por categoría (opcional en fases siguientes).

## Caja y cierres
- Apertura de caja (monto inicial) y cierre con arqueo: efectivo declarado vs esperado.
- Diferencias de caja registradas y auditables.
- Conciliación con métodos de pago no-efectivo (tarjeta/transferencia) por día/turno.

## Reportes
- Ingresos por periodo y por método de pago.
- Gastos por periodo y categoría.
- Flujo neto = Ingresos - Gastos.
- Margen bruto = (Ventas - Costo de ventas) / Ventas.

## Notas de implementación
- Costo de ventas: usar consumo de recetas del periodo o costo estimado por item.
- Soportar filtros por sucursal/turno (si aplica en el futuro).
- Exportaciones CSV/PDF.
