package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request DTO para crear un nuevo gasto.
 */
public record CrearGastoRequest(
        Long categoriaGastoId,
        Long proveedorId,
        Long sucursalId,
        BigDecimal monto,
        LocalDateTime fecha,
        Long metodoPagoId,
        String referencia,
        String nota,
        String comprobanteUrl
) {}

