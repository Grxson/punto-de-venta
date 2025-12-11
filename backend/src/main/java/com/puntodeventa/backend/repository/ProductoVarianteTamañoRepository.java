package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoVarianteTamaño;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad ProductoVarianteTamaño
 */
@Repository
public interface ProductoVarianteTamañoRepository extends JpaRepository<ProductoVarianteTamaño, Long> {
    
    /**
     * Encuentra todos los tamaños de un producto/variante
     */
    @Query("SELECT pvt FROM ProductoVarianteTamaño pvt WHERE pvt.producto.id = :productoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamaño> findByProductoId(@Param("productoId") Long productoId);
    
    /**
     * Verifica si un producto tiene un tamaño específico
     */
    Optional<ProductoVarianteTamaño> findByProductoIdAndTamañoId(Long productoId, Long tamañoId);
    
    /**
     * Encuentra productos que usan un tamaño específico
     */
    @Query("SELECT pvt FROM ProductoVarianteTamaño pvt WHERE pvt.tamaño.id = :tamañoId ORDER BY pvt.orden ASC")
    List<ProductoVarianteTamaño> findByTamañoId(@Param("tamañoId") Long tamañoId);
}
