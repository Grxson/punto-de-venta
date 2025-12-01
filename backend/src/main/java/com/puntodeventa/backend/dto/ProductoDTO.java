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
                String nombreVariante,
                Integer ordenVariante,
                List<VarianteDTO> variantes) {
        /**
         * DTO para variantes de producto
         */
        public record VarianteDTO(
                        Long id,
                        String nombre,
                        String nombreVariante,
                        BigDecimal precio,
                        Integer ordenVariante) {
        }
}
