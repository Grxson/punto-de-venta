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
        // Endpoint para conexión WebSocket con CORS
        // SockJS intenta hacer requests HTTP a /ws/info para verificar disponibilidad
        // Por eso necesitamos permitir CORS explícitamente
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                    "http://localhost:5173",           // Vite dev
                    "http://localhost:3000",           // Dev fallback
                    "http://localhost:8080",           // Backend mismo
                    "https://punto-de-venta-production-d424.up.railway.app", // Producción
                    "https://punto-de-venta-staging.up.railway.app"          // Staging
                )
                .withSockJS()                          // Fallback para navegadores sin WebSocket nativo
                .setClientLibraryUrl("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"); // CDN para SockJS
    }
}

