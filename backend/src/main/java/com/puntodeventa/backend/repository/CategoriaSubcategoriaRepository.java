package com.puntodeventa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puntodeventa.backend.model.CategoriaSubcategoria;

import java.util.List;
import java.util.Optional;

/**
 * Repository para gestión de subcategorías de productos.
 */
@Repository
public interface CategoriaSubcategoriaRepository extends JpaRepository<CategoriaSubcategoria, Long> {

    /**
     * Obtener todas las subcategorías de una categoría, ordenadas por orden.
     */
    @Query(value = "SELECT * FROM categoria_subcategorias cs " +
            "WHERE cs.categoria_id = :categoriaId AND cs.activa = true " +
            "ORDER BY cs.orden ASC, cs.nombre ASC", nativeQuery = true)
    List<CategoriaSubcategoria> findByCategoriaIdOrderByOrden(@Param("categoriaId") Long categoriaId);

    /**
     * Obtener todas las subcategorías de una sucursal.
     * ✅ SEGREGACIÓN: Filtra por sucursal_id
     */
    @Query("SELECT cs FROM CategoriaSubcategoria cs WHERE cs.sucursal.id = :sucursalId")
    List<CategoriaSubcategoria> findBySucursal(@Param("sucursalId") Long sucursalId);

    /**
     * Obtener una subcategoría por nombre dentro de una categoría.
     */
    Optional<CategoriaSubcategoria> findByCategoriaIdAndNombre(Long categoriaId, String nombre);

    /**
     * Verificar si existe una subcategoría en una categoría.
     */
    boolean existsByCategoriaIdAndNombre(Long categoriaId, String nombre);
}
