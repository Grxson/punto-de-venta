package com.puntodeventa.backend.exception;

/**
 * Excepción lanzada cuando una entidad no es encontrada en la base de datos.
 */
public class EntityNotFoundException extends RuntimeException {
    
    public EntityNotFoundException(String mensaje) {
        super(mensaje);
    }

    public EntityNotFoundException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
