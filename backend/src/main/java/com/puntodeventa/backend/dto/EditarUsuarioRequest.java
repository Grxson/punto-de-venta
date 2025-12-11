package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

public record EditarUsuarioRequest(
        @NotBlank(message = "El nombre es requerido") String nombre,

        @NotBlank(message = "El apellido es requerido") String apellido,

        @Email(message = "El email debe ser válido") String email,

        @NotBlank(message = "El username es requerido") @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres") String username,

        // Password es opcional al editar - permite vacío o null, valida si tiene
        // contenido
        @Nullable @Size(min = 8, max = 100, message = "Si proporciona contraseña, debe tener entre 8 y 100 caracteres") String password,

        @NotNull(message = "El rol es requerido") Long rolId,

        @NotNull(message = "La sucursal es requerida") Long sucursalId) {
}
