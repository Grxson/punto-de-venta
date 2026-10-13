package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Cuerpo de la petición de alta y de modificación de un gasto operativo.
 *
 * <p>El mismo tipo sirve para crear y para actualizar: en la actualización se reenvían
 * todos los campos. Al crear, la respuesta es un {@link GastoDTO}.
 *
 * @param categoriaGastoId categoría a la que se imputa el gasto
 * @param proveedorId      proveedor relacionado con el gasto, si lo hay
 * @param sucursalId       sucursal en la que se registra el gasto
 * @param monto            importe del gasto
 * @param fecha            fecha del gasto; si se omite se toma la fecha actual
 * @param metodoPagoId     medio de pago con el que se canceló
 * @param referencia       número de operación, cheque o comprobante
 * @param nota             observación interna
 * @param tipoGasto        clasificación del gasto (por ejemplo, directo o indirecto)
 * @param comprobanteUrl   dirección del archivo que respalda el gasto
 */
public record CrearGastoRequest(
        Long categoriaGastoId,
        Long proveedorId,
        Long sucursalId,
        BigDecimal monto,
        LocalDateTime fecha,
        Long metodoPagoId,
        String referencia,
        String nota,
        String tipoGasto,
        String comprobanteUrl
) {}

