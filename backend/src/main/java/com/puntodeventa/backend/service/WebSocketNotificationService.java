package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.WebSocketMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Servicio para enviar notificaciones en tiempo real a través de WebSocket.
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);
    
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Enviar notificación a todos los clientes suscritos a un tema.
     */
    public void broadcast(String destino, WebSocketMessage mensaje) {
        try {
            messagingTemplate.convertAndSend(destino, mensaje);
            logger.debug("Notificación enviada a {}: {}", destino, mensaje.tipo());
        } catch (Exception e) {
            logger.error("Error enviando notificación WebSocket a {}: {}", destino, e.getMessage());
        }
    }

    /**
     * Enviar notificación a un usuario específico.
     */
    public void sendToUser(String usuario, String destino, WebSocketMessage mensaje) {
        try {
            messagingTemplate.convertAndSendToUser(usuario, destino, mensaje);
            logger.debug("Notificación enviada a usuario {} en {}: {}", usuario, destino, mensaje.tipo());
        } catch (Exception e) {
            logger.error("Error enviando notificación WebSocket a usuario {}: {}", usuario, e.getMessage());
        }
    }

    // Métodos de conveniencia para diferentes tipos de eventos

    public void notificarProductoCreado(Long productoId, Object producto) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_CREADO",
            "producto",
            productoId,
            producto
        ));
    }

    public void notificarProductoActualizado(Long productoId, Object producto) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_ACTUALIZADO",
            "producto",
            productoId,
            producto
        ));
    }

    public void notificarProductoEliminado(Long productoId) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_ELIMINADO",
            "producto",
            productoId,
            null
        ));
    }

    public void notificarVentaCreada(Long ventaId, Object venta) {
        broadcast("/topic/ventas", new WebSocketMessage(
            "VENTA_CREADA",
            "venta",
            ventaId,
            venta
        ));
        
        // También notificar actualización de estadísticas
        notificarEstadisticasActualizadas();
    }

    public void notificarEstadisticasActualizadas() {
        broadcast("/topic/estadisticas", new WebSocketMessage(
            "ESTADISTICAS_ACTUALIZADAS",
            "estadisticas",
            null,
            null
        ));
    }

    public void notificarInventarioActualizado() {
        broadcast("/topic/inventario", new WebSocketMessage(
            "INVENTARIO_ACTUALIZADO",
            "inventario",
            null,
            null
        ));
    }
}

