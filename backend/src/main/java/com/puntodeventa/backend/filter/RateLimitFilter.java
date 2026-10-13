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
 * Filtro de límite de tasa de solicitudes para proteger la API del abuso.
 *
 * Límites configurables:
 * - Global: 2000 solicitudes por minuto
 * - Por usuario: 500 solicitudes por minuto
 * - Login por IP: 5 intentos cada 15 minutos
 *
 * Utiliza Bucket4j para el control de la tasa de solicitudes.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

	/**
	 * Límite global de 2000 solicitudes por minuto.
	 */
	private static final Bandwidth GLOBAL_LIMIT = Bandwidth.classic(2000, Refill.intervally(2000, Duration.ofMinutes(1)));

	/**
	 * Límite por usuario de 500 solicitudes por minuto.
	 */
	private static final Bandwidth USER_LIMIT = Bandwidth.classic(500, Refill.intervally(500, Duration.ofMinutes(1)));

	/**
	 * Auditoría 2026-09-11 (C5): límite por IP para el login (fuerza bruta).
	 * 5 intentos por ventana de 15 minutos, con vaciado automático del cubo.
	 */
	private static final Bandwidth LOGIN_LIMIT = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(15)));

	/**
	 * Cubo global compartido por todos los usuarios.
	 */
	private final Bucket globalBucket = Bucket4j.builder()
			.addLimit(GLOBAL_LIMIT)
			.build();

	/**
	 * Cubos por usuario, con clave igual al nombre de usuario o a la dirección IP.
	 */
	private final ConcurrentMap<String, Bucket> userBuckets = new ConcurrentHashMap<>();

	/**
	 * Cubos de login, indexados por dirección IP.
	 */
	private final ConcurrentMap<String, Bucket> loginBuckets = new ConcurrentHashMap<>();

	/**
	 * Aplica los límites de login, global y por usuario, publicando las cabeceras de cuota.
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

		String identifier = extractIdentifier(request);

		// El límite de login se aplica antes del global para que nunca sea
		// alcanzable por fuerza bruta.
		boolean esLogin = request.getRequestURI().startsWith("/api/v1/auth/login");
		if (esLogin) {
			String ip = extraerIpCliente(request);
			Bucket loginBucket = loginBuckets.computeIfAbsent(ip,
					k -> Bucket4j.builder().addLimit(LOGIN_LIMIT).build());
			if (!loginBucket.tryConsume(1)) {
				response.setStatus(429);
				response.setHeader("Retry-After", "900");
				response.setHeader("X-RateLimit-Limit", "5");
				response.setHeader("X-RateLimit-Remaining", "0");
				response.setHeader("X-RateLimit-Reset", "900");
				response.getWriter()
						.write("{\"error\": \"Demasiados intentos de login. Intente de nuevo en 15 minutos.\"}");
				return;
			}
		}

		if (!globalBucket.tryConsume(1)) {
			response.setStatus(429);
			response.setHeader("X-Rate-Limit-Retry-After-Seconds", "60");
			response.getWriter().write("{\"error\": \"Límite global de solicitudes excedido\"}");
			return;
		}

		Bucket userBucket = userBuckets.computeIfAbsent(identifier, k ->
			Bucket4j.builder()
				.addLimit(USER_LIMIT)
				.build()
		);

		if (!userBucket.tryConsume(1)) {
			response.setStatus(429);
			response.setHeader("X-Rate-Limit-Retry-After-Seconds", "60");
			response.setHeader("X-RateLimit-Limit", String.valueOf(USER_LIMIT.getCapacity()));
			response.setHeader("X-RateLimit-Remaining", "0");
			response.getWriter().write("{\"error\": \"Límite de solicitudes por usuario excedido\"}");
			return;
		}

		// Las cabeceras informan del cubo real (500), no del saldo ya consumido.
		long tokensRemaining = userBucket.getAvailableTokens();
		response.setHeader("X-RateLimit-Limit", String.valueOf(USER_LIMIT.getCapacity()));
		response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, tokensRemaining - 1)));
		response.setHeader("X-RateLimit-Reset", "60");

		filterChain.doFilter(request, response);
	}

	/**
	 * Extrae la IP real del cliente teniendo en cuenta los proxies
	 * (X-Forwarded-For puede traer una lista; se toma la primera).
	 *
	 * @param request solicitud HTTP en curso
	 * @return dirección IP del cliente
	 */
	private String extraerIpCliente(HttpServletRequest request) {
		String forwarded = request.getHeader("X-Forwarded-For");
		if (forwarded != null && !forwarded.isBlank()) {
			return forwarded.split(",")[0].trim();
		}
		return request.getRemoteAddr();
	}

	/**
	 * Extrae el identificador único del cliente (nombre de usuario o IP).
	 *
	 * Prioridad:
	 * 1. Nombre de usuario del contexto de seguridad, si está autenticado
	 * 2. Dirección IP del cliente
	 *
	 * @param request la solicitud HTTP
	 * @return identificador único del cliente
	 */
	private String extractIdentifier(HttpServletRequest request) {
		Object principal = request.getAttribute("usuario");
		if (principal != null) {
			return principal.toString();
		}

		String clientIp = request.getHeader("X-Forwarded-For");
		if (clientIp == null || clientIp.isEmpty()) {
			clientIp = request.getRemoteAddr();
		}
		return clientIp;
	}

	/**
	 * Auditoría 2026-09-11 (C5): sin exclusiones. Todas las rutas pasan por el límite
	 * de tasa; login, registro y refresh quedan protegidos por el cubo de login
	 * (por IP) y por el límite por usuario cuando hay token.
	 *
	 * @param request solicitud HTTP en curso
	 * @return siempre {@code false}, de modo que ninguna ruta queda excluida
	 */
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		return false;
	}
}
