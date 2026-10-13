package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Compra a proveedor en su vista completa, con el detalle de sus líneas.
 *
 * <p>Es la respuesta de los endpoints de creación, consulta y actualización de compras.
 * Se usa también como cuerpo de entrada en la actualización, ya que las anotaciones de
 * validación se aplican sobre el mismo tipo.
 *
 * @param id               identificador de la compra
 * @param sucursalId       sucursal que recibe la mercadería
 * @param sucursalNombre   nombre de esa sucursal (solo lectura)
 * @param proveedorId      proveedor al que se le compró
 * @param proveedorNombre  nombre de ese proveedor (solo lectura)
 * @param fecha            fecha de la compra
 * @param montoTotal       suma de los totales de las líneas; no incluye gastos de la compra
 * @param estado           situación de la compra; valores válidos {@code pendiente},
 *                         {@code recibida}, {@code cancelada}, {@code rechazada}
 * @param notas            observaciones internas de la compra
 * @param usuarioId        usuario que registró la compra
 * @param usuarioNombre    nombre de ese usuario (solo lectura)
 * @param numeroFactura    número de factura emitido por el proveedor
 * @param createdAt        momento de creación del registro
 * @param updatedAt        momento de la última modificación
 * @param items            líneas de la compra
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
