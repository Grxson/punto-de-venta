package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.VentaItem;
import com.puntodeventa.backend.dto.aggregate.ProductoRendimientoAggregate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaItemRepository extends JpaRepository<VentaItem, Long> {

    @Query("""
        SELECT new com.puntodeventa.backend.dto.aggregate.ProductoRendimientoAggregate(
            i.producto.id,
            i.producto.nombre,
            i.producto.precio,
            i.producto.costoEstimado,
            COALESCE(SUM(i.cantidad),0),
            COALESCE(SUM(i.subtotal),0),
            COALESCE(SUM(i.costoEstimado),0)
        )
        FROM VentaItem i
        JOIN i.venta v
        WHERE v.estado = 'PAGADA' AND v.fecha BETWEEN :inicio AND :fin
        GROUP BY i.producto.id, i.producto.nombre, i.producto.precio, i.producto.costoEstimado
        ORDER BY SUM(i.subtotal) DESC
        """)
    List<ProductoRendimientoAggregate> topProductos(@Param("inicio") LocalDateTime inicio,
                                                    @Param("fin") LocalDateTime fin,
                                                    Pageable pageable);
}
