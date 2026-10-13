package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cuerpo de la petición POST para registrar una venta en el punto de venta.
 *
 * <p>El servicio calcula los subtotales, los impuestos y el total a partir de los precios
 * unitarios enviados; el cliente no envía ninguno de esos importes. Cada pago de
 * {@code pagos} debe poder cubrir el total, y la venta admite pago mixto.
 *
 * @param sucursalId sucursal donde se registra la venta
 * @param cajaId     caja que emite la venta
 * @param turnoId    turno de caja al que se imputa la venta
 * @param items      líneas vendidas, al menos una
 * @param pagos      medios de pago que saldan la venta, al menos uno
 * @param descuento  descuento aplicado al total; {@code null} se interpreta como cero
 * @param nota       observación del vendedor
 * @param canal      origen de la venta ({@code POS}, {@code WEB}, {@code APP});
 *                   {@code null} o vacío se normaliza a {@code POS}
 */
public record CrearVentaRequest(
        Long sucursalId,
        Long cajaId,
        Long turnoId,

        @NotEmpty(message = "La venta debe tener al menos un item") @Valid List<VentaItemDTO> items,

        @NotEmpty(message = "La venta debe tener al menos un pago") @Valid List<PagoDTO> pagos,

        @PositiveOrZero(message = "El descuento debe ser positivo o cero") BigDecimal descuento,

        String nota,
        String canal) {
    // Constructor compacto para valores por defecto
    public CrearVentaRequest {
        if (canal == null || canal.isBlank()) {
            canal = "POS";
        }
        if (descuento == null) {
            descuento = BigDecimal.ZERO;
        }
    }
}
