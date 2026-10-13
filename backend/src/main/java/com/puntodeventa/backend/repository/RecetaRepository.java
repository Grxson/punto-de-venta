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
    
    /**
     * Recupera los renglones de receta de un producto.
     *
     * @param productoId ID del producto
     * @return lista de ingredientes y cantidades del producto
     */
    List<Receta> findByProductoId(Long productoId);
    
    /**
     * Recupera los productos que usan un ingrediente.
     *
     * @param ingredienteId ID del ingrediente
     * @return lista de renglones que consumen el ingrediente
     */
    List<Receta> findByIngredienteId(Long ingredienteId);
    
    /**
     * Recupera los renglones de receta de un producto con ingrediente y unidad precargados.
     * Usa JOIN FETCH para evitar el problema N+1 al costear el producto.
     *
     * @param productoId ID del producto
     * @return lista de renglones con ingrediente y unidad cargados
     */
    @Query("SELECT r FROM Receta r JOIN FETCH r.ingrediente JOIN FETCH r.unidad WHERE r.productoId = :productoId")
    List<Receta> findByProductoIdWithDetails(@Param("productoId") Long productoId);
    
    /**
     * Elimina el renglón de receta que relaciona un producto con un ingrediente.
     *
     * @param productoId    ID del producto
     * @param ingredienteId ID del ingrediente
     */
    void deleteByProductoIdAndIngredienteId(Long productoId, Long ingredienteId);
}
