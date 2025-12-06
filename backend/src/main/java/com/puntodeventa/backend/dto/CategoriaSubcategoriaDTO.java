package com.puntodeventa.backend.dto;

/**
 * DTO (record) para transferencia de datos de Subcategoría de Producto.
 */
public record CategoriaSubcategoriaDTO(
        Long id,
        Long categoriaId,
        String nombre,
        String descripcion,
        Integer orden,
        Boolean activa
) {}
