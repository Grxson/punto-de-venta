package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad CategoriaGasto.
 * Soporta búsquedas segregadas por sucursal.
 */
@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Long> {
    
    List<CategoriaGasto> findByActivoTrue();
    
    List<CategoriaGasto> findByNombreContainingIgnoreCase(String nombre);
    
    List<CategoriaGasto> findBySucursalIdAndActivoTrue(Long sucursalId);
    
    List<CategoriaGasto> findBySucursalId(Long sucursalId);
}


