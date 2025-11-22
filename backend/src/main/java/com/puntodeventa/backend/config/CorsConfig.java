package com.puntodeventa.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de CORS para permitir el acceso desde apps móviles y de escritorio.
 * 
 * Esta configuración permite que aplicaciones frontend (React Native, Electron, etc.)
 * puedan consumir la API RESTful sin problemas de CORS.
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${cors.allowed-methods}")
    private String allowedMethods;

    @Value("${cors.allowed-headers}")
    private String allowedHeaders;

    @Value("${cors.allow-credentials}")
    private boolean allowCredentials;

    @Value("${cors.max-age}")
    private long maxAge;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var configuration = new CorsConfiguration();
        
        // Usar allowedOriginPatterns en lugar de allowedOrigins para permitir "*" con credentials
        configuration.setAllowedOriginPatterns(Arrays.asList(parseList(allowedOrigins)));
        configuration.setAllowedMethods(Arrays.asList(parseList(allowedMethods)));
        configuration.setAllowedHeaders(Arrays.asList(parseList(allowedHeaders)));
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Parsea una cadena separada por comas en un array de strings.
     * Utiliza características de Java 21 para procesamiento eficiente.
     * 
     * @param value Cadena separada por comas
     * @return Array de strings
     */
    private String[] parseList(String value) {
        return value != null ? value.split(",") : new String[0];
    }
}