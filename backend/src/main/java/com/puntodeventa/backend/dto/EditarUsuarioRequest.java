package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.*;
import org.springframework.lang.Nullable;

/**
 * Cuerpo de la petición PUT para modificar un usuario existente.
 *
 * <p>A diferencia de {@link CrearUsuarioRequest}, la contraseña es opcional: si no se
 * manda, el usuario conserva la que ya tenía.
 *
 * @param nombre    nombre de pila del usuario
 * @param apellido  apellido del usuario
 * @param email     correo institucional
 * @param username  nombre de acceso, entre 3 y 50 caracteres
 * @param password  nueva contraseña; si se manda, debe tener entre 8 y 100 caracteres
 * @param rolId     rol asignado, que determina los permisos del usuario
 * @param sucursalId sucursal a la que queda asignado el usuario
 */
public record EditarUsuarioRequest(
        @NotBlank(message = "El nombre es requerido") String nombre,

        @NotBlank(message = "El apellido es requerido") String apellido,

        @Email(message = "El email debe ser válido") String email,

        @NotBlank(message = "El username es requerido") @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres") String username,

        // La contraseña es opcional al editar: puede venir vacía o nula y solo se valida
        // su longitud cuando trae contenido
        @Nullable @Size(min = 8, max = 100, message = "Si proporciona contraseña, debe tener entre 8 y 100 caracteres") String password,

        @NotNull(message = "El rol es requerido") Long rolId,

        @NotNull(message = "La sucursal es requerida") Long sucursalId) {
}
