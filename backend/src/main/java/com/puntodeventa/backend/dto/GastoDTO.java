package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Gasto operativo registrado en una sucursal.
 *
 * <p>Es la respuesta de los endpoints de consulta, creación y actualización de gastos.
 * Incluye el nombre de la categoría, del proveedor, de la sucursal, del medio de pago y
 * del usuario para que el listado se muestre sin consultas adicionales.
 *
 * @param id                 identificador del gasto
 * @param categoriaGastoId   categoría a la que se imputa
 * @param categoriaGastoNombre nombre de esa categoría
 * @param proveedorId       proveedor vinculado, si lo hay
 * @param proveedorNombre    nombre de ese proveedor
 * @param sucursalId        sucursal donde se registra el gasto
 * @param sucursalNombre     nombre de esa sucursal
 * @param monto              importe del gasto
 * @param fecha              fecha del gasto
 * @param metodoPagoId       medio de pago con el que se canceló
 * @param metodoPagoNombre   nombre de ese medio de pago
 * @param referencia         número de operación, cheque o comprobante
 * @param nota               observación interna
 * @param comprobanteUrl     dirección del archivo que respalda el gasto
 * @param tipoGasto          clasificación del gasto (directo o indirecto)
 * @param usuarioId          usuario que registró el gasto
 * @param usuarioNombre      nombre de ese usuario
 * @param createdAt          momento de creación del registro
 */
public record GastoDTO(
        Long id,
        Long categoriaGastoId,
        String categoriaGastoNombre,
        Long proveedorId,
        String proveedorNombre,
        Long sucursalId,
        String sucursalNombre,
        BigDecimal monto,
        LocalDateTime fecha,
        Long metodoPagoId,
        String metodoPagoNombre,
        String referencia,
        String nota,
        String comprobanteUrl,
        String tipoGasto,
        Long usuarioId,
        String usuarioNombre,
        LocalDateTime createdAt
) {}

