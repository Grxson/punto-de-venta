package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ManoObra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para Mano de Obra
 */
@Repository
public interface ManoObraRepository extends JpaRepository<ManoObra, Long> {
    
    List<ManoObra> findBySucursalIdAndActivoTrue(Long sucursalId);
    
    List<ManoObra> findBySucursalId(Long sucursalId);
    
    List<ManoObra> findByActivoTrue();
}
