package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CategoriaGasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad CategoriaGasto.
 * Soporta búsquedas segregadas por sucursal.
 */
@Repository
public interface CategoriaGastoRepository extends JpaRepository<CategoriaGasto, Long> {
    
    /**
     * Recupera todas las categorías de gasto activas de todas las sucursales.
     * Existe para poblar catálogos de clasificación sin filtrar por sucursal.
     *
     * @return lista de categorías con activo = true
     */
    @Query("SELECT c FROM CategoriaGasto c WHERE c.activo = true")
    List<CategoriaGasto> findByActivoTrue();
    
    /**
     * Busca categorías cuyo nombre contiene el texto indicado, sin distinguir mayúsculas.
     *
     * @param nombre fragmento del nombre a buscar
     * @return lista de categorías coincidentes ordenada por el proveedor
     */
    List<CategoriaGasto> findByNombreContainingIgnoreCase(String nombre);
    
    /**
     * Recupera las categorías activas de una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de categorías activas de la sucursal
     */
    @Query("SELECT c FROM CategoriaGasto c WHERE c.sucursal.id = :sucursalId AND c.activo = true")
    List<CategoriaGasto> findBySucursalIdAndActivoTrue(@Param("sucursalId") Long sucursalId);
    
    /**
     * Recupera todas las categorías de una sucursal, incluidas las inactivas.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de categorías de la sucursal
     */
    List<CategoriaGasto> findBySucursalId(Long sucursalId);

    /**
     * Busca una categoría por nombre dentro de una sucursal, respetando la clave única natural.
     *
     * @param nombre     nombre exacto de la categoría
     * @param sucursalId ID de la sucursal propietaria
     * @return la categoría coincidente, o vacío si no existe
     */
    @Query("SELECT c FROM CategoriaGasto c WHERE c.nombre = :nombre AND c.sucursal.id = :sucursalId")
    Optional<CategoriaGasto> findByNombreAndSucursalId(@Param("nombre") String nombre, @Param("sucursalId") Long sucursalId);

    /**
     * Busca una categoría por nombre sin filtrar por sucursal.
     * Existe para resolver categorías globales cuando la sucursal no es relevante.
     *
     * @param nombre nombre exacto de la categoría
     * @return la primera categoría coincidente, o vacío si no existe
     */
    @Query("SELECT c FROM CategoriaGasto c WHERE c.nombre = :nombre")
    Optional<CategoriaGasto> findByNombre(@Param("nombre") String nombre);
}


