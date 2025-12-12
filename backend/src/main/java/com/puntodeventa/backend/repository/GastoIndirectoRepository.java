package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.GastoIndirecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para Gastos Indirectos
 */
@Repository
public interface GastoIndirectoRepository extends JpaRepository<GastoIndirecto, Long> {
    
    List<GastoIndirecto> findBySucursalIdAndActivoTrue(Long sucursalId);
    
    List<GastoIndirecto> findBySucursalId(Long sucursalId);
    
    List<GastoIndirecto> findByActivoTrue();
}
