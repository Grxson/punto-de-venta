package com.puntodeventa.backend.exception;

/**
 * Excepción lanzada cuando una entidad no es encontrada en la base de datos.
 */
public class EntityNotFoundException extends RuntimeException {
    
    /**
     * Crea la excepción con un mensaje descriptivo.
     *
     * @param mensaje descripción del recurso no encontrado
     */
    public EntityNotFoundException(String mensaje) {
        super(mensaje);
    }

    /**
     * Crea la excepción conservando la causa original.
     *
     * @param mensaje descripción del recurso no encontrado
     * @param causa excepción que originó el fallo
     */
    public EntityNotFoundException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
