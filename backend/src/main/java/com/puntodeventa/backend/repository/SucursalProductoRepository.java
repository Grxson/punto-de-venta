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
     * Obtiene la configuración de un producto en una sucursal específica.
     *
     * @param sucursalId ID de la sucursal
     * @param productoId ID del producto
     * @return la configuración si existe, o vacío en caso contrario
     */
    Optional<SucursalProducto> findBySucursalIdAndProductoId(Long sucursalId, Long productoId);

    /**
     * Obtiene todos los productos disponibles de una sucursal, ordenados para el menú.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de configuraciones disponibles ordenada por orden de visualización y nombre
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = 1 " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc(
            @Param("sucursalId") Long sucursalId
    );

    /**
     * Obtiene todos los productos de una sucursal (incluyendo no disponibles).
     *
     * @param sucursalId ID de la sucursal
     * @return lista de configuraciones ordenada por orden de visualización y nombre
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findBySucursalIdOrderByOrdenVisualizacionAscNombreAsc(
            @Param("sucursalId") Long sucursalId
    );

    /**
     * Busca productos disponibles de una sucursal por nombre.
     *
     * @param sucursalId ID de la sucursal
     * @param nombre     fragmento del nombre del producto
     * @return lista de configuraciones coincidentes ordenada para el menú
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = 1 " +
           "AND sp.producto.nombre LIKE CONCAT('%', :nombre, '%') " +
           "ORDER BY sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> buscarPorNombreEnSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("nombre") String nombre
    );

    /**
     * Obtiene los productos más vendidos de una sucursal desde una fecha.
     * Agrega las cantidades en base de datos para no traer las ventas a memoria.
     *
     * @param sucursalId ID de la sucursal
     * @param desde      fecha desde la que se acumulan las ventas
     * @return lista de configuraciones ordenada por cantidad vendida descendente
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "JOIN VentaItem vi ON vi.producto.id = sp.producto.id " +
           "JOIN Venta v ON v.id = vi.venta.id " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.disponible = 1 " +
           "AND v.sucursal.id = :sucursalId " +
           "AND v.fecha >= :desde " +
           "GROUP BY sp.id " +
           "ORDER BY SUM(vi.cantidad) DESC")
    List<SucursalProducto> obtenerProductosMasVendidosPorSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("desde") java.time.LocalDateTime desde
    );

    /**
     * Obtiene todos los productos de todas las sucursales (para administración).
     *
     * @return lista de configuraciones ordenada por sucursal, orden de visualización y nombre
     */
    @Query("SELECT sp FROM SucursalProducto sp " +
           "ORDER BY sp.sucursal.nombre ASC, sp.ordenVisualizacion ASC, sp.producto.nombre ASC")
    List<SucursalProducto> findAllByOrderBySucursalNombreAscOrdenVisualizacionAscProductoNombreAsc();

    /**
     * Cuenta en cuántas sucursales está configurado un producto.
     *
     * @param productoId ID del producto
     * @return número de configuraciones del producto
     */
    Long countByProductoId(Long productoId);

    /**
     * Verifica si un producto está disponible en una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @param productoId ID del producto
     * @return true si existe una configuración disponible
     */
    @Query("SELECT COUNT(sp) > 0 FROM SucursalProducto sp " +
           "WHERE sp.sucursal.id = :sucursalId " +
           "AND sp.producto.id = :productoId " +
           "AND sp.disponible = 1")
    boolean estaDisponibleEnSucursal(
            @Param("sucursalId") Long sucursalId,
            @Param("productoId") Long productoId
    );
}
