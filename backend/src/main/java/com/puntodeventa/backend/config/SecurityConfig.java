package com.puntodeventa.backend.config;

import com.puntodeventa.backend.security.JwtAuthenticationFilter;
import com.puntodeventa.backend.security.SucursalContextFilter;
import com.puntodeventa.backend.filter.RateLimitFilter;
import com.puntodeventa.backend.filter.QueryProfilerFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Configuración de seguridad para la API con JWT.
 * 
 * Configuración actual:
 * - Autenticación JWT
 * - CSRF deshabilitado (para APIs RESTful stateless)
 * - Sesiones stateless
 * - Swagger UI público
 * - H2 Console público (solo desarrollo)
 * - Endpoints de autenticación públicos
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private SucursalContextFilter sucursalContextFilter;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    @Autowired
    private QueryProfilerFilter queryProfilerFilter;

    @Autowired
    private com.puntodeventa.backend.security.MonitoringAuthFilter monitoringAuthFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http
                .getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .authenticationProvider(daoAuthenticationProvider());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Configurar CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Deshabilitar CSRF para API RESTful
                .csrf(AbstractHttpConfigurer::disable)

                // Sesiones stateless (sin estado)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Configurar autorización de requests
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos - IMPORTANTE: El orden importa, estos se evalúan primero
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/categorias/**").permitAll() // Subcategorías para el formulario de
                                                                           // productos
                        .requestMatchers("/api/v1/menu/**").permitAll() // Menú dinámico por popularidad
                        .requestMatchers("/api/v1/metrics/**").permitAll() // Performance metrics
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs",
                                "/api-docs/**")
                        .permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/monitoring").permitAll() // Dashboard de monitoreo
                        .requestMatchers("/api/monitoring/**").permitAll() // API endpoints de monitoreo
                        .requestMatchers("/ws/**", "/topic/**", "/queue/**", "/user/**", "/app/**").permitAll() // WebSocket
                                                                                                                // endpoints
                        .requestMatchers("/error").permitAll()

                // Permitir OPTIONS para CORS preflight
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated())

                // Agregar filtro de Rate Limiting PRIMERO para proteger desde el inicio
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)

                // Agregar filtro de Query Profiling para métricas de performance
                .addFilterBefore(queryProfilerFilter, UsernamePasswordAuthenticationFilter.class)

                // Agregar filtro de monitoreo ANTES del JWT para que valide primero
                .addFilterBefore(monitoringAuthFilter, UsernamePasswordAuthenticationFilter.class)                // Agregar filtro JWT antes del filtro de autenticación
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Agregar filtro de contexto de sucursal (después del JWT para acceder al usuario autenticado)
                .addFilterAfter(sucursalContextFilter, JwtAuthenticationFilter.class)

                // Configuración para H2 Console (solo desarrollo)
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }
}
