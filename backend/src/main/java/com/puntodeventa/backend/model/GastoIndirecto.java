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
 * Entidad para Gastos Indirectos (servicios, renta, mantenimiento, etc.)
 * Estos gastos se prorratean entre los productos vendidos
 *
 * A diferencia de {@link Gasto}, aquí no se registra un importe por cada
 * evento: se declara un costo periódico por concepto y el prorrateo lo reparte
 * entre los productos vendidos en el periodo.
 */
@Entity
@Table(name = "gastos_indirectos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GastoIndirecto {

    /** Identificador único del concepto de gasto indirecto. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** many-to-one obligatorio a la sucursal que soporta el costo. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Nombre del concepto; ej: Luz, Agua, Renta, Internet */
    @Column(nullable = false, length = 100)
    private String nombre; // ej: Luz, Agua, Renta, Internet

    /** Detalle del concepto y de su cálculo. */
    @Column(length = 500)
    private String descripcion;

    /** Importe mensual estimado del concepto. */
    @Column(name = "monto_mensual", precision = 12, scale = 2)
    private BigDecimal montoMensual;

    /** Importe semanal estimado del concepto. */
    @Column(name = "monto_semanal", precision = 12, scale = 2)
    private BigDecimal montoSemanal;

    /** Importe diario estimado del concepto. */
    @Column(name = "monto_diario", precision = 12, scale = 2)
    private BigDecimal montoDiario;

    /** Si es false, el concepto deja de prorratearse sin borrar su histórico. */
    @Column(name = "activo", nullable = false)
    @Convert(converter = NumericBooleanConverter.class)
    private Boolean activo = true;

    /** Fecha de alta del concepto. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}