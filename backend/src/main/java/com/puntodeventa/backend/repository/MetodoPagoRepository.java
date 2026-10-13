package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para métodos de pago.
 */
@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {
    
    /**
     * Recupera los métodos de pago activos del catálogo.
     *
     * @return lista de métodos con activo = true
     */
    @Query("SELECT m FROM MetodoPago m WHERE m.activo = true")
    List<MetodoPago> findByActivoTrue();
    
    /**
     * Busca un método de pago por nombre sin distinguir mayúsculas.
     *
     * @param nombre nombre del medio de cobro
     * @return el método coincidente, o vacío si no existe
     */
    Optional<MetodoPago> findByNombreIgnoreCase(String nombre);
}
