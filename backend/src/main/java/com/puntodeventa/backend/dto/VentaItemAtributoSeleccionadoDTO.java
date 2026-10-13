package com.puntodeventa.backend.dto;

import java.math.BigDecimal;

/**
 * Atributo u opción seleccionada en una línea de venta.
 *
 * <p>Se devuelve como parte del detalle de una venta para reconstruir las elecciones que
 * hizo el cliente (por ejemplo, el sabor o el ingrediente elegido) y el precio extra que
 * implicaron.
 *
 * @param id identificador de la selección
 * @param ventaItemId línea de venta a la que pertenece la selección
 * @param atributoId atributo al que corresponde la selección
 * @param atributoNombre nombre de ese atributo (solo lectura)
 * @param opcionId opción elegida dentro del atributo
 * @param opcionNombre nombre de esa opción (solo lectura)
 * @param valorSeleccionado valor libre capturado para el atributo, si aplica
 * @param precioExtra importe adicional que sumó la opción al precio del producto
 */
public record VentaItemAtributoSeleccionadoDTO(
    Long id,
    Long ventaItemId,
    Long atributoId,
    String atributoNombre,
    Long opcionId,
    String opcionNombre,
    String valorSeleccionado,
    BigDecimal precioExtra
) {
}
