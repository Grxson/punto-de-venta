package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para ProductoAtributoOpcion
 * Representa una opción dentro de un atributo (Naranja, Zanahoria, Betabel, etc.)
 */
public record ProductoAtributoOpcionDTO(
    Long id,
    Long atributoId,
    String nombre,
    BigDecimal precioExtra,
    Integer orden,
    Boolean activo
) {
    public ProductoAtributoOpcionDTO {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de la opción es obligatorio");
        }
    }
}
