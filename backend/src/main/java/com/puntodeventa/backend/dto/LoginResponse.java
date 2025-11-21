package com.puntodeventa.backend.dto;

public record LoginResponse(
    String token,
    UsuarioDTO usuario,
    String mensaje
) {}
