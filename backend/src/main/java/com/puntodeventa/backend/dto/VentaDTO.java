package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Venta registrada, con sus líneas y sus pagos.
 *
 * <p>Es el response de los endpoints de consulta de venta (por ejemplo, el detalle de una
 * venta o su ticket).
 *
 * @param id identificador de la venta
 * @param sucursalId sucursal donde se registró la venta
 * @param sucursalNombre nombre de esa sucursal (solo lectura)
 * @param fecha fecha y hora de la venta
 * @param subtotal suma de las líneas antes de impuestos y descuentos
 * @param total importe final a pagar por el cliente
 * @param impuestos impuestos aplicados a la venta
 * @param descuento descuento aplicado al total
 * @param canal origen de la venta ({@code POS}, {@code WEB}, {@code APP})
 * @param estado situación de la venta (por ejemplo, {@code completada} o {@code cancelada})
 * @param nota observación interna del vendedor
 * @param usuarioId usuario que registró la venta
 * @param usuarioNombre nombre de ese usuario (solo lectura)
 * @param items líneas de la venta
 * @param pagos pagos que saldan la venta
 */
public record VentaDTO(
    Long id,
    Long sucursalId,
    String sucursalNombre,
    LocalDateTime fecha,
    BigDecimal subtotal,
    BigDecimal total,
    BigDecimal impuestos,
    BigDecimal descuento,
    String canal,
    String estado,
    String nota,
    Long usuarioId,
    String usuarioNombre,
    List<VentaItemDTO> items,
    List<PagoDTO> pagos
) {}
