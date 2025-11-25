package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoCostoHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProductoCostoHistoricoRepository extends JpaRepository<ProductoCostoHistorico, Long> {
    List<ProductoCostoHistorico> findByProductoIdOrderByFechaCalculoDesc(Long productoId);
    Page<ProductoCostoHistorico> findByProductoIdOrderByFechaCalculoDesc(Long productoId, Pageable pageable);
}

