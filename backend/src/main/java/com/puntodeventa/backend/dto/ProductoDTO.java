package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Producto del catálogo, con sus variantes, tamaños y atributos configurables.
 *
 * <p>Se envía como request al crear o actualizar un producto y se devuelve como response
 * en las consultas del catálogo. Un mismo producto puede existir en varias variantes
 * (por ejemplo, por sucursal o por presentación), representadas por {@code variantes}.
 *
 * @param id identificador del producto
 * @param nombre nombre visible del producto
 * @param descripcion detalle del producto
 * @param categoriaId categoría a la que pertenece
 * @param categoriaNombre nombre de esa categoría (solo lectura)
 * @param precio precio de venta base
 * @param costoEstimado costo estimado calculado a partir de la receta
 * @param sku código interno de inventario
 * @param activo si el producto está habilitado en el sistema
 * @param disponibleEnMenu si el producto se muestra en el menú de venta
 * @param variantes variantes registradas del producto
 * @param productoBaseId producto del que deriva esta variante; {@code null} si es el base
 * @param nombreVariante nombre de la variante dentro del producto base
 * @param ordenVariante posición de la variante en el menú
 * @param tamaños tamaños disponibles para el producto
 * @param atributos atributos configurables del producto
 */
public record ProductoDTO(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precio,
        BigDecimal costoEstimado,
        String sku,
        Boolean activo,
        Boolean disponibleEnMenu,
        List<VarianteDTO> variantes,
        Long productoBaseId,
        String nombreVariante,
        Integer ordenVariante,
        List<ProductoVarianteTamanoDTO> tamaños,
        List<ProductoAtributoDTO> atributos
) {
    /**
     * Variante de un producto (por ejemplo, una presentación distinta del mismo platillo).
     *
     * @param id identificador de la variante
     * @param nombre nombre del producto de la variante
     * @param nombreVariante nombre de la variante
     * @param precio precio de venta de la variante
     * @param ordenVariante posición de la variante en el menú
     */
    public record VarianteDTO(
            Long id,
            String nombre,
            String nombreVariante,
            BigDecimal precio,
            Integer ordenVariante
    ) {}
}
