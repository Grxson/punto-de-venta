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
    
    /**
     * Recupera los pagos aplicados a una venta.
     *
     * @param ventaId ID de la venta
     * @return lista de pagos de la venta
     */
    List<Pago> findByVentaId(Long ventaId);
    
    /**
     * Recupera los pagos realizados con un método de pago concreto.
     *
     * @param metodoPagoId ID del método de pago
     * @return lista de pagos con ese método
     */
    List<Pago> findByMetodoPagoId(Long metodoPagoId);
}
