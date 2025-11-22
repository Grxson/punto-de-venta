package com.puntodeventa.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El username es requerido")
    String username,

    @NotBlank(message = "La contraseña es requerida")
    String password
) {}