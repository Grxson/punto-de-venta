package com.puntodeventa.backend.dto;
import jakarta.validation.constraints.*;

/**
 * Cuerpo de la petición de alta de un usuario.
 *
 * <p>Se usa tanto en el registro público inicial como en la creación de usuarios desde el
 * panel de administración. La respuesta es un {@link UsuarioDTO}.
 *
 * @param nombre    nombre de pila del usuario
 * @param apellido  apellido del usuario
 * @param email     correo institucional
 * @param username  nombre de acceso, entre 3 y 50 caracteres
 * @param password  contraseña en texto plano; el servicio la aplica el hash antes de
 *                  almacenarla y nunca la devuelve en las respuestas
 * @param rolId     rol asignado, que determina los permisos del usuario
 * @param sucursalId sucursal a la que queda asignado el usuario
 */
public record CrearUsuarioRequest(
    @NotBlank(message = "El nombre es requerido")
    String nombre,

    @NotBlank(message = "El apellido es requerido")
    String apellido,

    @Email(message = "El email debe ser válido")
    String email,

    @NotBlank(message = "El username es requerido")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    String username,

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    String password,

    @NotNull(message = "El rol es requerido")
    Long rolId,

    @NotNull(message = "La sucursal es requerida")
    Long sucursalId
) {}
