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
 */
@Entity
@Table(name = "turnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Turno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "caja_id", nullable = false)
    private Caja caja;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id_apertura")
    private Usuario usuarioApertura;

    @Column(name = "fecha_apertura", nullable = false, updatable = false)
    private LocalDateTime fechaApertura;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id_cierre")
    private Usuario usuarioCierre;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;
}