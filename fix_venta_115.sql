-- Fix para la venta #115 - cambiar fecha a 12/12/2025 22:13 (hora correcta en México)
UPDATE ventas SET fecha = '2025-12-12 22:13:22.327417' WHERE id = 115;

-- Verificar que se actualizó correctamente
SELECT id, fecha, total, estado FROM ventas WHERE id = 115;
