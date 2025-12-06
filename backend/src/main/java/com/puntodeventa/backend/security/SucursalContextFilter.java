package com.puntodeventa.backend.security;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que establece el contexto de sucursal para cada request.
 * 
 * Flujo:
 * 1. Obtiene el usuario autenticado del SecurityContext
 * 2. Obtiene la sucursal del usuario (o del header X-Sucursal-Id si es admin)
 * 3. Establece la sucursal en SucursalContext
 * 4. Continúa el request
 * 5. Limpia el contexto al final
 * 
 * Headers soportados:
 * - X-Sucursal-Id: ID de la sucursal (solo si el usuario es admin)
 * - Sin header: Usa la sucursal del usuario
 */
@Component
@RequiredArgsConstructor
public class SucursalContextFilter extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Obtener usuario autenticado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                String username = auth.getName();
                
                // Obtener el usuario de la BD para acceder a su sucursal
                Usuario usuario = usuarioRepository.findByUsername(username)
                    .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                // IMPORTANTE: Acceder a los valores lazy-loaded dentro del contexto de la sesión
                Long sucursalId = null;
                String sucursalNombre = null;
                String rolNombre = null;
                
                try {
                    // Estos accesos ocurren dentro de la sesión de Hibernate
                    if (usuario.getSucursal() != null) {
                        sucursalId = usuario.getSucursal().getId();
                        sucursalNombre = usuario.getSucursal().getNombre();
                    }
                    if (usuario.getRol() != null) {
                        rolNombre = usuario.getRol().getNombre();
                    }
                } catch (Exception e) {
                    logger.warn("Error al cargar lazy-loaded fields para usuario: " + username + ". Error: " + e.getMessage());
                    // Si no se pueden cargar los lazy-loaded, usar valores por defecto
                    if (sucursalId == null) sucursalId = 1L; // Sucursal por defecto
                    if (sucursalNombre == null) sucursalNombre = "Default";
                }

                // Si es admin, puede cambiar de sucursal con header X-Sucursal-Id
                if (rolNombre != null && rolNombre.equalsIgnoreCase("ADMIN")) {
                    String sucursalHeader = request.getHeader("X-Sucursal-Id");
                    if (sucursalHeader != null && !sucursalHeader.isBlank()) {
                        try {
                            sucursalId = Long.parseLong(sucursalHeader);
                            // TODO: Validar que la sucursal existe
                            sucursalNombre = "Sucursal-" + sucursalId; // Placeholder
                        } catch (NumberFormatException ignored) {
                            // Usar la sucursal del usuario si el header es inválido
                        }
                    }
                }

                // Establecer el contexto con valores seguros
                if (sucursalId != null && sucursalNombre != null) {
                    SucursalContext.setSucursal(sucursalId, sucursalNombre);
                } else {
                    logger.warn("No se pudo establecer contexto de sucursal para usuario: " + username);
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            // Limpiar el contexto al final del request
            SucursalContext.clear();
        }
    }
}
