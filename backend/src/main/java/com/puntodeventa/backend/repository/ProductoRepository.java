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
}
