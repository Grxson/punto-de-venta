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
                .requestMatchers("/api/auth/login").permitAll()
                // Refresh: el JWT llega expirado, JwtAuthenticationFilter lo deja pasar
                // a propósito y el controlador renueva la sesión
                .requestMatchers("/api/auth/refresh-token").permitAll()
                // NOTA: /api/auth/register y el resto de /api/auth requieren autenticación
                // (evitar alta y gestión de usuarios sin login)
                .requestMatchers("/api/categorias/**").permitAll() // Subcategorías para el formulario de
                                                                   // productos
                .requestMatchers("/api/v1/menu/**").permitAll() // Menú dinámico por popularidad
                .requestMatchers("/api/v1/metrics/web-vitals").permitAll() // Telemetría de navegador (sin auth)
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                // REST de actuator (metrics, prometheus, info) y métricas internas requieren auth
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs",
                        "/api-docs/**")
                .permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/monitoring").permitAll() // Dashboard HTML (datos vía /api/monitoring protegido)
                .requestMatchers("/api/monitoring/**").permitAll() // Autenticado por MonitoringAuthFilter
                .requestMatchers("/ws/**", "/topic/**", "/queue/**", "/user/**", "/app/**").permitAll() // WebSocket
                                                                                                        // endpoints
                .requestMatchers("/error").permitAll()

                // Permitir OPTIONS para CORS preflight
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // Auditoría 2026-09-11 (A14): RBAC explícito por endpoint.
                // Ventas y métodos de pago: los 3 roles (el cajero opera el POS)
                .requestMatchers("/api/ventas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                // Productos: lectura para todos, escritura SOLO ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/inventario/productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/inventario/productos/**").hasAuthority("ROLE_ADMIN")
                // Categorías de producto: lectura para todos, escritura SOLO ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/inventario/categorias-productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/inventario/categorias-productos/**").hasAuthority("ROLE_ADMIN")
                // Atributos/variantes/tamaños de productos: escritura ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/v1/productos/**").hasAuthority("ROLE_ADMIN")
                // Admin + Gerente: compras, finanzas, reportes, estadísticas, inventario
                // completo, mano de obra, catálogos, usuarios
                .requestMatchers("/api/compras/**", "/api/finanzas/**", "/api/reportes/**",
                        "/api/estadisticas/**", "/api/ingredientes/**", "/api/recetas/**",
                        "/api/inventario/movimientos/**", "/api/inventario/mermas/**",
                        "/api/inventario/proveedores/**", "/api/inventario/unidades/**",
                        "/api/mano-obra/**", "/api/gastos-indirectos/**", "/api/sucursales/**",
                        "/api/roles/**", "/api/auth/usuarios/**", "/api/v1/atributos/**",
                        "/api/v1/tamaños/**", "/api/v1/ventas-items/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_GERENTE")

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
