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
 *
 * Representa el costo periódico del personal de una sucursal. Igual que los
 * gastos indirectos, no registra un importe por cada pago: declara el costo
 * por periodo y el prorrateo lo reparte entre los productos vendidos.
 */
@Entity
@Table(name = "mano_obra")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManoObra {

    /** Identificador único del registro de mano de obra. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** many-to-one obligatorio a la sucursal que asume el costo del personal. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** many-to-one opcional al usuario que ocupa el puesto; es null si el registro aplica a un puesto genérico. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    /** Puesto del personal; ej: Gerente, Cajero, Preparador. */
    @Column(nullable = false, length = 100)
    private String puesto; // ej: Gerente, Cajero, Preparador

    /** Sueldo mensual del puesto; aplica cuando el periodo es MENSUAL o SEMANAL. */
    @Column(name = "salario_mensual", precision = 12, scale = 2)
    private BigDecimal salarioMensual;

    /** Pago por turno trabajado; aplica cuando el periodo es POR_TURNO. */
    @Column(name = "pago_por_turno", precision = 12, scale = 2)
    private BigDecimal pagoPorTurno;

    /** Periodicidad del pago que determina cómo se prorratea el costo: MENSUAL, SEMANAL o POR_TURNO. */
    @Column(length = 20)
    private String periodo; // MENSUAL, SEMANAL, POR_TURNO

    /** Si es false, el registro deja de prorratearse sin borrar su histórico. */
    @Column(name = "activo", nullable = false)
    @Convert(converter = NumericBooleanConverter.class)
    private Boolean activo = true;

    /** Fecha de alta del registro. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
