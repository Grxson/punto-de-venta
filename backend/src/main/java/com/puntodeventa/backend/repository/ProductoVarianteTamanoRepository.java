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
     * Encuentra todos los tamaños de un producto/variante
     */
    @Query("SELECT pvt FROM ProductoVarianteTamano pvt WHERE pvt.producto.id = :productoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamano> findByProductoId(@Param("productoId") Long productoId);
    
    /**
     * Verifica si un producto tiene un tamaño específico
     */
    Optional<ProductoVarianteTamano> findByProductoIdAndTamanoId(Long productoId, Long tamanoId);
    
    /**
     * Encuentra productos que usan un tamaño específico
     */
    @Query("SELECT pvt FROM ProductoVarianteTamano pvt WHERE pvt.tamano.id = :tamanoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamano> findByTamanoId(@Param("tamanoId") Long tamanoId);
}
