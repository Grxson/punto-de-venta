package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * DTO para listado compras (vista simplificada sin items).
 * Optimizado para listas grandes.
 */
public record CompraListadoDTO(
        Long id,
        Long sucursalId,
        String sucursalNombre,
        Long proveedorId,
        String proveedorNombre,
        java.time.LocalDateTime fecha,
        BigDecimal montoTotal,
        String estado,
        String numeroFactura,
        Integer cantidadItems,
        String usuarioNombre) {
}
