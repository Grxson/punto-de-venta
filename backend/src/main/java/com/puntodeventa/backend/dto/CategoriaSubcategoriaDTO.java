package com.puntodeventa.backend.dto;

/**
 * Subcategoría de producto, es decir, un grupo intermedio dentro de una categoría.
 *
 * <p>El identificador de la categoría padre viaja en la ruta del endpoint, no en el cuerpo,
 * por eso {@code categoriaId} solo se completa en las respuestas.
 *
 * @param id          identificador de la subcategoría; {@code null} al crearla
 * @param categoriaId categoría a la que pertenece
 * @param nombre      nombre de la subcategoría
 * @param descripcion detalle de la subcategoría
 * @param orden       posición dentro de la categoría padre
 * @param activa      si la subcategoría está habilitada
 */
public record CategoriaSubcategoriaDTO(
        Long id,
        Long categoriaId,
        String nombre,
        String descripcion,
        Integer orden,
        Boolean activa
) {}
