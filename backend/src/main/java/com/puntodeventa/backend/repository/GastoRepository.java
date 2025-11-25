package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la entidad Gasto.
 */
@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
    
    List<Gasto> findBySucursalId(Long sucursalId);
    
    List<Gasto> findByCategoriaGastoId(Long categoriaGastoId);
    
    List<Gasto> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    @Query("SELECT g FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Gasto> findBySucursalAndFechaBetween(@Param("sucursalId") Long sucursalId, 
                                               @Param("fechaInicio") LocalDateTime fechaInicio, 
                                               @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.fecha BETWEEN :fechaInicio AND :fechaFin")
    java.math.BigDecimal sumMontoByFechaBetween(@Param("fechaInicio") LocalDateTime fechaInicio, 
                                                 @Param("fechaFin") LocalDateTime fechaFin);
}

