package com.puntodeventa.backend.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un proveedor de ingredientes.
 *
 * Alimenta las compras: es la contraparte que factura los insumos que luego
 * entran al inventario.
 */
@Entity
@Table(name = "proveedores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {

    /** Identificador único del proveedor. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Razón social o nombre comercial del proveedor. */
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;

    /** Persona de contacto en el proveedor. */
    @Column(length = 200)
    private String contacto;

    /** Teléfono de contacto del proveedor. */
    @Column(length = 20)
    private String telefono;

    /** Correo de contacto para pedidos y facturación. */
    @Email(message = "El email debe ser válido")
    @Column(length = 100)
    private String email;

    /** Si es false, el proveedor deja de ofrecerse en compras sin borrar su historial. */
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean activo = true;
}