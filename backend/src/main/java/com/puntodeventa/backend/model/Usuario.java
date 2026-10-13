package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad que representa a un operador del sistema.
 *
 * Es la identidad con la que se autentica y con la que se auditan las
 * operaciones: cada usuario pertenece a una sola sucursal y a un solo rol, de
 * modo que los permisos y los datos visibles quedan acotados desde la base.
 *
 * No extiende {@link BaseEntity} porque mantiene sus propias marcas de tiempo
 * en zona horaria local en lugar de instantes en UTC.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {
    /** Identificador único del usuario. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre de pila del usuario. */
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Apellido del usuario. */
    @Column(nullable = false, length = 100)
    private String apellido;

    /** Correo institucional; es único y sirve para notificaciones. */
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    /** Credencial de acceso al punto de venta; es única dentro del sistema. */
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    /** Hash de la contraseña del usuario; nunca se almacena en texto plano. */
    @Column(nullable = false)
    private String password;

    /** Si es false, el usuario conserva su histórico pero no puede iniciar sesión. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    private Boolean activo = true;

    /** Rol que define los permisos del usuario; many-to-one obligatorio y de carga anticipada (EAGER). */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;

    /** Sucursal a la que está asignado el usuario; delimita los datos que puede ver y registrar. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    /** Fecha del último inicio de sesión exitoso; sirve para detectar cuentas inactivas. */
    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    /** Fecha de alta del usuario en el sistema; no se modifica. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Fecha de la última modificación del usuario. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

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

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public Sucursal getSucursal() {
        return sucursal;
    }

    public void setSucursal(Sucursal sucursal) {
        this.sucursal = sucursal;
    }

    public LocalDateTime getUltimoAcceso() {
        return ultimoAcceso;
    }

    public void setUltimoAcceso(LocalDateTime ultimoAcceso) {
        this.ultimoAcceso = ultimoAcceso;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}