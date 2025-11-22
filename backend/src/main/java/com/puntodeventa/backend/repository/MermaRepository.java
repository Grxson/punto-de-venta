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
    
    List<Merma> findByIngredienteId(Long ingredienteId);
    
    List<Merma> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    List<Merma> findByResponsableId(Long responsableId);
    
    @Query("SELECT m FROM Merma m WHERE m.fecha BETWEEN :fechaInicio AND :fechaFin ORDER BY m.costoTotal DESC")
    List<Merma> findTopMermasByPeriodo(
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );
}
