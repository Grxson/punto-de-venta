package com.puntodeventa.backend.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuración de logging optimizado para diferentes perfiles.
 * 
 * Estrategia:
 * - DEV: Logging detallado incluyendo SQL (asincrónico)
 * - PROD: Solo warnings/errors, sin SQL logging
 * 
 * Configuración en application.properties:
 * - logging.level.org.hibernate.SQL=DEBUG (solo dev)
 * - logging.pattern.console (adaptado por perfil)
 * - logging.async.queue-size=1024
 * 
 * @author Sistema POS
 * @version 1.0
 */
@Configuration
public class LoggingConfig {

    /**
     * Para configuración adicional de logging en Dev (si es necesaria)
     * Los valores se aplican desde application-dev.properties
     */
    @Configuration
    @Profile("dev")
    public static class DevLoggingConfig {
        // Configuración en application-dev.properties:
        // logging.level.root=INFO
        // logging.level.org.springframework.web=DEBUG
        // logging.level.org.hibernate.SQL=DEBUG
        // logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
        // logging.level.com.puntodeventa=DEBUG
    }

    /**
     * Para configuración de logging en Producción
     * Los valores se aplican desde application-prod.properties
     */
    @Configuration
    @Profile("prod")
    public static class ProdLoggingConfig {
        // Configuración en application-prod.properties:
        // logging.level.root=WARN
        // logging.level.com.puntodeventa=INFO
        // logging.level.org.springframework=WARN
        // logging.level.org.hibernate=WARN
        // logging.level.org.hibernate.SQL=OFF (CRÍTICO - Sin SQL logging)
    }
}
