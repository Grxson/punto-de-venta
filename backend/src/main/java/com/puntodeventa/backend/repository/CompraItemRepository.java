package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.CompraItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositorio para CompraItem - consultas optimizadas.
 */
@Repository
public interface CompraItemRepository extends JpaRepository<CompraItem, Long> {

    /**
     * Obtiene los renglones de una compra ordenados por ID.
     *
     * @param compraId ID de la compra
     * @return lista de renglones de la compra
     */
    @Query("""
                SELECT ci FROM CompraItem ci
                WHERE ci.compra.id = :compraId
                ORDER BY ci.id
            """)
    List<CompraItem> findByCompraId(@Param("compraId") Long compraId);

    /**
     * Elimina todos los renglones de una compra.
     * Existe para vaciar el detalle antes de reescribirlo.
     *
     * @param compraId ID de la compra cuyos renglones se eliminan
     */
    void deleteByCompraId(@Param("compraId") Long compraId);
}
