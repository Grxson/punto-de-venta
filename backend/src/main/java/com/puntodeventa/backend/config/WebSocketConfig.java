package com.puntodeventa.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración de WebSocket con STOMP para actualizaciones en tiempo real.
 * 
 * Endpoints:
 * - Conexión WebSocket: /ws
 * - Destinos de suscripción: /topic/* (broadcast) y /user/* (privado)
 * - Destinos de envío: /app/* (mensajes del cliente al servidor)
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Habilitar un broker simple en memoria para mensajes
        // En producción, considerar usar RabbitMQ o Redis para múltiples instancias
        config.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Prefijo para mensajes que van del cliente al servidor
        config.setApplicationDestinationPrefixes("/app");
        
        // Prefijo para mensajes privados al usuario
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint para conexión WebSocket
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permitir todos los orígenes (ajustar en producción)
                .withSockJS(); // Fallback para navegadores que no soportan WebSocket nativo
    }
}

