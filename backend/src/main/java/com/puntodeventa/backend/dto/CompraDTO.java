package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para Compra - Vista completa con items.
 */
public record CompraDTO(
        Long id,

        @NotNull(message = "La sucursal es obligatoria") Long sucursalId,

        String sucursalNombre,

        @NotNull(message = "El proveedor es obligatorio") Long proveedorId,

        String proveedorNombre,

        LocalDateTime fecha,

        @NotNull(message = "El monto total es obligatorio") @PositiveOrZero(message = "El monto total debe ser >= 0") BigDecimal montoTotal,

        String estado, // pendiente, recibida, cancelada, rechazada

        String notas,

        Long usuarioId,

        String usuarioNombre,

        String numeroFactura,

        LocalDateTime createdAt,

        LocalDateTime updatedAt,

        List<CompraItemDTO> items) {
}
