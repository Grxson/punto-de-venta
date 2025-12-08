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
 * Filtro que establece el contexto de sucursal para cada request.
 * 
 * Flujo:
 * 1. Obtiene el token JWT del header Authorization
 * 2. Extrae la sucursal_id del JWT (primera opción - más confiable)
 * 3. Si no hay JWT o no contiene sucursal, obtiene del usuario en BD
 * 4. Establece la sucursal en SucursalContext
 * 5. Continúa el request
 * 6. Limpia el contexto al final
 * 
 * Headers soportados:
 * - Authorization: Bearer <JWT> - Token con sucursal_id incluido
 * - X-Sucursal-Id: ID de la sucursal (solo si el usuario es admin, para cambiar
 * de sucursal)
 * 
 * Prioridad:
 * 1. Sucursal del JWT (más confiable porque viene del token autenticado)
 * 2. Header X-Sucursal-Id (si es admin y lo proporciona)
 * 3. Sucursal del usuario en BD (fallback)
 */
@Component
public class SucursalContextFilter extends OncePerRequestFilter {

    @Autowired(required = false)
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Long sucursalId = null;
            String sucursalNombre = null;
            String rolNombre = null;

            // PASO 1: Intentar obtener sucursal del JWT
            String bearerToken = extractBearerToken(request);
            if (bearerToken != null && jwtUtil != null && jwtUtil.isTokenValid(bearerToken)) {
                try {
                    sucursalId = jwtUtil.extractSucursalId(bearerToken);
                    rolNombre = jwtUtil.extractRol(bearerToken);
                    logger.info("✅ [SucursalContextFilter] Sucursal obtenida del JWT: " + sucursalId + " | Rol: "
                            + rolNombre);
                } catch (JwtException | ClassCastException | NumberFormatException e) {
                    logger.error("❌ [SucursalContextFilter] Error al extraer sucursal del JWT: " + e.getMessage()
                            + " | Exception: " + e.getClass().getSimpleName(), e);
                    sucursalId = null;
                }
            } else {
                logger.warn("⚠️ [SucursalContextFilter] No hay token Bearer válido en el request");
            }

            // PASO 2: Si el JWT no tiene sucursal, obtener de la BD
            if (sucursalId == null && usuarioRepository != null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                    String username = auth.getName();
                    try {
                        Usuario usuario = usuarioRepository.findByUsername(username)
                                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado: " + username));

                        // Acceder a los valores lazy-loaded dentro del contexto de la sesión
                        if (usuario.getSucursal() != null) {
                            sucursalId = usuario.getSucursal().getId();
                            sucursalNombre = usuario.getSucursal().getNombre();
                            logger.debug(
                                    "✅ Sucursal obtenida de la BD para usuario: " + username + " -> " + sucursalId);
                        }
                        if (usuario.getRol() != null) {
                            rolNombre = usuario.getRol().getNombre();
                        }
                    } catch (Exception e) {
                        logger.warn("⚠️ Error al cargar usuario o sucursal desde BD: " + e.getMessage());
                    }
                }
            }

            // PASO 3: Si es admin, permitir cambiar de sucursal con header X-Sucursal-Id
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

            // PASO 4: Establecer el contexto con valores seguros
            if (sucursalId != null) {
                if (sucursalNombre == null) {
                    sucursalNombre = "Sucursal-" + sucursalId;
                }
                SucursalContext.setSucursal(sucursalId, sucursalNombre);
                logger.info("📍 [SucursalContextFilter] SucursalContext establecido: ID=" + sucursalId + ", Nombre="
                        + sucursalNombre + " | Request: " + request.getRequestURI());
            } else {
                logger.error(
                        "❌ [SucursalContextFilter] No se pudo establecer contexto de sucursal - usando sucursal 1 como fallback | Request: "
                                + request.getRequestURI());
                SucursalContext.setSucursal(1L, "Default");
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("❌ Error en SucursalContextFilter: " + e.getMessage(), e);
            // Continuar con sucursal por defecto si hay error
            try {
                SucursalContext.setSucursal(1L, "Default");
            } catch (Exception ignore) {
                // Si hasta aquí falla, dejar que el request continúe sin contexto
            }
            filterChain.doFilter(request, response);
        } finally {
            // Limpiar el contexto al final del request
            SucursalContext.clear();
        }
    }

    /**
     * Extrae el token Bearer del header Authorization
     */
    private String extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
