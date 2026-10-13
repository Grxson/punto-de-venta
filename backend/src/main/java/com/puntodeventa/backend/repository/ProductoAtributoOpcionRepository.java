package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoAtributoOpcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad ProductoAtributoOpcion
 */
@Repository
public interface ProductoAtributoOpcionRepository extends JpaRepository<ProductoAtributoOpcion, Long> {

    /**
     * Encuentra todas las opciones activas de un atributo, ordenadas por orden.
     * ✅ ARREGLO: Usar = true en lugar de IS TRUE (activo se almacena como INTEGER)
     *
     * @param atributoId ID del atributo
     * @return lista de opciones activas ordenadas
     */
    @Query("SELECT pao FROM ProductoAtributoOpcion pao WHERE pao.atributo.id = :atributoId AND pao.activo = true ORDER BY pao.orden ASC")
    List<ProductoAtributoOpcion> findByAtributoIdActivas(@Param("atributoId") Long atributoId);

    /**
     * Encuentra todas las opciones de un atributo (incluyendo inactivas).
     *
     * @param atributoId ID del atributo
     * @return lista de opciones ordenadas
     */
    @Query("SELECT pao FROM ProductoAtributoOpcion pao WHERE pao.atributo.id = :atributoId ORDER BY pao.orden ASC")
    List<ProductoAtributoOpcion> findByAtributoId(@Param("atributoId") Long atributoId);

    /**
     * Busca opciones activas de un atributo cuyo nombre contiene el texto indicado.
     * ✅ ARREGLO: Usar = true en lugar de IS TRUE (activo se almacena como INTEGER)
     *
     * @param atributoId ID del atributo
     * @param nombre     fragmento del nombre a buscar
     * @return lista de opciones coincidentes
     */
    @Query("SELECT pao FROM ProductoAtributoOpcion pao WHERE pao.atributo.id = :atributoId AND LOWER(pao.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND pao.activo = true")
    List<ProductoAtributoOpcion> buscarPorNombre(@Param("atributoId") Long atributoId, @Param("nombre") String nombre);
}
