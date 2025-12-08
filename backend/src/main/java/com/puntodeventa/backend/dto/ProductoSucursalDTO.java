package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para respuesta de producto disponible en una sucursal.
 * Incluye información del precio efectivo (pudiendo ser diferente al precio base).
 */
public record ProductoSucursalDTO(
    Long id,
    String nombre,
    String descripcion,
    String categoriaNombre,
    BigDecimal precio,
    BigDecimal precioEfectivo,  // Precio en esta sucursal (puede ser diferente)
    String sku,
    Integer ordenVisualizacion,
    Boolean disponible,
    Boolean productoBase,
    Long productoBaseId,
    String nombreVariante,
    String horarioDisponibilidad,
    String diasDisponibilidad,
    String notas
) {}
