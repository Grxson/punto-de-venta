package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoVarianteTamano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad ProductoVarianteTamano
 */
@Repository
public interface ProductoVarianteTamanoRepository extends JpaRepository<ProductoVarianteTamano, Long> {

    /**
     * Encuentra todos los tamaños de un producto o variante, ordenados por orden.
     *
     * @param productoId ID del producto o variante
     * @return lista de vínculos producto-tamaño ordenados
     */
    @Query("SELECT pvt FROM ProductoVarianteTamano pvt WHERE pvt.producto.id = :productoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamano> findByProductoId(@Param("productoId") Long productoId);

    /**
     * Obtiene el vínculo entre un producto y un tamaño concreto.
     *
     * @param productoId ID del producto
     * @param tamanoId   ID del tamaño
     * @return el vínculo si existe, o vacío en caso contrario
     */
    Optional<ProductoVarianteTamano> findByProductoIdAndTamanoId(Long productoId, Long tamanoId);

    /**
     * Encuentra los vínculos que usan un tamaño específico.
     *
     * @param tamanoId ID del tamaño
     * @return lista de vínculos que incluyen el tamaño, ordenados por orden
     */
    @Query("SELECT pvt FROM ProductoVarianteTamano pvt WHERE pvt.tamano.id = :tamanoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamano> findByTamanoId(@Param("tamanoId") Long tamanoId);
}
