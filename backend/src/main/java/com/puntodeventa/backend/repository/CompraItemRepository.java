package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CompraItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repository para CompraItem - Queries optimizadas.
 */
@Repository
public interface CompraItemRepository extends JpaRepository<CompraItem, Long> {

    /**
     * Obtener items de una compra.
     */
    @Query("""
                SELECT ci FROM CompraItem ci
                WHERE ci.compra.id = :compraId
                ORDER BY ci.id
            """)
    List<CompraItem> findByCompraId(@Param("compraId") Long compraId);

    /**
     * Eliminar todos los items de una compra.
     */
    void deleteByCompraId(@Param("compraId") Long compraId);
}
