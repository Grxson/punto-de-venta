package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CategoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio de categorías de producto: expone el catálogo segregado por sucursal.
 */
@Repository
public interface CategoriaProductoRepository extends JpaRepository<CategoriaProducto, Long> {

    /**
     * Obtiene todas las categorías de una sucursal específica.
     * ✅ SEGREGACIÓN: Filtra por sucursal_id
     *
     * @param sucursalId ID de la sucursal
     * @return lista de categorías de la sucursal
     */
    @Query("SELECT c FROM CategoriaProducto c WHERE c.sucursal.id = :sucursalId")
    List<CategoriaProducto> findBySucursal(@Param("sucursalId") Long sucursalId);
}
