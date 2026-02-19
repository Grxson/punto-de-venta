package com.puntodeventa.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO que contiene el menú con productos distribuidos en grilla.
 * 
 * ⚠️ IMPORTANTE - Campo "posiciones":
 * - Cuando porCategoria=false: Object es Map<Long, GridPosition> ({productoId
 * -> {fila, col}})
 * - Cuando porCategoria=true: Object es Map<String, Map<Long, GridPosition>>
 * ({categoria -> {productoId -> {fila, col}}})
 * 
 * Se usa Object para evitar que Jackson genere LinkedHashMap con tipo genérico
 * <?>
 * que causa: "No converter for [class java.util.LinkedHashMap] with preset
 * Content-Type 'application/javascript'"
 * 
 * Jackson serializa correctamente a JSON (nunca application/javascript).
 */
public record MenuGrillaDTO(
                int columnasGrid,

                @JsonProperty("posiciones") Object posiciones, // Map<Long, GridPosition> o Map<String, Map<Long,
                                                               // GridPosition>>

                List<ProductoPopularidadDTO> productos,
                String timestamp) {
}
