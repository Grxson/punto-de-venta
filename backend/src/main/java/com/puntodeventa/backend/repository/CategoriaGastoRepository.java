package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad CategoriaGasto.
 * Soporta búsquedas segregadas por sucursal.
 */
@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Long> {
    
    @Query("SELECT c FROM CategoriaGasto c WHERE c.activo = true")
    List<CategoriaGasto> findByActivoTrue();
    
    List<CategoriaGasto> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT c FROM CategoriaGasto c WHERE c.sucursal.id = :sucursalId AND c.activo = true")
    List<CategoriaGasto> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    List<CategoriaGasto> findBySucursalId(Long sucursalId);

    @Query("SELECT c FROM CategoriaGasto c WHERE c.nombre = :nombre AND c.sucursal.id = :sucursalId")
    Optional<CategoriaGasto> findByNombreAndSucursalId(@Param("nombre") String nombre, @Param("sucursalId") Long sucursalId);
}


