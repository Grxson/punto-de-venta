package com.puntodeventa.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret:punto-de-venta-secret-key-2025-debe-ser-muy-larga-para-seguridad}")
    private String jwtSecret;

    @Value("${jwt.expiration:604800000}") // 7 días por defecto (604800000 ms)
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generar un JWT para un usuario
     */
    public String generateToken(String username, Long usuarioId, String rolNombre, Long sucursalId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("usuarioId", usuarioId);
        claims.put("rol", rolNombre);
        claims.put("sucursalId", sucursalId);  // Sucursal del usuario
        return createToken(claims, username);
    }

    /**
     * Crear el token JWT
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
     * Obtener el username del token
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
     * Obtener el usuarioId del token
     */
    public Long extractUsuarioId(String token) {
        return ((Number) Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("usuarioId")).longValue();
    }

    /**
     * Obtener el rol del token
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
     * Obtener la sucursal del token
     * @throws IllegalArgumentException si sucursalId no existe o no es válido
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
     * Validar si el token es válido
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            // Token expirado
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verificar si un token está expirado
     * @return true si el token está expirado
     */
    public boolean isTokenExpired(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return false;  // Token válido
        } catch (ExpiredJwtException e) {
            return true;  // Token expirado
        } catch (Exception e) {
            return false;  // Otro tipo de error
        }
    }
}
