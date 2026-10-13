package com.puntodeventa.backend.security;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import io.jsonwebtoken.JwtException;

/**
 * Filtro que establece el contexto de sucursal de cada solicitud.
 *
 * Flujo:
 * 1. Obtiene el token JWT de la cabecera Authorization
 * 2. Extrae el sucursal_id del JWT (primera opción, más fiable)
 * 3. Si no hay JWT o no contiene sucursal, la obtiene del usuario en la base de datos
 * 4. Establece la sucursal en {@link SucursalContext}
 * 5. Continúa con la solicitud
 * 6. Limpia el contexto al final
 *
 * Cabeceras admitidas:
 * - Authorization: Bearer &lt;JWT&gt;, token con el sucursal_id incluido
 * - X-Sucursal-Id: identificador de la sucursal, aceptado solo si el usuario es
 *   administrador, para cambiar de sucursal
 *
 * Prioridad:
 * 1. Sucursal del JWT, la más fiable por proceder del token autenticado
 * 2. Cabecera X-Sucursal-Id, si es administrador y la envía
 * 3. Sucursal del usuario en la base de datos, como último recurso
 */
@Component
public class SucursalContextFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private JwtUtil jwtUtil;

    /**
     * Ignora el endpoint de login, el refresco de token, las rutas estáticas, el
     * dashboard y las APIs de monitoreo y el WebSocket, para no exigir contexto de
     * sucursal en estas rutas públicas.
     *
     * @param request solicitud HTTP en curso
     * @return {@code true} si la ruta está exenta del filtro
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.equals("/api/auth/login") ||
                path.equals("/api/auth/refresh-token") ||
                path.startsWith("/monitoring") ||
                path.startsWith("/api/monitoring") ||
                path.startsWith("/static/") ||
                path.startsWith("/css/") ||
                path.startsWith("/js/") ||
                path.startsWith("/images/") ||
                path.startsWith("/favicon.ico") ||
                path.startsWith("/error") ||
                path.startsWith("/ws/"); // El handshake y las conexiones WebSocket se ignoran
    }

    /**
     * Resuelve la sucursal de la solicitud y la publica en el contexto. Si no puede
     * resolverse, responde 401 y no deja continuar la cadena.
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
            Long sucursalId = null;
            String sucursalNombre = null;
            String rolNombre = null;

            String bearerToken = extractBearerToken(request);
            if (bearerToken != null && jwtUtil != null && jwtUtil.isTokenValid(bearerToken)) {
                try {
                    sucursalId = jwtUtil.extractSucursalId(bearerToken);
                    rolNombre = jwtUtil.extractRol(bearerToken);
                    String usernameFromToken = jwtUtil.extractUsername(bearerToken);
                    logger.info("✅ [SucursalContextFilter] Sucursal obtenida del JWT: " + sucursalId + " | Rol: "
                            + rolNombre + " | Usuario: " + usernameFromToken);
                } catch (IllegalArgumentException e) {
                    // Distingue el claim ausente o mal formado de otros fallos.
                    logger.error(
                            "❌ [SucursalContextFilter] Token JWT inválido - sucursalId no encontrado o mal formado: "
                                    + e.getMessage(),
                            e);
                    sucursalId = null;
                } catch (Exception e) {
                    logger.error(
                            "❌ [SucursalContextFilter] Error inesperado al extraer datos del JWT: " + e.getMessage()
                                    + " | Exception: " + e.getClass().getSimpleName(),
                            e);
                    sucursalId = null;
                }
            } else {
                logger.warn("⚠️ [SucursalContextFilter] No hay token Bearer válido en el request");
            }

            // Último recurso: sucursal del usuario en la base de datos.
            if (sucursalId == null && usuarioRepository != null) {
                logger.info("ℹ️ [SucursalContextFilter] Sucursal no obtenida del JWT, intentando fallback a BD");
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    String username = auth.getName();
                    logger.debug("✅ Usuario autenticado en SecurityContext: " + username);
                    try {
                        Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

                        logger.debug("✅ Usuario encontrado en BD: " + username);

                        // Los valores se leen aquí, dentro de la sesión, para
                        // evitar el acceso perezoso fuera de ella.
                        if (usuario.getSucursal() != null) {
                            sucursalId = usuario.getSucursal().getId();
                            sucursalNombre = usuario.getSucursal().getNombre();
                            logger.info("✅ [FALLBACK BD] Sucursal obtenida para usuario: " + username
                                    + " -> sucursal_id=" + sucursalId + " (" + sucursalNombre + ")");
                        } else {
                            logger.error("❌ [FALLBACK BD] Usuario " + username
                                    + " NO tiene sucursal asignada en la BD!");
                        }

                        if (usuario.getRol() != null) {
                            rolNombre = usuario.getRol().getNombre();
                            logger.debug("✅ Rol obtenido de la BD: " + rolNombre);
                        }
                    } catch (EntityNotFoundException e) {
                        logger.error("❌ [FALLBACK BD] Usuario no encontrado en BD: " + e.getMessage());
                    } catch (Exception e) {
                        logger.error("❌ [FALLBACK BD] Error al cargar usuario o sucursal: " + e.getMessage()
                                + " | Exception: " + e.getClass().getSimpleName(), e);
                    }
                } else {
                    logger.warn("⚠️ [FALLBACK BD] No hay usuario autenticado en SecurityContext");
                }
            }

            if (rolNombre != null && rolNombre.equalsIgnoreCase("ADMIN")) {
                String sucursalHeader = request.getHeader("X-Sucursal-Id");
                if (sucursalHeader != null && !sucursalHeader.isBlank()) {
                    try {
                        Long headerSucursalId = Long.parseLong(sucursalHeader);
                        logger.info("🔄 Admin cambió de sucursal: " + sucursalId + " -> " + headerSucursalId);
                        sucursalId = headerSucursalId;
                        sucursalNombre = "Sucursal-" + sucursalId;
                    } catch (NumberFormatException e) {
                        logger.warn("❌ Header X-Sucursal-Id inválido: " + sucursalHeader);
                    }
                }
            }

            if (sucursalId != null) {
                if (sucursalNombre == null) {
                    sucursalNombre = "Sucursal-" + sucursalId;
                }
                SucursalContext.setSucursal(sucursalId, sucursalNombre);
                logger.info("📍 [SucursalContextFilter] ✅ SucursalContext establecido: ID=" + sucursalId
                        + ", Nombre=" + sucursalNombre + " | Request: " + request.getRequestURI());
            } else {
                // Auditoría 2026-09-11 (C3): sin sucursal resuelta se responde 401,
                // nunca se continúa con un contexto indeterminado.
                logger.error("❌ [SucursalContextFilter] CRÍTICO - No se pudo obtener sucursal_id de:");
                logger.error("   - JWT (no contiene sucursalId o token inválido)");
                logger.error("   - BD (usuario no autenticado, no encontrado, o sin sucursal asignada)");
                logger.error("   Request: " + request.getRequestURI());
                if (!response.isCommitted()) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter()
                            .write("{\"error\":\"Sucursal no resuelta para el usuario o la sesión actual\"}");
                    return;
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("❌ [SucursalContextFilter] EXCEPCIÓN INESPERADA en filter: " + e.getMessage()
                    + " | Exception: " + e.getClass().getName(), e);
            // Auditoría 2026-09-11 (C3): sin recurso a la sucursal 1. Un error interno
            // del filtro responde 401 y aborta, en lugar de propagar un contexto inseguro.
            if (!response.isCommitted()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"Sucursal no resuelta: error interno del filtro\"}");
            }
        } finally {
            // Los hilos se reutilizan: sin limpiar, la sucursal se arrastraría
            // a la siguiente solicitud.
            SucursalContext.clear();
        }
    }

    /**
     * Extrae el token de la cabecera Authorization con el esquema Bearer.
     *
     * @param request solicitud HTTP en curso
     * @return el token sin el prefijo {@code Bearer } o {@code null} si no viene
     */
    private String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
