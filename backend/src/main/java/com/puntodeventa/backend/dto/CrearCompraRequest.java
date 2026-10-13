package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Cuerpo de la petición POST para registrar una compra a proveedor.
 *
 * <p>Está pensado para carga masiva: el cliente envía la compra completa en una sola
 * llamada, con todas sus líneas. La compra nace en estado {@code pendiente}; el stock del
 * inventario solo se mueve cuando la compra pasa a {@code recibida}.
 *
 * @param sucursalId    sucursal que recibe la mercadería
 * @param proveedorId   proveedor al que se le compró
 * @param fecha         fecha de la compra; si se omite se toma la fecha actual
 * @param items         líneas de la compra, al menos una
 * @param notas         observaciones internas de la compra
 * @param numeroFactura número de factura emitido por el proveedor
 */
public record CrearCompraRequest(
        @NotNull(message = "La sucursal es obligatoria") Long sucursalId,

        @NotNull(message = "El proveedor es obligatorio") Long proveedorId,

        LocalDateTime fecha,

        @NotEmpty(message = "Debe agregar al menos un item") @Valid List<CompraItemRequest> items,

        String notas,

        String numeroFactura) {
}
