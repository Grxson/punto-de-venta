package com.puntodeventa.backend.dto;

import java.util.List;

/**
 * Respuesta paginada de historial de costos de un producto.
 */
public record ProductoCostoHistoricoPageDTO(
        Long productoId,
        int pagina,
        int tamano,
        long totalElementos,
        int totalPaginas,
        List<ProductoCostoHistoricoDTO> datos
) {}
