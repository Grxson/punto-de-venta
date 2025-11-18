# Seguridad, roles y permisos

Este documento define quién puede hacer qué dentro del sistema.

## Roles sugeridos
- Cajero/a: opera ventas, cobra, emite tickets y hace cierres de caja.
- Mesero/a: toma pedidos, modifica tickets en su mesa/turno (sin cancelar ventas pagadas).
- Cocina/Barra: ve comandas, marca preparación/entrega (sin acceso a caja ni costos).
- Supervisor/a: puede cancelar items/ventas con motivo y autorización; autoriza descuentos altos.
- Administrador/a: gestiona catálogo, costos, recetas, inventario, gastos, usuarios y reportes.

## Matriz de permisos (resumen)
- Ventas/tickets: Mesero crea/edita su pedido; Cajero cobra; Supervisor cancela; Admin total.
- Descuentos: Mesero hasta X%; Cajero hasta Y%; >Y% requiere Supervisor/Admin.
- Caja: Apertura/cierre solo Cajero/Supervisor/Admin. Ajustes requieren Supervisor/Admin.
- Inventario: Consumo automático; entradas/ajustes/mermas solo Admin o Supervisor.
- Recetas y costos: Solo Admin.
- Gastos y finanzas: Registro Supervisor/Admin; edición/cancelación Admin.
- Reportes: Operativos (ventas del día) para Cajero/Supervisor; analíticos completos para Admin.
- Usuarios y roles: Solo Admin.

## Políticas de acceso
- Autenticación por usuario y contraseña; 2FA opcional para Admin/Supervisor.
- Sesiones con expiración e invalidación al cerrar turno.
- Regla de menor privilegio: cada rol solo ve y hace lo necesario.

## Auditoría
- Bitácora de eventos críticos: cancelaciones de items/ventas, descuentos > umbral, ajustes de inventario, cierres de caja.
- Guardar: quién, cuándo, qué entidad, antes/después (si aplica), motivo.

## Autorizaciones dinámicas
- Umbrales de descuento y cancelación configurables por rol.
- Sucursales: permisos por sucursal (si hay múltiples locales).
