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
 * Filtro que protege los endpoints de monitoreo.
 *
 * Valida, por este orden:
 * 1. Token de Railway (principal), en la cabecera {@code X-Railway-Token}
 * 2. Clave de API (alternativa), en la cabecera {@code X-Monitoring-Key} o en el
 *    parámetro {@code key}
 *
 * Si ambas validaciones fallan responde 401 Unauthorized.
 */
@Component
public class MonitoringAuthFilter extends OncePerRequestFilter {

    @Autowired
    private MonitoringProperties monitoringProperties;

    @Value("${RAILWAY_TOKEN:}")
    private String railwayTokenEnv;

    @Value("${MONITORING_API_KEY:}")
    private String apiKeyEnv;

    /**
     * Valida las credenciales de acceso a los endpoints de monitoreo y responde
     * 401 cuando ninguna es válida.
     *
     * @param request solicitud HTTP en curso
     * @param response respuesta HTTP en curso
     * @param filterChain cadena de filtros a continuar
     * @throws ServletException si falla el filtrado delegado
     * @throws IOException si falla la lectura o escritura de la solicitud o la respuesta
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        if (!requestPath.startsWith("/api/monitoring")) {
            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("🔒 [MonitoringAuthFilter] Validando acceso a: " + requestPath);

        String railwayToken = request.getHeader("X-Railway-Token");
        System.out.println("   - Header X-Railway-Token recibido: " + (railwayToken != null ? "sí" : "no"));

        if (railwayToken != null && !railwayToken.isEmpty()) {
            if (isValidRailwayToken(railwayToken)) {
                System.out.println("   - ✅ Acceso permitido con Railway Token");
                filterChain.doFilter(request, response);
                return;
            }
        }

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

        System.out.println("   - ❌ Acceso denegado - credenciales inválidas o ausentes");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\": \"Unauthorized - Invalid or missing credentials\"}");
    }

    /**
     * Valida que el token de Railway coincida con el configurado en el entorno.
     * Solo se imprimen los primeros caracteres para no filtrar el secreto completo.
     *
     * @param token token recibido en la cabecera
     * @return {@code true} si el token coincide con el configurado
     */
    private boolean isValidRailwayToken(String token) {
        String configuredToken = System.getenv("RAILWAY_TOKEN");

        System.out.println("🔍 [MonitoringAuthFilter] Validando Railway Token:");
        System.out.println("   - Token recibido (primeros 10 chars): " + (token != null ? token.substring(0, Math.min(10, token.length())) + "..." : "null"));
        System.out.println("   - Token configurado (primeros 10 chars): " + (configuredToken != null ? configuredToken.substring(0, Math.min(10, configuredToken.length())) + "..." : "null"));

        if (configuredToken == null || configuredToken.isBlank()) {
            System.out.println("   - ❌ No hay Railway Token configurado en variables de entorno");
            return false;
        }

        boolean isValid = token.equals(configuredToken.trim());
        System.out.println("   - " + (isValid ? "✅ Token válido" : "❌ Token inválido - no coincide"));
        return isValid;
    }

    /**
     * Valida que la clave de API coincida con la configurada en el entorno.
     *
     * @param apiKey clave recibida en la cabecera o el parámetro
     * @return {@code true} si la clave coincide con la configurada
     */
    private boolean isValidApiKey(String apiKey) {
        String configuredKey = System.getenv("MONITORING_API_KEY");

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

    /**
     * Restringe el filtro a las rutas REST de monitoreo, dejando públicas el
     * dashboard, los recursos estáticos y el WebSocket.
     *
     * @param request solicitud HTTP en curso
     * @return {@code true} si la ruta no pertenece al API de monitoreo
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String requestPath = request.getRequestURI();

        return !requestPath.startsWith("/api/monitoring");
    }
}
