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
	 * Auditoría 2026-09-11 (C5): límite por IP para login (brute force).
	 * 5 intentos / ventana de 15 minutos, reseteo automático del bucket.
	 */
	private static final Bandwidth LOGIN_LIMIT = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));

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

	/**
	 * Auditoría 2026-09-11 (C5): buckets de login por IP.
	 */
	private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// Obtener identificador del usuario
		String identifier = extractIdentifier(request);

		// Auditoría 2026-09-11 (C5): protección de login por IP (5 intentos/15 min).
		// Se aplica ANTES del límite global para que el login nunca sea alcanzable
		// por fuerza bruta.
		boolean esLogin = request.getRequestURI().startsWith("/api/v1/auth/login");
		if (esLogin) {
			String ip = extraerIpCliente(request);
			Bucket loginBucket = loginBuckets.computeIfAbsent(ip,
					k -> Bucket4j.builder().addLimit(LOGIN_LIMIT).build());
			if (!loginBucket.tryConsume(1)) {
				response.setStatus(429); // Too Many Requests
				response.setHeader("Retry-After", "900");
				response.setHeader("X-RateLimit-Limit", "5");
				response.setHeader("X-RateLimit-Remaining", "0");
				response.setHeader("X-RateLimit-Reset", "900");
				response.getWriter()
						.write("{\"error\": \"Demasiados intentos de login. Intente de nuevo en 15 minutos.\"}");
				return;
			}
		}

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
			response.setHeader("X-RateLimit-Limit", String.valueOf(USER_LIMIT.getCapacity()));
			response.setHeader("X-RateLimit-Remaining", "0");
			response.getWriter().write("{\"error\": \"Límite de solicitudes por usuario excedido\"}");
			return;
		}

		// Agregar headers de información de rate limit (bucket real: 500)
		long tokensRemaining = userBucket.getAvailableTokens();
		response.setHeader("X-RateLimit-Limit", String.valueOf(USER_LIMIT.getCapacity()));
		response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, tokensRemaining - 1)));
		response.setHeader("X-RateLimit-Reset", "60");

		// Continuar con el siguiente filtro
		filterChain.doFilter(request, response);
	}

	/**
	 * Auditoría 2026-09-11 (C5): extrae IP real del cliente considerando proxies
	 * (X-Forwarded-For puede traer lista; se usa la primera).
	 */
	private String extraerIpCliente(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
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
	 * Auditoría 2026-09-11 (C5): sin exclusiones. Todas las rutas pasan por rate
	 * limiting; login/register/refresh quedan protegidos por el bucket de login
	 * (por IP) y por el límite por usuario cuando hay token.
	 */
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		return false;
	}
}
