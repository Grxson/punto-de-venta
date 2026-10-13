package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Venta;
import com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio JPA para ventas.
 */
@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    /**
     * Recupera las ventas en un estado concreto.
     *
     * @param estado estado de la venta (abierta, cerrada, cancelada)
     * @return lista de ventas en ese estado
     */
    List<Venta> findByEstado(String estado);

    /**
     * Recupera todas las ventas de una sucursal ordenadas por fecha descendente.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de ventas de la sucursal
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId ORDER BY v.fecha DESC")
    List<Venta> findBySucursalId(@Param("sucursalId") Long sucursalId);

    /**
     * 🔧 NUEVA: Obtener ventas con paginación correcta
     * Usa Page para evitar traer todos los registros a memoria
     *
     * @param sucursalId ID de la sucursal
     * @param pageable   paginación y orden solicitados
     * @return página de ventas de la sucursal ordenadas por fecha descendente
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId ORDER BY v.fecha DESC")
    Page<Venta> findBySucursalIdPageable(@Param("sucursalId") Long sucursalId, Pageable pageable);

    /**
     * 🔧 NUEVA: Obtener ventas con paginación correcta + filtro de fechas
     * Usa Page para evitar traer todos los registros a memoria
     * 📅 Filtra por rango de fechas para carga eficiente
     *
     * @param sucursalId ID de la sucursal
     * @param fechaDesde fecha de inicio del rango (inclusive)
     * @param fechaHasta fecha de fin del rango (inclusive)
     * @param pageable   paginación y orden solicitados
     * @return página de ventas del rango ordenadas por fecha descendente
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.fecha BETWEEN :fechaDesde AND :fechaHasta ORDER BY v.fecha DESC")
    Page<Venta> findBySucursalIdAndFechaRangePageable(
            @Param("sucursalId") Long sucursalId,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("fechaHasta") LocalDateTime fechaHasta,
            Pageable pageable);

    /**
     * Recupera las ventas registradas dentro de un rango de fechas.
     *
     * @param fechaInicio fecha de inicio del rango (inclusive)
     * @param fechaFin    fecha de fin del rango (inclusive)
     * @return lista de ventas del rango
     */
    List<Venta> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Calcula el resumen agregado de ventas cerradas de todas las sucursales en un rango de fechas.
     *
     * @param inicio fecha de inicio del rango (inclusive)
     * @param fin    fecha de fin del rango (inclusive)
     * @return agregado con totales, número de ventas, unidades y costo estimado
     */
    @Query("""
            SELECT new com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate(
                COALESCE(SUM(v.total), 0),
                COALESCE(SUM(v.subtotal), 0),
                COUNT(DISTINCT v.id),
                (SELECT COALESCE(SUM(i2.cantidad), 0) FROM VentaItem i2 JOIN i2.venta v2 WHERE v2.estado = 'cerrada' AND v2.fecha BETWEEN :inicio AND :fin),
                (SELECT COALESCE(SUM(i3.costoEstimado), 0) FROM VentaItem i3 JOIN i3.venta v3 WHERE v3.estado = 'cerrada' AND v3.fecha BETWEEN :inicio AND :fin)
            )
            FROM Venta v
            WHERE v.estado = 'cerrada' AND v.fecha BETWEEN :inicio AND :fin
            """)
    ResumenVentasAggregate aggregateResumen(@Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    /**
     * Recupera las ventas de una sucursal dentro de un rango de fechas.
     *
     * @param sucursalId  ID de la sucursal
     * @param fechaInicio fecha de inicio del rango (inclusive)
     * @param fechaFin    fecha de fin del rango (inclusive)
     * @return lista de ventas de la sucursal y rango
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Venta> findBySucursalAndFechaBetween(Long sucursalId, LocalDateTime fechaInicio, LocalDateTime fechaFin);

    /**
     * Obtiene ventas con items cargados de forma anticipada para evitar consultas N+1.
     * Optimizado para reportes que necesitan acceder a items.
     * 
     * @param sucursalId  ID de la sucursal
     * @param fechaInicio Fecha inicio
     * @param fechaFin    Fecha fin
     * @return Lista de ventas con items precargados
     */
    @EntityGraph(attributePaths = { "items", "items.producto" })
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.fecha BETWEEN :fechaInicio AND :fechaFin")
    List<Venta> findBySucursalIdAndFechaBetween(
            @Param("sucursalId") Long sucursalId,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Obtiene el desglose de ventas por método de pago para un rango de fechas.
     * Solo cuenta ventas con estado 'cerrada'.
     *
     * @param sucursalId ID de la sucursal
     * @param inicio     fecha de inicio del rango (inclusive)
     * @param fin        fecha de fin del rango (inclusive)
     * @return lista de arreglos donde [0]=nombre método de pago, [1]=total (BigDecimal)
     */
    @Query("""
            SELECT mp.nombre, COALESCE(SUM(p.monto), 0)
            FROM Pago p
            JOIN p.metodoPago mp
            JOIN p.venta v
            WHERE v.sucursal.id = :sucursalId AND LOWER(v.estado) = 'cerrada' AND v.fecha BETWEEN :inicio AND :fin
            GROUP BY mp.id, mp.nombre
            ORDER BY mp.nombre
            """)
    List<Object[]> sumByMetodoPago(@Param("sucursalId") Long sucursalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);

    // ==================== MÉTODOS PARA SEGREGACIÓN POR SUCURSAL
    // ====================

    /**
     * Obtener ventas por estado en una sucursal específica.
     * 
     * @param sucursalId ID de la sucursal
     * @param estado     Estado de la venta (abierta, cerrada, cancelada)
     * @return Lista de ventas
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.estado = :estado")
    List<Venta> findBySucursalIdAndEstado(@Param("sucursalId") Long sucursalId, @Param("estado") String estado);

    /**
     * Obtener ventas por estado y rango de fechas en una sucursal.
     * 
     * @param sucursalId  ID de la sucursal
     * @param estado      Estado de la venta
     * @param fechaInicio Fecha de inicio (inclusive)
     * @param fechaFin    Fecha de fin (inclusive)
     * @return Lista de ventas
     */
    @Query("SELECT v FROM Venta v WHERE v.sucursal.id = :sucursalId AND v.estado = :estado AND v.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY v.fecha DESC")
    List<Venta> findBySucursalIdAndEstadoAndFechaBetween(
            @Param("sucursalId") Long sucursalId,
            @Param("estado") String estado,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    /**
     * Resumen de ventas agregado por sucursal y rango de fechas.
     * 
     * @param sucursalId ID de la sucursal
     * @param inicio     Fecha de inicio
     * @param fin        Fecha de fin
     * @return Agregado con totales
     */
    @Query("""
            SELECT new com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate(
                COALESCE(SUM(v.total), 0),
                COALESCE(SUM(v.subtotal), 0),
                COUNT(DISTINCT v.id),
                (SELECT COALESCE(SUM(i2.cantidad), 0) FROM VentaItem i2 JOIN i2.venta v2 WHERE v2.sucursal.id = :sucursalId AND LOWER(v2.estado) = 'cerrada' AND v2.fecha BETWEEN :inicio AND :fin),
                (SELECT COALESCE(SUM(i3.costoEstimado), 0) FROM VentaItem i3 JOIN i3.venta v3 WHERE v3.sucursal.id = :sucursalId AND LOWER(v3.estado) = 'cerrada' AND v3.fecha BETWEEN :inicio AND :fin)
            )
            FROM Venta v
            WHERE v.sucursal.id = :sucursalId AND LOWER(v.estado) = 'cerrada' AND v.fecha BETWEEN :inicio AND :fin
            """)
    ResumenVentasAggregate aggregateResumenBySucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin);
}
