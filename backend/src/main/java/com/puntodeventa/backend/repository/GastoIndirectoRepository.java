package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.GastoIndirecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para Gastos Indirectos
 */
@Repository
public interface GastoIndirectoRepository extends JpaRepository<GastoIndirecto, Long> {
    
    @Query("SELECT g FROM GastoIndirecto g WHERE g.sucursal.id = :sucursalId AND g.activo = true")
    List<GastoIndirecto> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    List<GastoIndirecto> findBySucursalId(Long sucursalId);
    
    @Query("SELECT g FROM GastoIndirecto g WHERE g.activo = true")
    List<GastoIndirecto> findByActivoTrue();
}
