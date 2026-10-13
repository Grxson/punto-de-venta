package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * Cuerpo de la petición para marcar una compra como recibida.
 *
 * <p>Es el request del endpoint de recepción: permite confirmar las cantidades realmente
 * recibidas frente a las ordenadas para dejar constancia de las diferencias.
 *
 * @param items líneas de la compra con la cantidad efectivamente recibida, al menos una
 */
public record RecibirCompraRequest(
        @NotEmpty(message = "Debe confirmar al menos un item recibido") @Valid List<RecibirItemRequest> items) {
}
