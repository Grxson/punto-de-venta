package com.puntodeventa.backend.dto;

/**
 * Respuesta del inicio de sesión exitoso.
 *
 * <p>Es el response del endpoint de autenticación: entrega el token que el cliente debe
 * adjuntar en las peticiones siguientes y los datos del usuario autenticado.
 *
 * @param token token de sesión con el que el cliente se autentica en el resto de llamadas
 * @param usuario datos del usuario que inició sesión
 * @param mensaje texto informativo para mostrar al usuario
 */
public record LoginResponse(
    String token,
    UsuarioDTO usuario,
    String mensaje
) {}
