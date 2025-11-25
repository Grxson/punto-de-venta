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
    
    List<InventarioMovimiento> findByIngredienteId(Long ingredienteId);
    
    List<InventarioMovimiento> findByIngredienteIdOrderByFechaDesc(Long ingredienteId);
    
    List<InventarioMovimiento> findByTipo(String tipo);
    
    List<InventarioMovimiento> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    List<InventarioMovimiento> findByIngredienteIdAndFechaBetween(
        Long ingredienteId, 
        LocalDateTime fechaInicio, 
        LocalDateTime fechaFin
    );
    
    @Query("SELECT m FROM InventarioMovimiento m WHERE m.ingrediente.id = :ingredienteId " +
           "AND m.tipo = :tipo AND m.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<InventarioMovimiento> findByIngredienteIdAndTipoAndFechaBetween(
        @Param("ingredienteId") Long ingredienteId,
        @Param("tipo") String tipo,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
    
    /**
     * Buscar movimientos de inventario relacionados con una venta específica.
     * Usado para revertir el consumo de inventario al cancelar una venta.
     */
    List<InventarioMovimiento> findByRefTipoAndRefId(String refTipo, Long refId);
}
