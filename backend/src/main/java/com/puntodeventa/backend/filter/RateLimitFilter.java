package com.puntodeventa.backend.filter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Filtro de Rate Limiting para protección contra abuse.
 * 
 * Límites configurables:
 * - Global: 2000 solicitudes por minuto
 * - Por usuario: 500 solicitudes por minuto
 * 
 * Utiliza Bucket4j para control de tasa de solicitudes.
 * 
 * @author Sistema POS
 * @version 1.0
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

	/**
	 * Bandwidth global: 2000 solicitudes por minuto
	 */
	private static final Bandwidth GLOBAL_LIMIT = Bandwidth.classic(2000, Refill.intervally(2000, Duration.ofMinutes(1)));

	/**
	 * Bandwidth por usuario: 500 solicitudes por minuto
	 */
	private static final Bandwidth USER_LIMIT = Bandwidth.classic(500, Refill.intervally(500, Duration.ofMinutes(1)));

	/**
	 * Bucket global compartido por todos los usuarios
	 */
	private final Bucket globalBucket = Bucket4j.builder()
			.addLimit(GLOBAL_LIMIT)
			.build();

	/**
	 * Cache de buckets por usuario
	 * Clave: nombre de usuario o dirección IP
	 */
	private final ConcurrentMap<String, Bucket> userBuckets = new ConcurrentHashMap<>();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// Obtener identificador del usuario
		String identifier = extractIdentifier(request);

		// Verificar límite global
		if (!globalBucket.tryConsume(1)) {
			response.setStatus(429); // Too Many Requests
			response.setHeader("X-Rate-Limit-Retry-After-Seconds", "60");
			response.getWriter().write("{\"error\": \"Límite global de solicitudes excedido\"}");
			return;
		}

		// Obtener o crear bucket para el usuario
		Bucket userBucket = userBuckets.computeIfAbsent(identifier, k -> 
			Bucket4j.builder()
				.addLimit(USER_LIMIT)
				.build()
		);

		// Verificar límite por usuario
		if (!userBucket.tryConsume(1)) {
			response.setStatus(429); // Too Many Requests
			response.setHeader("X-Rate-Limit-Retry-After-Seconds", "60");
			response.setHeader("X-RateLimit-Limit", "100");
			response.setHeader("X-RateLimit-Remaining", "0");
			response.getWriter().write("{\"error\": \"Límite de solicitudes por usuario excedido\"}");
			return;
		}

		// Agregar headers de información de rate limit
		long tokensRemaining = userBucket.getAvailableTokens();
		response.setHeader("X-RateLimit-Limit", "100");
		response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, tokensRemaining - 1)));
		response.setHeader("X-RateLimit-Reset", "60");

		// Continuar con el siguiente filtro
		filterChain.doFilter(request, response);
	}

	/**
	 * Extrae el identificador único del usuario (nombre de usuario o IP)
	 * 
	 * Prioridad:
	 * 1. Nombre de usuario del token JWT (si está autenticado)
	 * 2. Dirección IP del cliente
	 * 
	 * @param request la solicitud HTTP
	 * @return identificador único del usuario
	 */
	private String extractIdentifier(HttpServletRequest request) {
		// Intentar obtener el nombre de usuario del contexto de seguridad
		Object principal = request.getAttribute("usuario");
		if (principal != null) {
			return principal.toString();
		}

		// Fallback: usar la dirección IP
		String clientIp = request.getHeader("X-Forwarded-For");
		if (clientIp == null || clientIp.isEmpty()) {
			clientIp = request.getRemoteAddr();
		}
		return clientIp;
	}

	/**
	 * Excepciones de rate limiting para rutas públicas.
	 * Las rutas de autenticación (login, registro) no están limitadas globalmente.
	 * 
	 * @param request la solicitud HTTP
	 * @return true si la solicitud debe ser excluida del filtro
	 */
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		String path = request.getRequestURI();
		// Excluir rutas de autenticación del rate limiting global (pero no del por-usuario)
		return path.startsWith("/api/v1/auth/login") || 
		       path.startsWith("/api/v1/auth/register") ||
		       path.startsWith("/api/v1/auth/refresh");
	}
}
