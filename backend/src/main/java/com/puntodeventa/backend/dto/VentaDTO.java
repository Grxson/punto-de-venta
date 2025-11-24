package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para respuestas de venta (GET).
 */
public record VentaDTO(
    Long id,
    Long sucursalId,
    String sucursalNombre,
    LocalDateTime fecha,
    BigDecimal subtotal,
    BigDecimal total,
    BigDecimal impuestos,
    BigDecimal descuento,
    String canal,
    String estado,
    String nota,
    Long usuarioId,
    String usuarioNombre,
    List<VentaItemDTO> items,
    List<PagoDTO> pagos
) {}
