package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * DTO para actualizar una venta existente (PUT).
 */
public record ActualizarVentaRequest(
    Long sucursalId,
    
    @NotEmpty(message = "La venta debe tener al menos un item")
    @Valid
    List<VentaItemDTO> items,
    
    @NotEmpty(message = "La venta debe tener al menos un pago")
    @Valid
    List<PagoDTO> pagos,
    
    String nota,
    String fecha,
    String canal
) {
    // Constructor compacto para valores por defecto
    public ActualizarVentaRequest {
        if (canal == null || canal.isBlank()) {
            canal = "POS";
        }
    }
}

