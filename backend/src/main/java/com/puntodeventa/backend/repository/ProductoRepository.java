package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Producto.
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByActivoTrue();

    List<Producto> findByDisponibleEnMenuTrue();

    List<Producto> findByCategoriaId(Long categoriaId);

    List<Producto> findByNombreContainingIgnoreCase(String nombre);

    // Métodos para variantes
    List<Producto> findByProductoBaseIdOrderByOrdenVarianteAsc(Long productoBaseId);

    List<Producto> findByProductoBaseIdIsNull();

    List<Producto> findByProductoBaseIdIsNullAndActivoTrue();

    List<Producto> findByProductoBaseIdIsNullAndDisponibleEnMenuTrue();

    // Buscar por SKU
    Optional<Producto> findBySku(String sku);

    // Contar variantes de un producto base - EFICIENTE CON QUERY
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.productoBase.id = :productoBaseId")
    long countVariantesByProductoBaseId(@Param("productoBaseId") Long productoBaseId);

    // ==================== MÉTODOS PARA SEGREGACIÓN POR SUCURSAL ====================

    /**
     * Obtener todos los productos de una sucursal específica.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos de esa sucursal
     */
    List<Producto> findBySucursalId(Long sucursalId);

    /**
     * Obtener productos activos de una sucursal.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos activos
     */
    List<Producto> findBySucursalIdAndActivoTrue(Long sucursalId);

    /**
     * Obtener productos en menú de una sucursal.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos en menú
     */
    List<Producto> findBySucursalIdAndDisponibleEnMenuTrue(Long sucursalId);

    /**
     * Buscar productos en una sucursal por nombre.
     * @param sucursalId ID de la sucursal
     * @param nombre Nombre del producto (parcial)
     * @return Lista de productos encontrados
     */
    @Query("SELECT p FROM Producto p WHERE p.sucursal.id = :sucursalId AND p.nombre LIKE %:nombre%")
    List<Producto> buscarBySucursalYNombre(@Param("sucursalId") Long sucursalId, @Param("nombre") String nombre);

    /**
     * Obtener productos base (sin variantes) de una sucursal.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos base
     */
    List<Producto> findBySucursalIdAndProductoBaseIdIsNull(Long sucursalId);

    /**
     * Obtener productos base activos de una sucursal.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos base activos
     */
    List<Producto> findBySucursalIdAndProductoBaseIdIsNullAndActivoTrue(Long sucursalId);

    /**
     * Obtener productos base en menú de una sucursal.
     * @param sucursalId ID de la sucursal
     * @return Lista de productos base en menú
     */
    List<Producto> findBySucursalIdAndProductoBaseIdIsNullAndDisponibleEnMenuTrue(Long sucursalId);

    /**
     * OPTIMIZACIÓN PASO 1.5: Obtener variantes de un producto base sin N+1
     * Usa JOIN FETCH para cargar variantes en una sola query
     * 
     * @param productoBaseId ID del producto base
     * @return Lista de variantes ordenadas por orden
     */
    @Query("""
        SELECT p FROM Producto p 
        WHERE p.productoBase.id = :productoBaseId 
        ORDER BY p.ordenVariante ASC NULLS LAST, p.id ASC
    """)
    List<Producto> findVariantesByProductoBaseId(@Param("productoBaseId") Long productoBaseId);

    /**
     * OPTIMIZACIÓN PASO 1.5: Obtener todos los productos de una sucursal 
     * con sus relaciones prelogueadas (JOIN FETCH) para evitar N+1
     * 
     * @param sucursalId ID de la sucursal
     * @return Lista de productos base con categorías precargadas
     */
    @Query("""
        SELECT DISTINCT p FROM Producto p 
        LEFT JOIN FETCH p.categoria 
        WHERE p.sucursal.id = :sucursalId 
        AND p.productoBase IS NULL
        ORDER BY p.id ASC
    """)
    List<Producto> findProductosBaseWithCategoriaFetch(@Param("sucursalId") Long sucursalId);

    /**
     * OPTIMIZACIÓN CRÍTICA: Obtener productos base CON sus variantes en UNA sola query
     * Usa LEFT JOIN FETCH para cargar variantes sin N+1 problem
     * 
     * @param sucursalId ID de la sucursal
     * @return Lista de productos base con variantes, categorías y atributos precargados
     */
    @Query("""
        SELECT DISTINCT p FROM Producto p 
        LEFT JOIN FETCH p.categoria c
        LEFT JOIN FETCH p.variantes v
        WHERE p.sucursal.id = :sucursalId 
        AND p.productoBase IS NULL
        ORDER BY p.id ASC, v.ordenVariante ASC NULLS LAST, v.id ASC
    """)
    List<Producto> findProductosBaseConVariantes(@Param("sucursalId") Long sucursalId);
}
