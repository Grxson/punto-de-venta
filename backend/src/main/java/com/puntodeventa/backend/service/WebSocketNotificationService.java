package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.WebSocketMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Servicio de publicación de notificaciones en tiempo real vía STOMP.
 * Centraliza el formato del mensaje para que los suscriptores de los distintos
 * temas no dependan del código que origina el evento.
 *
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Service
public class WebSocketNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketNotificationService.class);
    
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * @param messagingTemplate Plantilla de mensajería inyectada por Spring.
     */
    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Publica un mensaje en un destino para todos los clientes suscritos.
     * Los fallos de envío se registran pero no se propagan: una notificación
     * perdida nunca debe abortar la operación de negocio que la originó.
     *
     * @param destino Destino de STOMP, por ejemplo {@code /topic/productos}.
     * @param mensaje Mensaje a publicar.
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
     * Publica un mensaje dirigido a un único usuario.
     * El error se absorbe por la misma razón que en {@link #broadcast}.
     *
     * @param usuario Destinatario del mensaje.
     * @param destino Destino de STOMP.
     * @param mensaje Mensaje a publicar.
     */
    public void sendToUser(String usuario, String destino, WebSocketMessage mensaje) {
        try {
            messagingTemplate.convertAndSendToUser(usuario, destino, mensaje);
            logger.debug("Notificación enviada a usuario {} en {}: {}", usuario, destino, mensaje.tipo());
        } catch (Exception e) {
            logger.error("Error enviando notificación WebSocket a usuario {}: {}", usuario, e.getMessage());
        }
    }

    // métodos de conveniencia para los distintos eventos de negocio

    /**
     * Notifica la creación de un producto a los suscriptores del catálogo.
     *
     * @param productoId Identificador del producto creado.
     * @param producto   Representación del producto ya serializada.
     */
    public void notificarProductoCreado(Long productoId, Object producto) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_CREADO",
            "producto",
            productoId,
            producto
        ));
    }

    /**
     * Notifica la actualización de un producto a los suscriptores del catálogo.
     *
     * @param productoId Identificador del producto actualizado.
     * @param producto   Representación del producto ya serializada.
     */
    public void notificarProductoActualizado(Long productoId, Object producto) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_ACTUALIZADO",
            "producto",
            productoId,
            producto
        ));
    }

    /**
     * Notifica la eliminación de un producto a los suscriptores del catálogo.
     * El cuerpo del mensaje queda vacío porque el recurso ya no existe y el
     * cliente solo necesita el identificador para retirarlo de su caché.
     *
     * @param productoId Identificador del producto eliminado.
     */
    public void notificarProductoEliminado(Long productoId) {
        broadcast("/topic/productos", new WebSocketMessage(
            "PRODUCTO_ELIMINADO",
            "producto",
            productoId,
            null
        ));
    }

    /**
     * Notifica una venta recién registrada.
     * Se encadena además la actualización de estadísticas porque el tablero de
     * indicadores depende de ese evento.
     *
     * @param ventaId Identificador de la venta.
     * @param venta   Representación de la venta ya serializada.
     */
    public void notificarVentaCreada(Long ventaId, Object venta) {
        broadcast("/topic/ventas", new WebSocketMessage(
            "VENTA_CREADA",
            "venta",
            ventaId,
            venta
        ));
        
        // Las estadísticas derivan de las ventas: se avisa sin cuerpo porque el
        // cliente recalcula contra la API en lugar de recibir el agregado.
        notificarEstadisticasActualizadas();
    }

    /**
     * Notifica que los agregados de estadísticas quedaron obsoletos.
     */
    public void notificarEstadisticasActualizadas() {
        broadcast("/topic/estadisticas", new WebSocketMessage(
            "ESTADISTICAS_ACTUALIZADAS",
            "estadisticas",
            null,
            null
        ));
    }

    /**
     * Notifica que el inventario cambió y debe recargarse.
     */
    public void notificarInventarioActualizado() {
        broadcast("/topic/inventario", new WebSocketMessage(
            "INVENTARIO_ACTUALIZADO",
            "inventario",
            null,
            null
        ));
    }
}

