package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.VentaItemAtributoSeleccionado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad VentaItemAtributoSeleccionado
 */
@Repository
public interface VentaItemAtributoSeleccionadoRepository extends JpaRepository<VentaItemAtributoSeleccionado, Long> {
    
    /**
     * Encuentra todos los atributos seleccionados de un item de venta
     */
    @Query("SELECT vias FROM VentaItemAtributoSeleccionado vias WHERE vias.ventaItem.id = :ventaItemId ORDER BY vias.createdAt ASC")
    List<VentaItemAtributoSeleccionado> findByVentaItemId(@Param("ventaItemId") Long ventaItemId);
    
    /**
     * Elimina todos los atributos seleccionados de un item de venta
     */
    void deleteByVentaItemId(Long ventaItemId);
}
