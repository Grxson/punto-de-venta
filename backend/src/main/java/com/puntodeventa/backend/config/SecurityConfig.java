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
 * Configuración de seguridad de la API basada en JWT.
 *
 * Configuración actual:
 * - Autenticación por JWT
 * - CSRF deshabilitado, al tratarse de una API REST sin estado
 * - Sesiones sin estado
 * - Swagger UI público
 * - Consola H2 pública, solo en desarrollo
 * - Endpoints de autenticación públicos
 *
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

    /**
     * Proporciona el codificador de contraseñas usado al guardar y comparar credenciales.
     *
     * @return codificador BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Construye el gestor de autenticación basado en el proveedor DAO.
     *
     * @param http contexto de seguridad de Spring Security
     * @return gestor de autenticación configurado
     * @throws Exception si la configuración de Spring Security no es válida
     */
    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http
                .getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder
                .authenticationProvider(daoAuthenticationProvider());
        return authenticationManagerBuilder.build();
    }

    /**
     * Crea el proveedor de autenticación que valida contra la base de datos.
     *
     * @return proveedor configurado con el servicio de usuarios y el codificador de contraseñas
     */
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    /**
     * Define la cadena de filtros de seguridad: CORS, autorización por endpoint y
     * orden de ejecución de los filtros propios.
     *
     * @param http contexto de seguridad de Spring Security
     * @return cadena de filtros ya construida
     * @throws Exception si la configuración de Spring Security no es válida
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                // Endpoints públicos: el orden importa, se evalúan primero
                .requestMatchers("/api/auth/login").permitAll()
                // El refresco recibe un JWT caducado, JwtAuthenticationFilter lo deja
                // pasar a propósito y el controlador renueva la sesión
                .requestMatchers("/api/auth/refresh-token").permitAll()
                // /api/auth/register y el resto de /api/auth requieren autenticación,
                // para no permitir el alta ni la gestión de usuarios sin iniciar sesión
                .requestMatchers("/api/categorias/**").permitAll() // Subcategorías para el formulario de
                                                                   // productos
                .requestMatchers("/api/v1/menu/**").permitAll() // Menú dinámico por popularidad
                .requestMatchers("/api/v1/metrics/web-vitals").permitAll() // Telemetría de navegador, sin autenticación
                .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                // El REST de actuator (metrics, prometheus, info) y las métricas internas sí requieren autenticación
                .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/api-docs",
                        "/api-docs/**")
                .permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/monitoring").permitAll() // Dashboard HTML, los datos van por /api/monitoring protegido
                .requestMatchers("/api/monitoring/**").permitAll() // Autenticado por MonitoringAuthFilter
                .requestMatchers("/ws/**", "/topic/**", "/queue/**", "/user/**", "/app/**").permitAll() // Extremos
                                                                                                          // del WebSocket
                .requestMatchers("/error").permitAll()

                // Permitir OPTIONS para el preflight de CORS
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()

                // Auditoría 2026-09-11 (A14): RBAC explícito por endpoint.
                // Ventas y métodos de pago: los tres roles, ya que el cajero opera el punto de venta
                .requestMatchers("/api/ventas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                // Productos: lectura para todos, escritura solo ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/inventario/productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/inventario/productos/**").hasAuthority("ROLE_ADMIN")
                // Categorías de producto: lectura para todos, escritura solo ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/inventario/categorias-productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/inventario/categorias-productos/**").hasAuthority("ROLE_ADMIN")
                // Atributos, variantes y tamaños de producto: escritura ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/productos/**")
                .hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_GERENTE")
                .requestMatchers("/api/v1/productos/**").hasAuthority("ROLE_ADMIN")
                // ADMIN y GERENTE: compras, finanzas, reportes, estadísticas, inventario
                // completo, mano de obra, catálogos y usuarios
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

                // El límite de tasa se aplica el primero para proteger desde la entrada
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)

                .addFilterBefore(queryProfilerFilter, UsernamePasswordAuthenticationFilter.class)

                // El filtro de monitoreo va antes del JWT para que valide primero
                .addFilterBefore(monitoringAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // El contexto de sucursal va después del JWT, para acceder al usuario autenticado
                .addFilterAfter(sucursalContextFilter, JwtAuthenticationFilter.class)

                // La consola H2 solo se usa en desarrollo
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }
}
