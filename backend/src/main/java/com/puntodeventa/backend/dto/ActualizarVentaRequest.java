package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cuerpo de la petición PUT para corregir una venta ya registrada.
 *
 * <p>A diferencia de {@link CrearVentaRequest}, aquí las líneas y los pagos se reenvían
 * completos: la venta se reconstruye con lo recibido. Se usa sobre todo para anular o
 * corregir cobros mal digitados, por lo que se exige conservar {@code items} y {@code pagos}.
 *
 * @param sucursalId sucursal donde se registró la venta; si es {@code null} se conserva la actual
 * @param items     líneas de la venta, al menos una
 * @param pagos     medios de pago que componen la venta, al menos uno (admite pago mixto)
 * @param descuento descuento aplicado al total; {@code null} se interpreta como cero
 * @param nota      observación interna del vendedor
 * @param fecha     fecha de la venta en texto libre; si es vacía se conserva la existente
 * @param canal     origen de la venta ({@code POS}, {@code WEB}, {@code APP}); {@code null} o
 *                  vacío se normaliza a {@code POS}
 */
public record ActualizarVentaRequest(
        Long sucursalId,

        @NotEmpty(message = "La venta debe tener al menos un item") @Valid List<VentaItemDTO> items,

        @NotEmpty(message = "La venta debe tener al menos un pago") @Valid List<PagoDTO> pagos,

        @PositiveOrZero(message = "El descuento debe ser positivo o cero") BigDecimal descuento,

        String nota,
        String fecha,
        String canal) {
    // Constructor compacto para valores por defecto
    public ActualizarVentaRequest {
        if (canal == null || canal.isBlank()) {
            canal = "POS";
        }
        if (descuento == null) {
            descuento = BigDecimal.ZERO;
        }
    }
}
