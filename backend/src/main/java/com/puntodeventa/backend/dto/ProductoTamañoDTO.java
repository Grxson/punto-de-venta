package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para ProductoTamaño
 * Representa un tamaño disponible para un producto (Pequeño, Mediano, Grande)
 */
public record ProductoTamañoDTO(
    Long id,
    String nombre,
    String descripcion,
    BigDecimal precioExtra,
    Integer orden,
    Boolean activo
) {
    public ProductoTamañoDTO {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del tamaño es obligatorio");
        }
    }
}
