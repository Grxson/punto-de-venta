package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa un rol de acceso al sistema.
 *
 * Agrupa el conjunto de permisos que se asignan a los usuarios y permite
 * cambiar las capacidades de un grupo completo sin tocar usuario por usuario.
 */
@Entity
@Table(name = "roles")

public class Rol {
    /** Identificador único del rol. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre del rol (ej: ADMIN, CAJERO, GERENTE); es único en el sistema. */
    @Column(unique = true, nullable = false, length = 50)
    private String nombre;

    /** Descripción del alcance funcional del rol. */
    @Column(length = 255)
    private String descripcion;

    /** Si es false, el rol deja de asignarse a usuarios nuevos sin borrar su histórico. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;

    /**
     * many-to-many con Permiso, resuelta por la tabla intermedia rol_permisos.
     * Un rol concede varios permisos y un permiso puede pertenecer a varios roles.
     * Se carga de forma anticipada (EAGER) porque la autorización necesita los permisos en
     * cada petición y así se evita una consulta por rol.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "rol_permisos", joinColumns = @JoinColumn(name = "rol_id"), inverseJoinColumns = @JoinColumn(name = "permiso_id"))
    private Set<Permiso> permisos = new HashSet<>();

    /** Fecha de alta del rol. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    /** Fecha de la última modificación del rol. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Set<Permiso> getPermisos() {
        return permisos;
    }

    public void setPermisos(Set<Permiso> permisos) {
        this.permisos = permisos;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}