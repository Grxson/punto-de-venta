package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Compra en su versión resumida, pensada para listados paginados grandes.
 *
 * <p>Omite el detalle de las líneas a propósito: se responde en las consultas paginadas de
 * compras (por página o por proveedor) para no arrastrar miles de registros hijos.
 *
 * @param id              identificador de la compra
 * @param sucursalId      sucursal receptora
 * @param sucursalNombre  nombre de esa sucursal
 * @param proveedorId     proveedor al que se le compró
 * @param proveedorNombre nombre de ese proveedor
 * @param fecha           fecha de la compra
 * @param montoTotal      importe total de la compra
 * @param estado          situación de la compra ({@code pendiente}, {@code recibida},
 *                        {@code cancelada}, {@code rechazada})
 * @param numeroFactura   número de factura del proveedor
 * @param cantidadItems   cantidad de líneas que tiene la compra
 * @param usuarioNombre   usuario que la registró
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
