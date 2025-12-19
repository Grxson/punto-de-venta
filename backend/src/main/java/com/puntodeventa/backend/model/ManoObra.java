package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.type.NumericBooleanConverter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad para Mano de Obra (sueldos, salarios, pagos por turno, etc.)
 * Se prorratean entre los productos vendidos
 */
@Entity
@Table(name = "mano_obra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManoObra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @Column(nullable = false, length = 100)
    private String puesto; // ej: Gerente, Cajero, Preparador
    
    @Column(name = "salario_mensual", precision = 12, scale = 2)
    private BigDecimal salarioMensual;
    
    @Column(name = "pago_por_turno", precision = 12, scale = 2)
    private BigDecimal pagoPorTurno;
    
    @Column(length = 20)
    private String periodo; // MENSUAL, SEMANAL, POR_TURNO
    
    @Column(name = "activo", nullable = false)
    @Convert(converter = NumericBooleanConverter.class)
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
