package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para gastos operativos.
 */
public record GastoDTO(
        Long id,
        Long categoriaGastoId,
        String categoriaGastoNombre,
        Long proveedorId,
        String proveedorNombre,
        Long sucursalId,
        String sucursalNombre,
        BigDecimal monto,
        LocalDateTime fecha,
        Long metodoPagoId,
        String metodoPagoNombre,
        String referencia,
        String nota,
        String comprobanteUrl,
        Long usuarioId,
        String usuarioNombre,
        LocalDateTime createdAt
) {}

