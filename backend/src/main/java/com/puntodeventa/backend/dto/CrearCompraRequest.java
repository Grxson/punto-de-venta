package com.puntodeventa.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request para crear una nueva compra.
 * Optimizado para entrada masiva de datos.
 */
public record CrearCompraRequest(
        @NotNull(message = "La sucursal es obligatoria") Long sucursalId,

        @NotNull(message = "El proveedor es obligatorio") Long proveedorId,

        LocalDateTime fecha,

        @NotEmpty(message = "Debe agregar al menos un item") @Valid List<CompraItemRequest> items,

        String notas,

        String numeroFactura) {
}
