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
 * Clase base abstracta de la que heredan las entidades que necesitan sellos de auditoría.
 *
 * Centraliza los tres campos que todas las tablas comparten para evitar repetirlos
 * en cada entidad: identidad, fecha de creación y fecha de última actualización.
 * Los sellos los mantiene Hibernate, no la capa de servicio: no hay que asignarlos
 * manualmente al insertar ni al actualizar.
 *
 * Usa Lombok para eliminar el código repetitivo de constructores y accesores,
 * lo que mantiene las entidades compatibles con Java 21.
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

    /** Identificador único generado por la base de datos; su valor confirma que la entidad ya fue persistida. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    /** Momento exacto de la inserción; lo asigna Hibernate con @CreationTimestamp y nunca se modifica. */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Momento del último UPDATE; Hibernate lo refresca en cada modificación de la entidad. */
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    /**
     * Indica si la entidad todavía no ha sido persistida.
     *
     * Permite aplicar la misma lógica de validación antes y después del INSERT,
     * ya que Lombok genera setters que no distinguen entre entidad nueva y existente.
     *
     * @return true si la entidad aún no tiene ID asignado
     */
    public boolean isNew() {
        return this.id == null;
    }
}