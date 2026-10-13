package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa un permiso unitario del sistema.
 *
 * Es la unidad mínima de autorización: un permiso concreto (por ejemplo,
 * anular una venta) que se asigna a los roles, y los roles a los usuarios.
 */
@Entity
@Table(name = "permisos")
public class Permiso {

    /** Identificador único del permiso. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del permiso; es único en el sistema. */
    @Column(unique = true, nullable = false, length = 100)
    private String nombre;

    /** Descripción de la acción que habilita el permiso. */
    @Column(length = 255)
    private String descripcion;

    /** Fecha de alta del permiso; no se modifica. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getCreatedAt() { return createdAt; }

}