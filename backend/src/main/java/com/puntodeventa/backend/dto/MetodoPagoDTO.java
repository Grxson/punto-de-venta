package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Medio de pago disponible en el sistema (efectivo, tarjeta, transferencia, etc.).
 *
 * <p>Se envía como request al crear o editar un medio de pago y se devuelve como response
 * en las consultas.
 *
 * @param id identificador del medio de pago; {@code null} al crearlo
 * @param nombre nombre visible del medio de pago
 * @param requiereReferencia si exige capturar una referencia o folio del pago
 * @param activo si el medio de pago puede usarse en nuevas ventas
 * @param descripcion detalle del medio de pago
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
