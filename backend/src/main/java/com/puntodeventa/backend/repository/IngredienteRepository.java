package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Ingrediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Ingrediente.
 */
@Repository
public interface IngredienteRepository extends JpaRepository<Ingrediente, Long> {

    /**
     * Recupera todos los ingredientes activos.
     *
     * @return lista de ingredientes con activo = true
     */
    @Query("SELECT i FROM Ingrediente i WHERE i.activo = true")
    List<Ingrediente> findByActivoTrue();

    /**
     * Recupera los ingredientes de una categoría concreta.
     *
     * @param categoria nombre de la categoría
     * @return lista de ingredientes de la categoría
     */
    List<Ingrediente> findByCategoria(String categoria);

    /**
     * Busca ingredientes cuyo nombre contiene el texto indicado, sin distinguir mayúsculas.
     *
     * @param nombre fragmento del nombre a buscar
     * @return lista de ingredientes coincidentes
     */
    List<Ingrediente> findByNombreContainingIgnoreCase(String nombre);

    /**
     * Obtiene la lista de categorías distintas no nulas, ordenadas alfabéticamente.
     * Existe para poblar el selector de categorías sin cargar los ingredientes.
     *
     * @return lista de nombres de categoría distintos
     */
    @Query("SELECT DISTINCT i.categoria FROM Ingrediente i WHERE i.categoria IS NOT NULL ORDER BY i.categoria")
    List<String> findAllCategorias();

    // ✅ ARREGLO: Usar = true en lugar de IS TRUE (activo se almacena como INTEGER)
    /**
     * Recupera los ingredientes activos que llevan control de stock mínimo.
     *
     * @return lista de ingredientes activos con stockMinimo definido
     */
    @Query("SELECT i FROM Ingrediente i WHERE i.activo = true AND i.stockMinimo IS NOT NULL")
    List<Ingrediente> findIngredientesConStockMinimo();

    // === CONSULTAS SIMPLES - RELACIONES CARGADAS BAJO DEMANDA ===
    /**
     * Recupera todos los ingredientes ordenados por ID.
     *
     * @return lista de ingredientes ordenada por ID ascendente
     */
    @Query("SELECT i FROM Ingrediente i ORDER BY i.id")
    List<Ingrediente> findAllOrdenado();

    /**
     * Recupera los ingredientes activos ordenados por ID.
     *
     * @return lista de ingredientes activos ordenada por ID ascendente
     */
    @Query("SELECT i FROM Ingrediente i WHERE i.activo = true ORDER BY i.id")
    List<Ingrediente> findAllActivosOrdenado();
}
