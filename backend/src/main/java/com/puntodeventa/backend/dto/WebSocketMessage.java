package com.puntodeventa.backend.dto;

import java.time.LocalDateTime;

/**
 * DTO para mensajes WebSocket.
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
public record WebSocketMessage(
    String tipo, // PRODUCTO_CREADO, PRODUCTO_ACTUALIZADO, PRODUCTO_ELIMINADO, VENTA_CREADA, ESTADISTICAS_ACTUALIZADAS
    String entidad, // producto, venta, estadisticas
    Long entidadId, // ID de la entidad afectada
    Object datos, // Datos específicos del evento
    LocalDateTime timestamp
) {
    public WebSocketMessage(String tipo, String entidad, Long entidadId, Object datos) {
        this(tipo, entidad, entidadId, datos, LocalDateTime.now());
    }
}

