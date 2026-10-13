package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Opción elegible dentro de un atributo de producto, por ejemplo un sabor o un ingrediente
 * concreto.
 *
 * <p>Viaja como parte del request de creación o edición de un producto y se devuelve como
 * response al consultarlo.
 *
 * @param id identificador de la opción; {@code null} al crearla
 * @param atributoId atributo al que pertenece la opción
 * @param nombre nombre visible de la opción
 * @param precioExtra importe adicional que la opción suma al precio del producto
 * @param orden posición de la opción dentro del atributo
 * @param activo si la opción está habilitada
 */
public record ProductoAtributoOpcionDTO(
    Long id,
    Long atributoId,
    String nombre,
    BigDecimal precioExtra,
    Integer orden,
    Boolean activo
) {
    /**
     * @throws IllegalArgumentException si el nombre es nulo o vacío
     */
    public ProductoAtributoOpcionDTO {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre de la opción es obligatorio");
        }
    }
}
