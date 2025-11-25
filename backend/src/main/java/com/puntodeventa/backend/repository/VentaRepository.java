package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Venta;
import com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio JPA para ventas.
 */
@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
    
    List<Venta> findByEstado(String estado);
    
    List<Venta> findBySucursalId(Long sucursalId);
    
    List<Venta> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    @Query("""
        SELECT new com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate(
            COALESCE(SUM(v.total),0),
            COALESCE(SUM(v.subtotal),0),
            COUNT(v),
            COALESCE(SUM(i.cantidad),0),
            COALESCE(SUM(i.costoEstimado),0)
        )
        FROM Venta v
        JOIN v.items i
        WHERE v.estado = 'PAGADA' AND v.fecha BETWEEN :inicio AND :fin
        """)
    ResumenVentasAggregate aggregateResumen(@Param("inicio") LocalDateTime inicio,
                                            @Param("fin") LocalDateTime fin);
    
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Venta> findBySucursalAndFechaBetween(Long sucursalId, LocalDateTime fechaInicio, LocalDateTime fechaFin);
}
