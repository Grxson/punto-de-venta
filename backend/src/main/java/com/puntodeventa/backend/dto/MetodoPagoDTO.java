package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO para métodos de pago.
 */
public record MetodoPagoDTO(
    Long id,
    
    @NotBlank(message = "El nombre del método de pago es obligatorio")
    String nombre,
    
    Boolean requiereReferencia,
    Boolean activo,
    String descripcion
) {
    // Constructor compacto para valores por defecto
    public MetodoPagoDTO {
        if (requiereReferencia == null) {
            requiereReferencia = false;
        }
        if (activo == null) {
            activo = true;
        }
    }
}
