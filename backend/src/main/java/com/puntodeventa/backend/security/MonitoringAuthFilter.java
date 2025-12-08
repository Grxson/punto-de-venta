package com.puntodeventa.backend.security;

import com.puntodeventa.backend.config.MonitoringProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter que protege endpoints de monitoreo.
 * 
 * Valida:
 * 1. Railway Token (PRIMARY) - desde header X-Railway-Token
 * 2. API Key (FALLBACK) - desde header X-Monitoring-Key o parámetro 'key'
 * 
 * Si ambos fallan, retorna 401 Unauthorized.
 * Si uno funciona, permite acceso al endpoint.
 */
@Component
public class MonitoringAuthFilter extends OncePerRequestFilter {

    @Autowired
    private MonitoringProperties monitoringProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Solo aplicar filtro a endpoints de monitoreo
        if (!requestPath.startsWith("/api/monitoring") && !requestPath.startsWith("/monitoring")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Si el monitoreo no está habilitado, rechazar
        if (!monitoringProperties.isEnabled()) {
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Monitoring is disabled\"}");
            return;
        }

        // Si no se requiere autenticación, pasar
        if (!monitoringProperties.isRequireAuth()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Intentar validar Railway Token (PRIMARY)
        String railwayToken = request.getHeader("X-Railway-Token");
        if (railwayToken != null && !railwayToken.isEmpty()) {
            if (isValidRailwayToken(railwayToken)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Intentar validar API Key (FALLBACK)
        String apiKey = request.getHeader("X-Monitoring-Key");
        if (apiKey == null) {
            apiKey = request.getParameter("key");
        }
        
        if (apiKey != null && !apiKey.isEmpty()) {
            if (isValidApiKey(apiKey)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Si llegamos aquí, la autenticación falló
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing credentials\"}");
    }

    /**
     * Valida que el Railway Token sea válido.
     */
    private boolean isValidRailwayToken(String token) {
        MonitoringProperties.RailwayTokenProperties railwayProps = monitoringProperties.getRailwayToken();
        
        // Si Railway Token no está habilitado, ignorar
        if (!railwayProps.isEnabled()) {
            return false;
        }

        // Si no hay token configurado, ignorar
        String configuredToken = railwayProps.getToken();
        if (configuredToken == null || configuredToken.isBlank()) {
            return false;
        }

        // Validar que el token coincida
        return token.equals(configuredToken);
    }

    /**
     * Valida que el API Key sea válido.
     */
    private boolean isValidApiKey(String apiKey) {
        String configuredKey = monitoringProperties.getApiKey();
        
        if (configuredKey == null || configuredKey.isBlank()) {
            return false;
        }

        return apiKey.equals(configuredKey);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestPath = request.getRequestURI();
        
        // No filtrar rutas que no sean de monitoreo
        return !requestPath.startsWith("/api/monitoring") && !requestPath.startsWith("/monitoring");
    }
}
