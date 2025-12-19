package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para crear una nueva venta (POST).
 */
public record CrearVentaRequest(
    Long sucursalId,
    Long cajaId,
    Long turnoId,
    
    @NotEmpty(message = "La venta debe tener al menos un item")
    @Valid
    List<VentaItemDTO> items,
    
    @NotEmpty(message = "La venta debe tener al menos un pago")
    @Valid
    List<PagoDTO> pagos,
    
    @PositiveOrZero(message = "El descuento debe ser positivo o cero")
    BigDecimal descuento,
    
    String nota,
    String canal
) {
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
