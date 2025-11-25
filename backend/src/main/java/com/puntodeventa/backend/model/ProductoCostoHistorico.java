package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Histórico de costos calculados para un producto.
 * Permite auditoría y análisis de evolución del margen.
 */
@Entity
@Table(name = "producto_costo_historico", indexes = {
        @Index(name = "idx_pch_producto", columnList = "producto_id"),
        @Index(name = "idx_pch_fecha", columnList = "fecha_calculo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoCostoHistorico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @PositiveOrZero(message = "El costo debe ser positivo o cero")
    @Column(name = "costo", precision = 12, scale = 4)
    private BigDecimal costo;

    @Column(name = "precio", precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name = "margen_absoluto", precision = 12, scale = 4)
    private BigDecimal margenAbsoluto;

    @Column(name = "margen_porcentaje", precision = 6, scale = 2)
    private BigDecimal margenPorcentaje; // % sobre precio

    @Column(name = "fecha_calculo", nullable = false)
    private LocalDateTime fechaCalculo;

    @Column(length = 100)
    private String fuente; // RECETA_RECALCULO_MANUAL, AJUSTE_MANUAL, IMPORTACION, etc.
}
