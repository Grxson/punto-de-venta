package com.puntodeventa.backend.dto;

/**
 * DTO (record) para transferencia de datos de Categoría de Producto.
 */
public record CategoriaProductoDTO(
                Long id,
                String nombre,
                String descripcion,
                Boolean activa,
                Integer orden) {
}
