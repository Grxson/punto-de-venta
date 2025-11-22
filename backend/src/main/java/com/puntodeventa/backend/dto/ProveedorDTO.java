package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO para Proveedor.
 */
public record ProveedorDTO(
    Long id,
    
    @NotBlank(message = "El nombre del proveedor es obligatorio")
    String nombre,
    
    String contacto,
    String telefono,
    
    @Email(message = "El email debe ser válido")
    String email,
    
    Boolean activo
) {}
