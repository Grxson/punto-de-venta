package com.puntodeventa.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.puntodeventa.backend.model.CategoriaSubcategoria;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para gestión de subcategorías de productos.
 */
@Repository
public interface CategoriaSubcategoriaRepository extends JpaRepository<CategoriaSubcategoria, Long> {

    /**
     * Obtiene todas las subcategorías activas de una categoría, ordenadas por orden y luego por nombre.
     * Existe porque el orden de presentación dentro del menú no coincide con el orden de inserción.
     *
     * @param categoriaId ID de la categoría padre
     * @return lista de subcategorías activas ordenadas
     */
    @Query(value = "SELECT * FROM categoria_subcategorias cs " +
            "WHERE cs.categoria_id = :categoriaId AND cs.activa = true " +
            "ORDER BY cs.orden ASC, cs.nombre ASC", nativeQuery = true)
    List<CategoriaSubcategoria> findByCategoriaIdOrderByOrden(@Param("categoriaId") Long categoriaId);

    /**
     * Obtiene todas las subcategorías de una sucursal.
     * ✅ SEGREGACIÓN: Filtra por sucursal_id
     *
     * @param sucursalId ID de la sucursal
     * @return lista de subcategorías de la sucursal
     */
    @Query("SELECT cs FROM CategoriaSubcategoria cs WHERE cs.sucursal.id = :sucursalId")
    List<CategoriaSubcategoria> findBySucursal(@Param("sucursalId") Long sucursalId);

    /**
     * Obtiene una subcategoría por nombre dentro de una categoría.
     *
     * @param categoriaId ID de la categoría padre
     * @param nombre      nombre exacto de la subcategoría
     * @return la subcategoría coincidente, o vacío si no existe
     */
    Optional<CategoriaSubcategoria> findByCategoriaIdAndNombre(Long categoriaId, String nombre);

    /**
     * Verifica si existe una subcategoría con un nombre dentro de una categoría.
     * Existe para validar duplicados antes de insertar.
     *
     * @param categoriaId ID de la categoría padre
     * @param nombre      nombre a comprobar
     * @return true si ya existe una subcategoría con ese nombre en la categoría
     */
    boolean existsByCategoriaIdAndNombre(Long categoriaId, String nombre);
}
