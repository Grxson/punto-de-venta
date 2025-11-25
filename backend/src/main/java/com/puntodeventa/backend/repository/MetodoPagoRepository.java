package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para métodos de pago.
 */
@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    
    List<MetodoPago> findByActivoTrue();
    
    Optional<MetodoPago> findByNombreIgnoreCase(String nombre);
}
