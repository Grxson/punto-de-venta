package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de cajas: expone las cajas activas de una sucursal.
 */
public interface CajaRepository extends JpaRepository<Caja, Long> {

    /**
     * Obtiene la primera caja activa de una sucursal, ordenada por ID ascendente.
     * Existe para resolver la caja por defecto cuando la sucursal opera con una sola.
     *
     * @param sucursalId ID de la sucursal
     * @return la caja activa de menor ID, o vacío si la sucursal no tiene cajas activas
     */
    Optional<Caja> findFirstBySucursalIdAndActivaTrueOrderByIdAsc(Long sucursalId);
}