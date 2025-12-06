package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.VentaItem;
import com.puntodeventa.backend.dto.aggregate.ProductoRendimientoAggregate;
import com.puntodeventa.backend.dto.aggregate.ProductoEstadisticasAggregate;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
        WHERE v.estado IN ('PAGADA', 'cerrada') AND v.fecha BETWEEN :inicio AND :fin
        GROUP BY i.producto.id, i.producto.nombre, i.producto.precio, i.producto.costoEstimado
        ORDER BY SUM(i.subtotal) DESC
        """)
    List<ProductoRendimientoAggregate> topProductos(@Param("inicio") LocalDateTime inicio,
                                                    @Param("fin") LocalDateTime fin,
                                                    Pageable pageable);

    /**
     * Obtiene las estadísticas de venta de un producto desde una fecha en adelante.
     * Incluye: frecuencia (número de transacciones), cantidad total, ingreso y última venta.
     */
    @Query("""
        SELECT new com.puntodeventa.backend.dto.aggregate.ProductoEstadisticasAggregate(
            i.producto.id,
            COUNT(DISTINCT i.venta.id) as frecuencia,
            COALESCE(SUM(i.cantidad), 0) as cantidad,
            COALESCE(SUM(i.subtotal), 0) as ingreso,
            MAX(v.fecha) as ultimaVenta
        )
        FROM VentaItem i
        JOIN i.venta v
        WHERE i.producto.id = :productoId 
            AND v.estado IN ('cerrada', 'PAGADA')
            AND v.fecha >= :desde
        """)
    Optional<ProductoEstadisticasAggregate> obtenerEstadisticasProducto(
            @Param("productoId") Long productoId,
            @Param("desde") LocalDateTime desde);

    /**
     * Obtiene estadísticas para todos los productos desde una fecha.
     * Retorna solo productos que tienen ventas en el período especificado.
     */
    @Query("""
        SELECT new com.puntodeventa.backend.dto.aggregate.ProductoEstadisticasAggregate(
            i.producto.id,
            COUNT(DISTINCT i.venta.id),
            COALESCE(SUM(i.cantidad), 0),
            COALESCE(SUM(i.subtotal), 0),
            MAX(v.fecha)
        )
        FROM VentaItem i
        JOIN i.venta v
        WHERE v.estado IN ('cerrada', 'PAGADA')
            AND v.fecha >= :desde
        GROUP BY i.producto.id
        """)
    List<ProductoEstadisticasAggregate> obtenerTodosLosEstadisticasEnPeriodo(@Param("desde") LocalDateTime desde);
}

