package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para ProductoAtributo
 * Representa un atributo de un producto (Ingrediente, Salsa, Complemento, etc.)
 */
public record ProductoAtributoDTO(
    Long id,
    Long productoId,
    String nombre,
    String tipo,  // SIMPLE o MULTIPLE
    Boolean requerido,
    Integer orden,
    Boolean activo,
    List<ProductoAtributoOpcionDTO> opciones
) {
    public ProductoAtributoDTO {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del atributo es obligatorio");
        }
        // Validación: tipo debe ser SIMPLE o MULTIPLE
        if (tipo == null || (!tipo.equals("SIMPLE") && !tipo.equals("MULTIPLE"))) {
            throw new IllegalArgumentException("El tipo debe ser SIMPLE o MULTIPLE");
        }
    }
}
