package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoCostoHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repositorio del histórico de costos de producto: expone la evolución del costo y del margen por producto.
 */
@Repository
public interface ProductoCostoHistoricoRepository extends JpaRepository<ProductoCostoHistorico, Long> {

    /**
     * Recupera todo el histórico de costos de un producto, del cálculo más reciente al más antiguo.
     *
     * @param productoId ID del producto
     * @return lista de registros históricos ordenada por fecha de cálculo descendente
     */
    List<ProductoCostoHistorico> findByProductoIdOrderByFechaCalculoDesc(Long productoId);

    /**
     * Recupera el histórico de costos de un producto de forma paginada.
     * Existe para consultar productos con muchos cálculos sin traer todo a memoria.
     *
     * @param productoId ID del producto
     * @param pageable   paginación y orden solicitados
     * @return página de registros históricos
     */
    Page<ProductoCostoHistorico> findByProductoIdOrderByFechaCalculoDesc(Long productoId, Pageable pageable);
}

