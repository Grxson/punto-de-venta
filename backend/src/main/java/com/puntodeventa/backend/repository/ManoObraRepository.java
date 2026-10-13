package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ManoObra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para Mano de Obra
 */
@Repository
public interface ManoObraRepository extends JpaRepository<ManoObra, Long> {
    
    /**
     * Recupera los registros de mano de obra activos de una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de registros activos de la sucursal
     */
    @Query("SELECT m FROM ManoObra m WHERE m.sucursal.id = :sucursalId AND m.activo = true")
    List<ManoObra> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    /**
     * Recupera todos los registros de mano de obra de una sucursal, incluidos los inactivos.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de registros de la sucursal
     */
    List<ManoObra> findBySucursalId(Long sucursalId);
    
    /**
     * Recupera todos los registros de mano de obra activos de todas las sucursales.
     *
     * @return lista de registros activos
     */
    @Query("SELECT m FROM ManoObra m WHERE m.activo = true")
    List<ManoObra> findByActivoTrue();
}
