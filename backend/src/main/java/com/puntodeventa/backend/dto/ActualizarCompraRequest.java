package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cuerpo de la petición PUT para modificar una compra que aún no fue recibida.
 *
 * <p>Solo se admiten compras en estado {@code pendiente}: una vez recibida, el stock ya
 * fue descontado por el inventario y el monto se consumió en la contabilidad, por lo que el
 * servicio rechaza la edición.
 *
 * @param fecha        nueva fecha de la compra; si es {@code null} se conserva la existente
 * @param items        líneas de la compra a reemplazar por completo (no es un merge parcial)
 * @param notas        observaciones internas de la compra
 * @param numeroFactura número de factura del proveedor
 */
public record ActualizarCompraRequest(
        LocalDateTime fecha,

        @Valid List<CompraItemRequest> items,

        String notas,

        String numeroFactura) {
}
