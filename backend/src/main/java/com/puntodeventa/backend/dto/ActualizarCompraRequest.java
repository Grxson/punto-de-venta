package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request para actualizar una compra pendiente.
 */
public record ActualizarCompraRequest(
        LocalDateTime fecha,

        @Valid List<CompraItemRequest> items,

        String notas,

        String numeroFactura) {
}
