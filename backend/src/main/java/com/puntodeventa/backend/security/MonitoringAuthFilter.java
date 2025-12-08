package com.puntodeventa.backend.security;

import com.puntodeventa.backend.config.MonitoringProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${RAILWAY_TOKEN:}")
    private String railwayTokenEnv;

    @Value("${MONITORING_API_KEY:}")
    private String apiKeyEnv;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String requestPath = request.getRequestURI();
        
        // Solo aplicar filtro a endpoints de monitoreo
        if (!requestPath.startsWith("/api/monitoring")) {
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("🔒 [MonitoringAuthFilter] Validando acceso a: " + requestPath);

        // Intentar validar Railway Token (PRIMARY)
        String railwayToken = request.getHeader("X-Railway-Token");
        System.out.println("   - Header X-Railway-Token recibido: " + (railwayToken != null ? "sí" : "no"));
        
        if (railwayToken != null && !railwayToken.isEmpty()) {
            if (isValidRailwayToken(railwayToken)) {
                System.out.println("   - ✅ Acceso permitido con Railway Token");
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Intentar validar API Key (FALLBACK)
        String apiKey = request.getHeader("X-Monitoring-Key");
        if (apiKey == null) {
            apiKey = request.getParameter("key");
        }
        
        System.out.println("   - Header X-Monitoring-Key o parámetro 'key' recibido: " + (apiKey != null ? "sí" : "no"));
        
        if (apiKey != null && !apiKey.isEmpty()) {
            if (isValidApiKey(apiKey)) {
                System.out.println("   - ✅ Acceso permitido con API Key");
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Si llegamos aquí, la autenticación falló
        System.out.println("   - ❌ Acceso denegado - credenciales inválidas o ausentes");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing credentials\"}");
    }

    /**
     * Valida que el Railway Token sea válido.
     */
    private boolean isValidRailwayToken(String token) {
        // Intentar obtener el token desde environment variables
        String configuredToken = System.getenv("RAILWAY_TOKEN");
        
        // Log para debugging
        System.out.println("🔍 [MonitoringAuthFilter] Validando Railway Token:");
        System.out.println("   - Token recibido (primeros 10 chars): " + (token != null ? token.substring(0, Math.min(10, token.length())) + "..." : "null"));
        System.out.println("   - Token configurado (primeros 10 chars): " + (configuredToken != null ? configuredToken.substring(0, Math.min(10, configuredToken.length())) + "..." : "null"));
        
        if (configuredToken == null || configuredToken.isBlank()) {
            System.out.println("   - ❌ No hay Railway Token configurado en variables de entorno");
            return false;
        }

        // Validar que el token coincida exactamente
        boolean isValid = token.equals(configuredToken.trim());
        System.out.println("   - " + (isValid ? "✅ Token válido" : "❌ Token inválido - no coincide"));
        return isValid;
    }

    /**
     * Valida que el API Key sea válido.
     */
    private boolean isValidApiKey(String apiKey) {
        String configuredKey = System.getenv("MONITORING_API_KEY");
        
        // Log para debugging
        System.out.println("🔍 [MonitoringAuthFilter] Validando API Key:");
        System.out.println("   - Key recibida (primeros 10 chars): " + (apiKey != null ? apiKey.substring(0, Math.min(10, apiKey.length())) + "..." : "null"));
        System.out.println("   - Key configurada (primeros 10 chars): " + (configuredKey != null ? configuredKey.substring(0, Math.min(10, configuredKey.length())) + "..." : "null"));
        
        if (configuredKey == null || configuredKey.isBlank()) {
            System.out.println("   - ❌ No hay API Key configurada en variables de entorno");
            return false;
        }

        boolean isValid = apiKey.equals(configuredKey.trim());
        System.out.println("   - " + (isValid ? "✅ API Key válida" : "❌ API Key inválida - no coincide"));
        return isValid;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestPath = request.getRequestURI();
        
        // Solo filtrar rutas de monitoreo REST (/api/monitoring/**)
        // Permitir acceso público a /monitoring (dashboard HTML) y recursos estáticos
        return !requestPath.startsWith("/api/monitoring");
    }
}
