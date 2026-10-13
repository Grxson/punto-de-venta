package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cuerpo de la petición de inicio de sesión.
 *
 * <p>Es el request del endpoint de autenticación: el cliente envía las credenciales y, si
 * son válidas, recibe un {@link LoginResponse} con el token y los datos del usuario.
 *
 * @param username nombre de acceso del usuario
 * @param password contraseña en texto plano, que el servicio contrasta contra el hash
 *                 almacenado
 */
public record LoginRequest(
    @NotBlank(message = "El username es requerido")
    String username,

    @NotBlank(message = "La contraseña es requerida")
    String password
) {}