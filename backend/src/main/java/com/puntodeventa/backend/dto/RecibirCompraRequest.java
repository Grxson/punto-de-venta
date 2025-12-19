package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Request para marcar compra como recibida.
 * Auditoria: permite confirmar cantidades recibidas vs ordenadas.
 */
public record RecibirCompraRequest(
        @NotEmpty(message = "Debe confirmar al menos un item recibido") @Valid List<RecibirItemRequest> items) {
}
