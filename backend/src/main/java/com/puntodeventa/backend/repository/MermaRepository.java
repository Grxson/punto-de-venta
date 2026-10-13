package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Merma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la entidad Merma.
 */
@Repository
public interface MermaRepository extends JpaRepository<Merma, Long> {
    
    /**
     * Recupera las mermas registradas para un ingrediente.
     *
     * @param ingredienteId ID del ingrediente
     * @return lista de mermas del ingrediente
     */
    List<Merma> findByIngredienteId(Long ingredienteId);
    
    /**
     * Recupera las mermas registradas dentro de un rango de fechas.
     *
     * @param fechaInicio fecha de inicio del rango (inclusive)
     * @param fechaFin    fecha de fin del rango (inclusive)
     * @return lista de mermas del rango
     */
    List<Merma> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    /**
     * Recupera las mermas cuyo responsable es un usuario concreto.
     *
     * @param responsableId ID del usuario responsable
     * @return lista de mermas del responsable
     */
    List<Merma> findByResponsableId(Long responsableId);
    
    /**
     * Recupera las mermas de un periodo ordenadas por mayor costo.
     * Existe para identificar las pérdidas de mayor impacto económico.
     *
     * @param fechaInicio fecha de inicio del periodo (inclusive)
     * @param fechaFin    fecha de fin del periodo (inclusive)
     * @return lista de mermas ordenada por costo total descendente
     */
    @Query("SELECT m FROM Merma m WHERE m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.costoTotal DESC")
    List<Merma> findTopMermasByPeriodo(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}
