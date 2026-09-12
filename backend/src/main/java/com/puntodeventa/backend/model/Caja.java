package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Caja física / punto de cobro asociado a una sucursal.
 * Creada en la Auditoría 2026-09-11 (A5/T1.4) para reemplazar el SQL nativo
 * con fallback silencioso de VentaService.
 */
@Entity
@Table(name = "cajas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(nullable = false, length = 100)
    private String nombre = "Caja principal";

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activa = true;
}