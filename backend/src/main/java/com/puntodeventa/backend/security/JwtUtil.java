package com.puntodeventa.backend.security;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.SecretKey;

@Component
public class JwtUtil {
     @Value("${jwt.secret:punto-de-venta-secret-key-2025-debe-ser-muy-larga-para-seguridad}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}") // 1 hora por defecto
    private long jwtExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    /**
     * Crear Jwt
     */
    private String createToken(Map<String, Object> claims, String subject){
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .claims(claims)
            .subject(subject)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey(), SignatureAlgorithm.HS512)
            .compact();
    }

    /**
     * Obtener el username del token
     */
    public String extractUsername(String token){
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    /**
     * Obtener el usuarioId del token 
     */

     public Long extractUsuarioId(String token) {
        return ((Number) Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("usuarioId")).longValue();
    }

    /**
     * Obtiener el rol del token
     */
    public String extractRol(String token) {
        return (String) Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody()
            .get("rol");
    }

    /**
     * Validar si el token es válido
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


}
