package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.InventarioMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la entidad InventarioMovimiento.
 */
@Repository
public interface InventarioMovimientoRepository extends JpaRepository<InventarioMovimiento, Long> {
    
    /**
     * Recupera todos los movimientos de un ingrediente.
     *
     * @param ingredienteId ID del ingrediente
     * @return lista de movimientos del ingrediente
     */
    List<InventarioMovimiento> findByIngredienteId(Long ingredienteId);
    
    /**
     * Recupera los movimientos de un ingrediente ordenados del más reciente al más antiguo.
     *
     * @param ingredienteId ID del ingrediente
     * @return lista de movimientos ordenada por fecha descendente
     */
    List<InventarioMovimiento> findByIngredienteIdOrderByFechaDesc(Long ingredienteId);
    
    /**
     * Recupera los movimientos de un tipo concreto (entrada, consumo, ajuste, merma, devolucion).
     *
     * @param tipo naturaleza del movimiento
     * @return lista de movimientos del tipo indicado
     */
    List<InventarioMovimiento> findByTipo(String tipo);
    
    /**
     * Recupera los movimientos registrados dentro de un rango de fechas.
     *
     * @param fechaInicio fecha de inicio del rango (inclusive)
     * @param fechaFin    fecha de fin del rango (inclusive)
     * @return lista de movimientos del rango
     */
    List<InventarioMovimiento> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    /**
     * Recupera los movimientos de un ingrediente dentro de un rango de fechas.
     *
     * @param ingredienteId ID del ingrediente
     * @param fechaInicio   fecha de inicio del rango (inclusive)
     * @param fechaFin      fecha de fin del rango (inclusive)
     * @return lista de movimientos del ingrediente en el rango
     */
    List<InventarioMovimiento> findByIngredienteIdAndFechaBetween(
        Long ingredienteId, 
        LocalDateTime fechaInicio, 
        LocalDateTime fechaFin
    );
    
    /**
     * Recupera los movimientos de un ingrediente y tipo dentro de un rango de fechas.
     *
     * @param ingredienteId ID del ingrediente
     * @param tipo          naturaleza del movimiento
     * @param fechaInicio   fecha de inicio del rango (inclusive)
     * @param fechaFin      fecha de fin del rango (inclusive)
     * @return lista de movimientos coincidentes
     */
    @Query("SELECT m FROM InventarioMovimiento m WHERE m.ingrediente.id = :ingredienteId " +
           "AND m.tipo = :tipo AND m.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<InventarioMovimiento> findByIngredienteIdAndTipoAndFechaBetween(
        @Param("ingredienteId") Long ingredienteId,
        @Param("tipo") String tipo,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
    
    /**
     * Busca movimientos de inventario relacionados con una venta específica.
     * Usado para revertir el consumo de inventario al cancelar una venta.
     *
     * @param refTipo tipo del documento origen (venta, compra, ajuste, merma)
     * @param refId   ID del documento origen
     * @return lista de movimientos asociados al documento
     */
    List<InventarioMovimiento> findByRefTipoAndRefId(String refTipo, Long refId);

    /**
     * Auditoría 2026-09-11 (C2): indica si un ingrediente ya es rastreado por el
     * sistema de inventario (tiene historial de movimientos).
     * Activa la validación de stock al vender (adopción progresiva).
     *
     * @param ingredienteId ID del ingrediente
     * @return true si el ingrediente tiene al menos un movimiento registrado
     */
    boolean existsByIngredienteId(Long ingredienteId);
}
