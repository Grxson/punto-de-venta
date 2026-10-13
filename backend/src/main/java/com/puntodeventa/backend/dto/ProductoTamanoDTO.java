package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Tamaño disponible para un producto (por ejemplo, pequeño, mediano o grande).
 *
 * <p>Se envía como request al crear o editar un tamaño y se devuelve como response en las
 * consultas.
 *
 * @param id identificador del tamaño; {@code null} al crearlo
 * @param nombre nombre visible del tamaño
 * @param descripcion detalle del tamaño
 * @param precioExtra importe adicional que el tamaño suma al precio base
 * @param orden posición del tamaño en el menú
 * @param activo si el tamaño está habilitado
 */
public record ProductoTamanoDTO(
    Long id,
    String nombre,
    String descripcion,
    BigDecimal precioExtra,
    Integer orden,
    Boolean activo
) {
    /**
     * @throws IllegalArgumentException si el nombre es nulo o vacío
     */
    public ProductoTamanoDTO {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del tamaño es obligatorio");
        }
    }
}
