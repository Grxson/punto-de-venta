package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Producto tal como se ofrece en una sucursal concreta.
 *
 * <p>Es el response del endpoint de catálogo por sucursal: expone el precio efectivo de la
 * sucursal, que puede diferir del precio base, y las reglas de disponibilidad local.
 *
 * @param id identificador del producto en la sucursal
 * @param nombre nombre visible del producto
 * @param descripcion detalle del producto
 * @param categoriaNombre nombre de la categoría a la que pertenece
 * @param precio precio base del producto
 * @param precioEfectivo precio vigente en esta sucursal, que puede diferir del base
 * @param sku código interno de inventario
 * @param ordenVisualizacion posición del producto en el menú de la sucursal
 * @param disponible disponibilidad local: 1 indica disponible y 0 no disponible
 * @param productoBase si el producto es un producto base con variantes
 * @param productoBaseId producto del que deriva esta variante, si aplica
 * @param nombreVariante nombre de la variante, si aplica
 * @param horarioDisponibilidad franja horaria en la que se ofrece el producto
 * @param diasDisponibilidad días en los que se ofrece el producto
 * @param notas observaciones sobre el producto en la sucursal
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
    Integer disponible,  // 1 = disponible, 0 = no disponible
    Boolean productoBase,
    Long productoBaseId,
    String nombreVariante,
    String horarioDisponibilidad,
    String diasDisponibilidad,
    String notas
) {}
