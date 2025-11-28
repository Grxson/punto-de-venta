package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entidad que representa un proveedor de ingredientes.
 */
@Entity
@Table(name = "proveedores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(length = 200)
    private String contacto;
    
    @Column(length = 20)
    private String telefono;
    
    @Email(message = "El email debe ser válido")
    @Column(length = 100)
    private String email;
    
    @Column(nullable = false, columnDefinition = "INTEGER DEFAULT 1")
    @Builder.Default
    private Boolean activo = true;
}
