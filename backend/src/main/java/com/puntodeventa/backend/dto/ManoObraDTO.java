package com.puntodeventa.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para Mano de Obra (sueldos, salarios, pagos por turno, etc.)
 * Se prorratean entre los productos vendidos
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
