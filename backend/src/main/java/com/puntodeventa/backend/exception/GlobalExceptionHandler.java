package com.puntodeventa.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones para la API REST.
 * Captura y transforma excepciones en respuestas HTTP apropiadas.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Maneja excepciones cuando un recurso no es encontrado.
     *
     * @param ex excepción con el detalle del recurso ausente
     * @return respuesta 404 con el cuerpo de error
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Recurso no encontrado")
            .message(ex.getMessage())
            .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Maneja errores de validación de datos (@Valid), indexados por campo.
     *
     * @param ex excepción con el BindingResult y los errores de campo
     * @return respuesta 400 con el detalle de cada campo inválido
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("❌ Error de validación en request: {}", errors);

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.BAD_REQUEST.value())
            .error("Error de validación")
            .message("Los datos proporcionados no son válidos")
            .validationErrors(errors)
            .build();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): validaciones de negocio lanzadas como
     * IllegalArgumentException (ej: descuento cajero > 10%, cantidad <= 0) → 400.
     *
     * @param ex excepción con el mensaje de la regla de negocio incumplida
     * @return respuesta 400 con el mensaje del incumplimiento
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("⚠️ Validación de negocio: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Solicitud inválida")
                .message(ex.getMessage() != null ? ex.getMessage() : "Argumento inválido")
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja violaciones de integridad de datos (claves duplicadas, claves foráneas, etc.).
     * El mensaje se especializa según el texto de la violación para no filtrar detalles
     * internos de la base de datos al cliente.
     *
     * @param ex excepción de integridad con el detalle técnico
     * @return respuesta 409 con el mensaje interpretable
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = "Error de integridad de datos";

        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("Unique") || ex.getMessage().contains("PRIMARY KEY")) {
                message = "El registro ya existe o viola una restricción de unicidad";
            } else if (ex.getMessage().contains("foreign key")) {
                message = "Referencia a un registro que no existe";
            }
        }
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.CONFLICT.value())
            .error("Conflicto de datos")
            .message(message)
            .build();
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Maneja rutas no encontradas (404).
     * Boot 3.2+ lanza NoResourceFoundException (springdoc /v3/api-docs y paths estáticos)
     * además de NoHandlerFoundException; sin esto caen en handleGenericException y devuelven 500.
     *
     * @param ex excepción de enrutamiento sin manejador o sin recurso estático
     * @return respuesta 404 con el cuerpo de error
     */
    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(Exception ex) {
        log.warn("⚠️ Ruta no encontrada: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.NOT_FOUND.value())
            .error("Endpoint no encontrado")
            .message("La ruta solicitada no existe")
            .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): errores de autenticación de Spring Security → 401.
     * Reemplaza la heurística por texto de IllegalArgumentException.
     *
     * @param ex excepción de autenticación de Spring Security
     * @return respuesta 401 con mensaje genérico
     */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            org.springframework.security.core.AuthenticationException ex) {
        log.warn("⚠️ Error de autenticación: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error("Error de autenticación")
                .message("Credenciales inválidas")
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): falta de autorización (403) con cuerpo JSON.
     *
     * @param ex excepción de acceso denegado
     * @return respuesta 403 con mensaje genérico
     */
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            org.springframework.security.access.AccessDeniedException ex) {
        log.warn("⚠️ Acceso denegado: {}",
                ex.getMessage() != null ? ex.getMessage() : "Sin permisos suficientes");

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Acceso denegado")
                .message("No tiene permisos para realizar esta operación")
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): conflicto de bloqueo optimista (409).
     * Dos usuarios editaron el mismo registro concurrentemente.
     *
     * @param ex excepción de bloqueo optimista de Hibernate
     * @return respuesta 409 indicando que se debe recargar
     */
    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(
            org.springframework.orm.ObjectOptimisticLockingFailureException ex) {
        log.warn("⚠️ Conflicto de concurrencia (optimistic lock): {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflicto de edición")
                .message("Datos modificados por otro usuario. Recargue e intente de nuevo.")
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): violación de restricciones de validación de beans.
     *
     * @param ex excepción con el conjunto de restricciones incumplidas
     * @return respuesta 400 con el detalle de cada restricción
     */
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            jakarta.validation.ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));

        log.warn("❌ Violación de constraints: {}", errors);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Error de validación")
                .message("Los datos proporcionados no son válidos")
                .validationErrors(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): cuerpo JSON malformado o vacío (400).
     *
     * @param ex excepción de conversión del cuerpo de la solicitud
     * @return respuesta 400 con el motivo de la lectura fallida
     */
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex) {
        log.warn("⚠️ JSON inválido: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Solicitud inválida")
                .message("El cuerpo de la solicitud contiene JSON inválido o tipo de dato incorrecto")
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Auditoría 2026-09-11 (T1.1): parámetro de ruta o consulta con tipo inválido (400).
     *
     * @param ex excepción de conversión de tipo del parámetro
     * @return respuesta 400 indicando el parámetro y el tipo esperado
     */
    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex) {
        String nombre = ex.getName() != null ? ex.getName() : "parámetro";
        String mensaje = String.format("Parámetro inválido: %s (se esperaba %s)",
                nombre,
                ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "otro tipo");

        log.warn("⚠️ {}", mensaje);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Solicitud inválida")
                .message(mensaje)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja excepciones genéricas no capturadas.
     *
     * @param ex excepción inesperada
     * @return respuesta 500 con el cuerpo de error
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("❌ Error inesperado: {}", ex.getMessage(), ex);
        
        ErrorResponse error = ErrorResponse.builder()
            .timestamp(LocalDateTime.now())
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .error("Error interno del servidor")
            .message("Ha ocurrido un error inesperado")
            .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Cuerpo uniforme de las respuestas de error de la API.
     *
     * @param timestamp momento de generación de la respuesta
     * @param status código de estado HTTP
     * @param error descripción corta del tipo de error
     * @param message detalle legible del error
     * @param validationErrors errores por campo, presente solo en fallos de validación
     */
    @lombok.Builder
    public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        Map<String, String> validationErrors
    ) {}
}
