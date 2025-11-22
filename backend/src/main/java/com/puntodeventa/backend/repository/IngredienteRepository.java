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
    
    List<Ingrediente> findByActivoTrue();
    
    List<Ingrediente> findByCategoria(String categoria);
    
    List<Ingrediente> findByNombreContainingIgnoreCase(String nombre);
    
    @Query("SELECT DISTINCT i.categoria FROM Ingrediente i WHERE i.categoria IS NOT NULL ORDER BY i.categoria")
    List<String> findAllCategorias();
    
    @Query("SELECT i FROM Ingrediente i WHERE i.activo = true AND i.stockMinimo IS NOT NULL")
    List<Ingrediente> findIngredientesConStockMinimo();
}
