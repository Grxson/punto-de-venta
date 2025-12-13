package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoTamano;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad ProductoTamano
 */
@Repository
public interface ProductoTamanoRepository extends JpaRepository<ProductoTamano, Long> {

    /**
     * Encuentra un tamaño por nombre
     */
    Optional<ProductoTamano> findByNombreIgnoreCase(String nombre);

    /**
     * Encuentra todos los tamaños activos ordenados por orden
     * ✅ ARREGLO: Usar = true en lugar de IS TRUE (activo se almacena como INTEGER)
     */
    @Query("SELECT pt FROM ProductoTamano pt WHERE pt.activo = true ORDER BY pt.orden ASC")
    List<ProductoTamano> findAllActivos();

    /**
     * Busca tamaños por nombre (case-insensitive)
     * ✅ ARREGLO: Usar = true en lugar de IS TRUE (activo se almacena como INTEGER)
     */
    @Query("SELECT pt FROM ProductoTamano pt WHERE LOWER(pt.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND pt.activo = true ORDER BY pt.orden ASC")
    List<ProductoTamano> buscarPorNombre(String nombre);
}
