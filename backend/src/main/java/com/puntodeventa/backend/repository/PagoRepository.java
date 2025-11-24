package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para pagos.
 */
@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    
    List<Pago> findByVentaId(Long ventaId);
    
    List<Pago> findByMetodoPagoId(Long metodoPagoId);
}
