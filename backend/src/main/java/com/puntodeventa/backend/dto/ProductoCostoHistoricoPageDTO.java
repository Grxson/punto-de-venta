package com.puntodeventa.backend.dto;

import java.util.List;

/**
 * Página de resultados del historial de costos de un producto.
 *
 * <p>Es el response del endpoint de historial de costos cuando este se consulta de forma
 * paginada.
 *
 * @param productoId producto cuyo historial se consultó
 * @param pagina número de la página solicitada
 * @param tamano cantidad de elementos por página
 * @param totalElementos total de registros históricos del producto
 * @param totalPaginas total de páginas disponibles
 * @param datos registros históricos que componen la página actual
 */
public record ProductoCostoHistoricoPageDTO(
        Long productoId,
        int pagina,
        int tamano,
        long totalElementos,
        int totalPaginas,
        List<ProductoCostoHistoricoDTO> datos
) {}
