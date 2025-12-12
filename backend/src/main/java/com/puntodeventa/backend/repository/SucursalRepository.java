package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para sucursales.
 */
@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    
    @Query("SELECT s FROM Sucursal s WHERE s.activo = true")
    List<Sucursal> findByActivoTrue();
    @Query("SELECT s FROM Sucursal s WHERE s.activo = false")
    List<Sucursal> findByActivoFalse();
}
