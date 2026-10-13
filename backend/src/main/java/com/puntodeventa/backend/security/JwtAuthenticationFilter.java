package com.puntodeventa.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Filtro que autentica la solicitud a partir del JWT de la cabecera Authorization
 * y publica las autoridades del rol en el contexto de seguridad de Spring Security.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Valida el JWT, establece la autenticación en el contexto de seguridad y
     * responde 401 si el token está caducado o es inválido.
     *
     * @param request solicitud HTTP en curso
     * @param response respuesta HTTP en curso
     * @param filterChain cadena de filtros a continuar
     * @throws ServletException si falla el filtrado delegado
     * @throws IOException si falla la lectura o escritura de la solicitud o la respuesta
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            // El refresco debe llegar aquí aunque el token esté caducado:
            // es el propio controlador quien lo reemite.
            if (request.getRequestURI().contains("/api/auth/refresh-token")) {
                filterChain.doFilter(request, response);
                return;
            }

            if (jwt != null && jwtUtil.isTokenValid(jwt)) {
                String username = jwtUtil.extractUsername(jwt);
                String rol = jwtUtil.extractRol(jwt);

                // Auditoría 2026-09-11 (A14): autoridades desde el claim rol del JWT.
                // Antes se inyectaban vacías => hasAuthority/hasRole SIEMPRE fallaban.
                List<GrantedAuthority> authorities = new ArrayList<>();
                if (rol != null && !rol.isBlank()) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()));
                }

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username,
                        null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                filterChain.doFilter(request, response);
                return;
            } else if (jwt != null && !jwtUtil.isTokenValid(jwt)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Sesión caducada, inicia sesión de nuevo\"}");
                return;
            }
        } catch (Exception ex) {
            logger.error("Error al procesar JWT: " + ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"Sesión caducada, inicia sesión de nuevo\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extrae el JWT de la cabecera Authorization.
     *
     * @param request solicitud HTTP en curso
     * @return el token sin el prefijo {@code Bearer } o {@code null} si no viene
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

}
