package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Mano de obra: sueldos, salarios o pagos por turno del personal.
 *
 * <p>Se usa como request al crear o actualizar el registro y como response al consultarlo.
 * El importe se prorratea entre los productos vendidos para calcular su costo.
 *
 * @param id identificador del registro; {@code null} al crearlo
 * @param sucursalId sucursal que asume el costo
 * @param sucursalNombre nombre de esa sucursal
 * @param usuarioId usuario al que corresponde el pago
 * @param usuarioNombre nombre de ese usuario
 * @param puesto puesto del trabajador (por ejemplo: Gerente, Cajero, Preparador)
 * @param salarioMensual salario mensual del trabajador
 * @param pagoPorTurno importe pagado por turno cuando el esquema no es mensual
 * @param periodo forma de pago ({@code MENSUAL}, {@code SEMANAL}, {@code POR_TURNO})
 * @param activo si el registro entra en el cálculo de costos
 * @param createdAt momento de creación del registro
 * @param updatedAt momento de la última modificación
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManoObraDTO {
    
    private Long id;
    
    private Long sucursalId;
    
    private String sucursalNombre;
    
    private Long usuarioId;
    
    private String usuarioNombre;
    
    private String puesto; // ej: Gerente, Cajero, Preparador
    
    private BigDecimal salarioMensual;
    
    private BigDecimal pagoPorTurno;
    
    private String periodo; // MENSUAL, SEMANAL, POR_TURNO
    
    private Boolean activo;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
