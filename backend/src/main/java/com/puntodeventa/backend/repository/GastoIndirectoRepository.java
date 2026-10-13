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
    
    /**
     * Recupera los conceptos de gasto indirecto activos de una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de conceptos activos de la sucursal
     */
    @Query("SELECT g FROM GastoIndirecto g WHERE g.sucursal.id = :sucursalId AND g.activo = true")
    List<GastoIndirecto> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    /**
     * Recupera todos los conceptos de gasto indirecto de una sucursal, incluidos los inactivos.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de conceptos de la sucursal
     */
    List<GastoIndirecto> findBySucursalId(Long sucursalId);
    
    /**
     * Recupera todos los conceptos de gasto indirecto activos de todas las sucursales.
     *
     * @return lista de conceptos activos
     */
    @Query("SELECT g FROM GastoIndirecto g WHERE g.activo = true")
    List<GastoIndirecto> findByActivoTrue();
}
