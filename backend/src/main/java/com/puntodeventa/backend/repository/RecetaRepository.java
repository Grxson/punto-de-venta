package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Receta;
import com.puntodeventa.backend.model.RecetaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Receta.
 */
@Repository
public interface RecetaRepository extends JpaRepository<Receta, RecetaId> {
    
    List<Receta> findByProductoId(Long productoId);
    
    List<Receta> findByIngredienteId(Long ingredienteId);
    
    @Query("SELECT r FROM Receta r JOIN FETCH r.ingrediente JOIN FETCH r.unidad WHERE r.productoId = :productoId")
    List<Receta> findByProductoIdWithDetails(@Param("productoId") Long productoId);
    
    void deleteByProductoIdAndIngredienteId(Long productoId, Long ingredienteId);
}
