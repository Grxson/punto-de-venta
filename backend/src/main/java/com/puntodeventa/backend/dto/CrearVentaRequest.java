package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * DTO para crear una nueva venta (POST).
 */
public record CrearVentaRequest(
    Long sucursalId,
    Long cajaId,
    
    @NotEmpty(message = "La venta debe tener al menos un item")
    @Valid
    List<VentaItemDTO> items,
    
    @NotEmpty(message = "La venta debe tener al menos un pago")
    @Valid
    List<PagoDTO> pagos,
    
    String nota,
    String canal
) {
    // Constructor compacto para valores por defecto
    public CrearVentaRequest {
        if (canal == null || canal.isBlank()) {
            canal = "POS";
        }
    }
}
