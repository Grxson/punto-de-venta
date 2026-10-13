package com.puntodeventa.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilidad de emisión y lectura de tokens JWT firmados con HS256.
 * Los claims incluyen el identificador del usuario, su rol y su sucursal.
 */
@Component
public class JwtUtil {

    // Auditoría 2026-09-11 (C4): sin valor por defecto para el secreto. La property
    // jwt.secret debe resolverse desde el entorno (JWT_SECRET) o el arranque falla.
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:604800000}") // 7 días por defecto (604800000 ms)
    private long jwtExpiration;

    /**
     * Verifica al arrancar que el secreto cumple los requisitos de longitud de HS256.
     *
     * @throws IllegalStateException si el secreto está vacío o tiene menos de 32 caracteres
     */
    @PostConstruct
    void validarSecret() {
        // Fallo inmediato: un secreto vacío o corto impide firmar y validar tokens.
        // Keys.hmacShaKeyFor exige al menos 256 bits (32 bytes) para HS256.
        if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET no configurada o demasiado corta (< 32 chars). "
                            + "Genera una con: openssl rand -base64 64  y configúrala en Railway.");
        }
    }

    /**
     * Construye la clave de firma a partir del secreto configurado.
     *
     * @return clave simétrica para HS256
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Genera un JWT para un usuario.
     *
     * @param username nombre de usuario, que queda como sujeto del token
     * @param usuarioId identificador del usuario, incluido como claim
     * @param rolNombre nombre del rol, incluido como claim
     * @param sucursalId sucursal del usuario, incluida como claim
     * @return token JWT firmado
     */
    public String generateToken(String username, Long usuarioId, String rolNombre, Long sucursalId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("usuarioId", usuarioId);
        claims.put("rol", rolNombre);
        claims.put("sucursalId", sucursalId);
        return createToken(claims, username);
    }

    /**
     * Construye y firma el token JWT con los claims indicados.
     *
     * @param claims claims a incluir en el token
     * @param subject sujeto del token
     * @return token JWT firmado
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Obtiene el nombre de usuario del token.
     *
     * @param token token JWT firmado
     * @return nombre de usuario almacenado en el sujeto del token
     */
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Obtiene el identificador de usuario del token.
     * Funciona incluso con tokens caducados, para poder usarlos en el refresco.
     *
     * @param token token JWT firmado
     * @return identificador del usuario
     */
    public Long extractUsuarioId(String token) {
        try {
            return ((Number) Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("usuarioId")).longValue();
        } catch (ExpiredJwtException e) {
            // La caducidad no invalida la firma, así que los claims siguen siendo de fiar.
            return ((Number) e.getClaims().get("usuarioId")).longValue();
        }
    }

    /**
     * Extrae el nombre de usuario del token aunque esté caducado, para el refresco de token.
     *
     * @param token token JWT firmado
     * @return nombre de usuario del sujeto del token
     */
    public String extractUsernameFromExpiredToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            return e.getClaims().getSubject();
        }
    }

    /**
     * Obtiene el rol del token.
     *
     * @param token token JWT firmado
     * @return nombre del rol o {@code null} si el claim no está presente
     */
    public String extractRol(String token) {
        return (String) Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("rol");
    }

    /**
     * Obtiene la sucursal del token.
     *
     * @param token token JWT firmado
     * @return identificador de la sucursal del usuario
     * @throws IllegalArgumentException si el claim {@code sucursalId} falta o no es numérico
     */
    public Long extractSucursalId(String token) {
        Object sucursalObj = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("sucursalId");
        
        if (sucursalObj == null) {
            throw new IllegalArgumentException("Token no contiene 'sucursalId'. El JWT debe incluir la sucursal del usuario.");
        }
        
        if (!(sucursalObj instanceof Number)) {
            throw new IllegalArgumentException("'sucursalId' en token debe ser un número, pero es: " + sucursalObj.getClass().getSimpleName());
        }
        
        return ((Number) sucursalObj).longValue();
    }

    /**
     * Valida la firma y la vigencia del token.
     *
     * @param token token JWT firmado
     * @return {@code true} si el token es válido y no ha caducado
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifica si un token ha caducado.
     *
     * @param token token JWT firmado
     * @return {@code true} si el token ha caducado
     */
    public boolean isTokenExpired(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return false;
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            // Cualquier otro fallo (firma inválida, token corrupto) no se
            // interpreta como caducidad: quien llama decide con isTokenValid.
            return false;
        }
    }
}
