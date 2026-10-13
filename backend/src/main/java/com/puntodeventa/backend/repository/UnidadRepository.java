package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Unidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para la entidad Unidad.
 */
@Repository
public interface UnidadRepository extends JpaRepository<Unidad, Long> {
    
    /**
     * Busca una unidad de medida por su abreviatura (g, ml, kg).
     *
     * @param abreviatura símbolo corto de la unidad
     * @return la unidad coincidente, o vacío si no existe
     */
    Optional<Unidad> findByAbreviatura(String abreviatura);
    
    /**
     * Busca una unidad de medida por su nombre completo.
     *
     * @param nombre nombre de la unidad (gramos, mililitros, piezas)
     * @return la unidad coincidente, o vacío si no existe
     */
    Optional<Unidad> findByNombre(String nombre);
}
