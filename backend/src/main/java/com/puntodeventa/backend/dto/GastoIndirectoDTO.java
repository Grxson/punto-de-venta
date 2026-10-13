package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Gasto indirecto (servicios, renta, mantenimiento, etc.)
 * Estos gastos se prorratean entre los productos vendidos
 *
 * <p>Clase y no record porque se construye con el constructor de Lombok, al estilo del resto
 * de los DTO de configuración. Se usa como cuerpo de entrada al crear o actualizar y como
 * respuesta al consultar. Los importes van en tres escalas porque el prorrateo diario es
 * el que se aplica al costo de cada producto.
 *
 * @param id          identificador del gasto; {@code null} al crearlo
 * @param sucursalId  sucursal que asume el gasto
 * @param sucursalNombre nombre de esa sucursal
 * @param nombre      concepto del gasto (por ejemplo: Luz, Agua, Renta, Internet)
 * @param descripcion detalle del concepto
 * @param montoMensual importe estimado por mes
 * @param montoSemanal importe estimado por semana
 * @param montoDiario importe estimado por día, base del prorrateo
 * @param activo      si el gasto entra en el cálculo de costos
 * @param createdAt   momento de creación del registro
 * @param updatedAt   momento de la última modificación
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoIndirectoDTO {
    
    private Long id;
    
    private Long sucursalId;
    
    private String sucursalNombre;
    
    private String nombre; // ej: Luz, Agua, Renta, Internet
    
    private String descripcion;
    
    private BigDecimal montoMensual;
    
    private BigDecimal montoSemanal;
    
    private BigDecimal montoDiario;
    
    private Boolean activo;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
