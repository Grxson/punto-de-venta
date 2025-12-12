package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad para Gastos Indirectos (servicios, renta, mantenimiento, etc.)
 * Estos gastos se prorratean entre los productos vendidos
 */
@Entity
@Table(name = "gastos_indirectos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoIndirecto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;
    
    @Column(nullable = false, length = 100)
    private String nombre; // ej: Luz, Agua, Renta, Internet
    
    @Column(length = 500)
    private String descripcion;
    
    @Column(name = "monto_mensual", precision = 12, scale = 2)
    private BigDecimal montoMensual;
    
    @Column(name = "monto_semanal", precision = 12, scale = 2)
    private BigDecimal montoSemanal;
    
    @Column(name = "monto_diario", precision = 12, scale = 2)
    private BigDecimal montoDiario;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
