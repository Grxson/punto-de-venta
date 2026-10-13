package com.puntodeventa.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Menú de venta con los productos distribuidos en una grilla.
 *
 * <p>Es el response del endpoint que arma la cuadrícula del punto de venta, indicando en
 * qué fila y columna se pintó cada producto.
 *
 * <p>⚠️ IMPORTANTE - Campo "posiciones":
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
 *
 * @param columnasGrid número de columnas de la grilla
 * @param posiciones ubicación de cada producto en la grilla; su estructura depende de si el
 *                   menú está agrupado por categoría
 * @param productos productos que componen el menú, ordenados por popularidad
 * @param timestamp momento en que se generó la grilla
 */
public record MenuGrillaDTO(
                int columnasGrid,

                @JsonProperty("posiciones") Object posiciones, // Map<Long, GridPosition> o Map<String, Map<Long,
                                                               // GridPosition>>

                List<ProductoPopularidadDTO> productos,
                String timestamp) {
}
