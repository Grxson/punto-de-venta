package com.puntodeventa.backend.exception;

/**
 * Excepción lanzada cuando un recurso solicitado no existe en la base de datos.
 * Se utiliza en los servicios para indicar que una entidad no fue encontrada.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
