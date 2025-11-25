package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;

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
        // Campos para variantes
        Long productoBaseId,
        String nombreVariante,
        Integer ordenVariante,
        List<ProductoDTO> variantes // Lista de variantes si este es un producto base
) {
    // Constructor sin variantes para compatibilidad
    public ProductoDTO(
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
            Long productoBaseId,
            String nombreVariante,
            Integer ordenVariante
    ) {
        this(id, nombre, descripcion, categoriaId, categoriaNombre, precio, costoEstimado, sku, activo, disponibleEnMenu,
                productoBaseId, nombreVariante, ordenVariante, null);
    }
}
