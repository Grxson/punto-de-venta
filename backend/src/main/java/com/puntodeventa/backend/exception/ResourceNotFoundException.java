package com.puntodeventa.backend.exception;

/**
 * Excepción lanzada cuando un recurso solicitado no existe en la base de datos.
 * Se utiliza en los servicios para indicar que una entidad no fue encontrada.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    /**
     * Crea la excepción con un mensaje descriptivo.
     *
     * @param message descripción del recurso no encontrado
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }

    /**
     * Crea la excepción conservando la causa original.
     *
     * @param message descripción del recurso no encontrado
     * @param cause excepción que originó el fallo
     */
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
