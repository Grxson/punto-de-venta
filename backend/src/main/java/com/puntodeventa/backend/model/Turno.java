package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Turno de caja: apertura/cierre con usuario responsable.
 * Creada en la Auditoría 2026-09-11 (A5/T1.4) para reemplazar el SQL nativo
 * con fallback silencioso de VentaService.
 *
 * Delimita el periodo de operación de una caja: mientras el turno está activo,
 * las ventas de esa caja se imputan a su responsable.
 */
@Entity
@Table(name = "turnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turno {

    /** Identificador único del turno. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Sucursal donde se abre el turno; many-to-one obligatorio. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Caja que se opera durante el turno; many-to-one obligatorio. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caja_id", nullable = false)
    private Caja caja;

    /** Usuario que abrió el turno; queda sin valor si el cierre se registra sin responsable conocido. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id_apertura")
    private Usuario usuarioApertura;

    /** Momento de apertura; inmutable porque define el inicio del periodo. */
    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    /** Usuario que cerró el turno; es null mientras el turno sigue abierto. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id_cierre")
    private Usuario usuarioCierre;

    /** Momento de cierre; es null mientras el turno sigue abierto. */
    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    /** Si es true, el turno sigue abierto y admite ventas; al cerrarlo pasa a false. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;
}