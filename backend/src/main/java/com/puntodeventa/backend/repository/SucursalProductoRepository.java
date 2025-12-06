package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.SucursalProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad SucursalProducto.
 * Maneja la relación many-to-many entre Sucursal y Producto con configuración específica.
 */
@Repository
public interface SucursalProductoRepository extends JpaRepository<SucursalProducto, Long> {

    /**
     * Obtiene un producto de una sucursal específica.
     */
    Optional<SucursalProducto> findBySucursalIdAndProductoId(Long sucursalId, Long productoId);

    /**
     * Obtiene todos los productos de una sucursal que están disponibles.
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = true " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc(
            @Param("sucursalId") Long sucursalId
    );

    /**
     * Obtiene todos los productos de una sucursal (incluyendo no disponibles).
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findBySucursalIdOrderByOrdenVisualizacionAscNombreAsc(
            @Param("sucursalId") Long sucursalId
    );

    /**
     * Busca productos de una sucursal por nombre (disponibles).
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = true " +
           "AND sp.producto.nombre LIKE CONCAT('%', :nombre, '%') " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> buscarPorNombreEnSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("nombre") String nombre
    );

    /**
     * Obtiene los productos más vendidos de una sucursal en un período.
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "JOIN VentaItem vi ON vi.producto.id = sp.producto.id " +
           "JOIN Venta v ON v.id = vi.venta.id " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = true " +
           "AND v.sucursal.id = :sucursalId " +
           "AND v.fecha >= :desde " +
           "GROUP BY sp.id " +
           "ORDER BY SUM(vi.cantidad) DESC")
    List<SucursalProducto> obtenerProductosMasVendidosPorSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("desde") java.time.LocalDateTime desde
    );

    /**
     * Obtiene todos los productos de todas las sucursales (para admin).
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "ORDER BY sp.sucursal.nombre ASC, sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findAllByOrderBySucursalNombreAscOrdenVisualizacionAscProductoNombreAsc();

    /**
     * Cuenta cuántas sucursales venden un producto.
     */
    Long countByProductoId(Long productoId);

    /**
     * Verifica si un producto está disponible en una sucursal.
     */
    @Query("SELECT COUNT(sp) > 0 FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.producto.id = :productoId " +
           "AND sp.disponible = true")
    boolean estaDisponibleEnSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("productoId") Long productoId
    );
}
