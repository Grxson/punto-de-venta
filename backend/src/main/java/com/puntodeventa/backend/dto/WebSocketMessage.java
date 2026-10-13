package com.puntodeventa.backend.dto;

import java.time.LocalDateTime;

/**
 * Mensaje difundido por WebSocket a los clientes conectados.
 *
 * <p>Es el payload de las notificaciones en tiempo real: avisa a los clientes de cambios en
 * productos, ventas o estadísticas para que refresquen su vista sin recargar.
 *
 * @param tipo tipo de evento (por ejemplo, {@code PRODUCTO_CREADO}, {@code VENTA_CREADA},
 *             {@code ESTADISTICAS_ACTUALIZADAS})
 * @param entidad entidad afectada ({@code producto}, {@code venta}, {@code estadisticas})
 * @param entidadId identificador de la entidad afectada
 * @param datos contenido del evento, específico de cada tipo
 * @param timestamp momento en que se generó el mensaje
 */
public record WebSocketMessage(
    String tipo, // PRODUCTO_CREADO, PRODUCTO_ACTUALIZADO, PRODUCTO_ELIMINADO, VENTA_CREADA, ESTADISTICAS_ACTUALIZADAS
    String entidad, // producto, venta, estadisticas
    Long entidadId, // ID de la entidad afectada
    Object datos, // Datos específicos del evento
    LocalDateTime timestamp
) {
    /**
     * Crea el mensaje sellando la hora actual como {@code timestamp}.
     */
    public WebSocketMessage(String tipo, String entidad, Long entidadId, Object datos) {
        this(tipo, entidad, entidadId, datos, LocalDateTime.now());
    }
}

