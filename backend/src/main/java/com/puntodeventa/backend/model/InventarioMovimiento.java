package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidad que representa un movimiento de inventario.
 * Tipos: entrada, consumo, ajuste, merma, devolución
 */
@Entity
@Table(name = "inventario_movimientos", indexes = {
    @Index(name = "idx_inv_mov_ingrediente_fecha", columnList = "ingrediente_id, fecha"),
    @Index(name = "idx_inv_mov_tipo_fecha", columnList = "tipo, fecha")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventarioMovimiento {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "El ingrediente es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingrediente_id", nullable = false)
    private Ingrediente ingrediente;
    
    @NotBlank(message = "El tipo de movimiento es obligatorio")
    @Column(nullable = false, length = 20)
    private String tipo; // entrada, consumo, ajuste, merma, devolucion
    
    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser positiva")
    @Column(nullable = false, precision = 14, scale = 6)
    private BigDecimal cantidad;
    
    @NotNull(message = "La unidad es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_id", nullable = false)
    private Unidad unidad;
    
    @NotNull(message = "El costo unitario es obligatorio")
    @Column(name = "costo_unitario", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoUnitario;
    
    @NotNull(message = "El costo total es obligatorio")
    @Column(name = "costo_total", nullable = false, precision = 14, scale = 6)
    private BigDecimal costoTotal;
    
    @NotNull(message = "La fecha es obligatoria")
    @Column(nullable = false)
    private LocalDateTime fecha;
    
    @Column(name = "ref_tipo", length = 50)
    private String refTipo; // venta, compra, ajuste, merma
    
    @Column(name = "ref_id")
    private Long refId;
    
    @Column(length = 100)
    private String lote;
    
    private LocalDate caducidad;
    
    @Column(columnDefinition = "TEXT")
    private String nota;
}
