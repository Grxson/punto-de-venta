package com.puntodeventa.backend.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilidad para generar hashes BCrypt de passwords.
 * Ejecutar este main para generar los hashes correctos.
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generar hashes para los passwords por defecto
        String admin123 = encoder.encode("admin123");
        String cajero123 = encoder.encode("cajero123");
        String gerente123 = encoder.encode("gerente123");
        
        System.out.println("=== PASSWORD HASHES ===");
        System.out.println();
        System.out.println("admin123:");
        System.out.println(admin123);
        System.out.println();
        System.out.println("cajero123:");
        System.out.println(cajero123);
        System.out.println();
        System.out.println("gerente123:");
        System.out.println(gerente123);
        System.out.println();
        System.out.println("======================");
        
        // Verificar que el hash funciona
        boolean adminMatch = encoder.matches("admin123", admin123);
        boolean cajeroMatch = encoder.matches("cajero123", cajero123);
        boolean gerenteMatch = encoder.matches("gerente123", gerente123);
        
        System.out.println("Verificación:");
        System.out.println("admin123 matches: " + adminMatch);
        System.out.println("cajero123 matches: " + cajeroMatch);
        System.out.println("gerente123 matches: " + gerenteMatch);
    }
}
