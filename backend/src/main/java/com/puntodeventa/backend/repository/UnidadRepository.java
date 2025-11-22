package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Unidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para la entidad Unidad.
 */
@Repository
public interface UnidadRepository extends JpaRepository<Unidad, Long> {
    
    Optional<Unidad> findByAbreviatura(String abreviatura);
    
    Optional<Unidad> findByNombre(String nombre);
}
