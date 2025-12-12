package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para Gasto Indirecto (servicios, renta, mantenimiento, etc.)
 * Estos gastos se prorratean entre los productos vendidos
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
