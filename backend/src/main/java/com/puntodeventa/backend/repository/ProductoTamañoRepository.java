package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoTamaño;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad ProductoTamaño
 */
@Repository
public interface ProductoTamañoRepository extends JpaRepository<ProductoTamaño, Long> {
    
    /**
     * Encuentra un tamaño por nombre
     */
    Optional<ProductoTamaño> findByNombreIgnoreCase(String nombre);
    
    /**
     * Encuentra todos los tamaños activos ordenados por orden
     * ✅ ARREGLO: Usar IS TRUE para PostgreSQL compatibility
     */
    @Query("SELECT pt FROM ProductoTamaño pt WHERE pt.activo IS TRUE ORDER BY pt.orden ASC")
    List<ProductoTamaño> findAllActivos();
    
    /**
     * Busca tamaños por nombre (case-insensitive)
     * ✅ ARREGLO: Usar IS TRUE para PostgreSQL compatibility
     */
    @Query("SELECT pt FROM ProductoTamaño pt WHERE LOWER(pt.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND pt.activo IS TRUE ORDER BY pt.orden ASC")
    List<ProductoTamaño> buscarPorNombre(String nombre);
}
