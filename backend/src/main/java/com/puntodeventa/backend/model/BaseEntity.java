package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Clase base abstracta para todas las entidades del sistema.
 * 
 * Proporciona campos comunes de auditoría:
 * - id: Identificador único
 * - createdAt: Fecha de creación
 * - updatedAt: Fecha de última actualización
 * 
 * Usa Lombok para reducir boilerplate code (compatible con Java 21).
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Método auxiliar para verificar si la entidad es nueva.
     * 
     * @return true si la entidad no tiene ID asignado
     */
    public boolean isNew() {
        return this.id == null;
    }
}
