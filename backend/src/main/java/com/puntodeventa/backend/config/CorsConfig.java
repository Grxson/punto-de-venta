package com.puntodeventa.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de CORS para permitir el acceso desde aplicaciones móviles y de escritorio.
 *
 * Permite que las aplicaciones frontend (React Native, Electron, etc.) consuman la
 * API REST sin problemas de CORS.
 *
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

    /**
     * Construye la configuración de CORS a partir de las propiedades del entorno.
     *
     * @return origen de configuración de CORS para todas las rutas
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var configuration = new CorsConfiguration();

        // Se usan patrones de origen y no orígenes literales para poder combinar
        // comodines con el envío de credenciales.
        var origins = parseList(allowedOrigins);
        var methods = parseList(allowedMethods);
        var headers = parseList(allowedHeaders);

        if (origins.length > 0) {
            configuration.setAllowedOriginPatterns(Arrays.asList(origins));
        } else {
            // Sin configuración explícita se permiten todos los orígenes en desarrollo
            configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        }

        if (methods.length > 0) {
            configuration.setAllowedMethods(Arrays.asList(methods));
        } else {
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        }

        if (headers.length > 0) {
            configuration.setAllowedHeaders(Arrays.asList(headers));
        } else {
            configuration.setAllowedHeaders(Arrays.asList("*"));
        }

        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(maxAge);

        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count"));

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Divide una cadena separada por comas y descarta los valores vacíos.
     *
     * @param value cadena separada por comas
     * @return valores sin espacios sobrantes, o un arreglo vacío si la cadena está vacía
     */
    private String[] parseList(String value) {
        if (value == null || value.isBlank()) {
            return new String[0];
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }
}