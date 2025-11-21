package com.puntodeventa.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * Configuración de seguridad para la API.
 * 
 * NOTA: Esta es una configuración TEMPORAL para desarrollo.
 * En producción se debe implementar JWT con roles y permisos detallados.
 * 
 * Configuración actual:
 * - Autenticación básica HTTP
 * - CSRF deshabilitado (para APIs RESTful stateless)
 * - Sesiones stateless
 * - Swagger UI público
 * - H2 Console público (solo desarrollo)
 * 
 * TODO: Implementar JWT con Spring Security
 * TODO: Configurar roles según docs/admin/seguridad.md
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF para API RESTful
            .csrf(AbstractHttpConfigurer::disable)
            
            // Configurar autorización de requests
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers(
                    "/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/h2-console/**",
                    "/actuator/health",
                    "/actuator/info"
                ).permitAll()
                
                // API de versión
                .requestMatchers("/api/version").permitAll()
                
                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            
            // Autenticación básica HTTP
            .httpBasic(withDefaults())
            
            // Sesiones stateless (sin estado)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configuración para H2 Console (solo desarrollo)
            .headers(headers -> headers
                .frameOptions(frame -> frame.sameOrigin())
            );

        return http.build();
    }

    /**
     * Encoder de contraseñas usando BCrypt.
     * BCrypt es un algoritmo de hashing robusto para contraseñas.
     * 
     * @return PasswordEncoder configurado
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
