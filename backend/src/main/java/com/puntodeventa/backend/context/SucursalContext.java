package com.puntodeventa.backend.context;

import com.puntodeventa.backend.exception.EntityNotFoundException;
import java.util.Optional;

/**
 * Contexto para mantener la sucursal actual del usuario en el hilo de ejecución.
 * 
 * Patrón: ThreadLocal Context
 * 
 * Uso:
 *   - El filtro HTTP establece la sucursal: SucursalContext.setSucursalId(1L)
 *   - Los servicios la obtienen: Long sucursalId = SucursalContext.getSucursalId()
 *   - Se limpia automáticamente al final del request
 * 
 * Ventaja: Evita pasar sucursalId como parámetro en cada llamada de servicio.
 */
public class SucursalContext {

    private static final ThreadLocal<Long> sucursalIdHolder = new ThreadLocal<>();
    private static final ThreadLocal<String> sucursalNombreHolder = new ThreadLocal<>();

    /**
     * Establece la sucursal actual en el contexto.
     */
    public static void setSucursal(Long sucursalId, String sucursalNombre) {
        sucursalIdHolder.set(sucursalId);
        sucursalNombreHolder.set(sucursalNombre);
    }

    /**
     * Obtiene la sucursal actual, lanzando excepción si no existe.
     */
    public static Long getSucursalId() {
        return getSucursalIdOpt()
            .orElseThrow(() -> new EntityNotFoundException("No hay sucursal seleccionada en el contexto"));
    }

    /**
     * Obtiene la sucursal actual de forma opcional.
     */
    public static Optional<Long> getSucursalIdOpt() {
        return Optional.ofNullable(sucursalIdHolder.get());
    }

    /**
     * Obtiene el nombre de la sucursal actual.
     */
    public static Optional<String> getSucursalNombre() {
        return Optional.ofNullable(sucursalNombreHolder.get());
    }

    /**
     * Limpia el contexto (se debe llamar al final del request).
     */
    public static void clear() {
        sucursalIdHolder.remove();
        sucursalNombreHolder.remove();
    }

    /**
     * Verifica si hay una sucursal establecida.
     */
    public static boolean hasSucursal() {
        return sucursalIdHolder.get() != null;
    }
}
