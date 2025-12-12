package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Proveedor.
 */
@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    @Query("SELECT p FROM Proveedor p WHERE p.activo = true")
    List<Proveedor> findByActivoTrue();
    
    List<Proveedor> findByNombreContainingIgnoreCase(String nombre);
}
