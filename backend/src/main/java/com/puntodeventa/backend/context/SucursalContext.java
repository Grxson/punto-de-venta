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
     *
     * @param sucursalId identificador de la sucursal seleccionada
     * @param sucursalNombre nombre descriptivo de la sucursal
     */
    public static void setSucursal(Long sucursalId, String sucursalNombre) {
        sucursalIdHolder.set(sucursalId);
        sucursalNombreHolder.set(sucursalNombre);
    }

    /**
     * Obtiene la sucursal actual, lanzando excepción si no existe.
     *
     * @return identificador de la sucursal activa
     * @throws EntityNotFoundException si el contexto no tiene sucursal establecida
     */
    public static Long getSucursalId() {
        return getSucursalIdOpt()
            .orElseThrow(() -> new EntityNotFoundException("No hay sucursal seleccionada en el contexto"));
    }

    /**
     * Obtiene la sucursal actual de forma opcional.
     *
     * @return identificador de la sucursal activa o vacío si no hay ninguna
     */
    public static Optional<Long> getSucursalIdOpt() {
        return Optional.ofNullable(sucursalIdHolder.get());
    }

    /**
     * Obtiene el nombre de la sucursal actual.
     *
     * @return nombre de la sucursal activa o vacío si no hay ninguna
     */
    public static Optional<String> getSucursalNombre() {
        return Optional.ofNullable(sucursalNombreHolder.get());
    }

    /**
     * Limpia el contexto (se debe llamar al final del request) para no arrastrar
     * la sucursal a los hilos reutilizados por el contenedor de hilos virtuales.
     */
    public static void clear() {
        sucursalIdHolder.remove();
        sucursalNombreHolder.remove();
    }

    /**
     * Verifica si hay una sucursal establecida.
     *
     * @return {@code true} si el contexto tiene sucursal
     */
    public static boolean hasSucursal() {
        return sucursalIdHolder.get() != null;
    }
}
