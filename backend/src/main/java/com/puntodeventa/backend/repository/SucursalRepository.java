package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para sucursales.
 */
@Repository
public interface SucursalRepository extends JpaRepository<Sucursal, Long> {
    
    List<Sucursal> findByActivoTrue();
    List<Sucursal> findByActivoFalse();
}
