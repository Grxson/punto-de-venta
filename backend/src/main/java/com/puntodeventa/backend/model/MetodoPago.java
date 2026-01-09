package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un método de pago (efectivo, tarjeta, transferencia).
 */
@Entity
@Table(name = "metodos_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetodoPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del método de pago es obligatorio")
    @Column(nullable = false, length = 100, unique = true)
    private String nombre;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(name = "requiere_referencia", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean requiereReferencia = false;

    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;

    @Column(columnDefinition = "TEXT")
    private String descripcion;
}
