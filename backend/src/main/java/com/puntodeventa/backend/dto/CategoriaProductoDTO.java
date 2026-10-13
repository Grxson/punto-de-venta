package com.puntodeventa.backend.dto;

/**
 * Categoría de producto (grupo del menú al que pertenecen los productos).
 *
 * <p>Se recibe en los endpoints de creación y actualización de categorías, y se devuelve
 * en las consultas.
 *
 * @param id          identificador de la categoría; {@code null} al crearla
 * @param nombre      nombre de la categoría
 * @param descripcion detalle de la categoría
 * @param activa      si la categoría está habilitada para operar
 * @param orden       posición de la categoría en la grilla del menú
 */
public record CategoriaProductoDTO(
                Long id,
                String nombre,
                String descripcion,
                Boolean activa,
                Integer orden) {
}
