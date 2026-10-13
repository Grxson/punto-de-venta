# Escalabilidad y rendimiento de datos

## Base recomendada
- PostgreSQL (>=13) por funciones analíticas, vistas materializadas y particionamiento.

## Índices
- ventas(fecha), ventas_items(venta_id, producto_id), pagos(venta_id, metodo_pago_id)
- inventario_movimientos(ingrediente_id, fecha, tipo)
- gastos(fecha, categoria_gasto_id)
- Considerar índices compuestos por periodo + entidad para reportes.

## Particionamiento por tiempo
- Tablas grandes por fecha (mensual): ventas, ventas_items, pagos, inventario_movimientos.
- Beneficio: consultas por rango más rápidas y mantenimiento por partición (vacuum/archivado).

## Vistas materializadas / tablas sumario
- Resúmenes diarios/semanales/mensuales de: ventas, costo de ventas, merma, gastos.
- Refresco programado (cada noche) y bajo demanda para cierres.

## Concurrencia y transacciones
- Confirmar venta en transacción: crear venta, items, pagos y movimientos de consumo.
- Evitar bloqueos mutuos (deadlocks) con orden consistente de escrituras.

## Backups y retención
- Respaldos (backups) diarios + WAL; pruebas de restauración periódicas.
- Retención de crudos 12-24 meses y sumarios históricos más largos.

## Observabilidad
- Log de consultas lentas, métricas de DB, y alarmas por colas de bloqueos.

## Escala futura
- Réplicas de lectura (read replicas) para reportes pesados.
- Exportación a CSV/Parquet para BI externo (opcional).
