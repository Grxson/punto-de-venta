package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Proveedor de ingredientes o servicios.
 *
 * <p>Se envía como request al crear o editar un proveedor y se devuelve como response en
 * las consultas de abastecimiento.
 *
 * @param id identificador del proveedor; {@code null} al crearlo
 * @param nombre nombre o razón social del proveedor
 * @param contacto nombre de la persona de contacto
 * @param telefono teléfono del proveedor
 * @param email correo de contacto del proveedor
 * @param activo si el proveedor sigue disponible para nuevas compras
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
