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
    
    @Query("SELECT m FROM ManoObra m WHERE m.sucursal.id = :sucursalId AND m.activo = true")
    List<ManoObra> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    List<ManoObra> findBySucursalId(Long sucursalId);
    
    @Query("SELECT m FROM ManoObra m WHERE m.activo = true")
    List<ManoObra> findByActivoTrue();
}
