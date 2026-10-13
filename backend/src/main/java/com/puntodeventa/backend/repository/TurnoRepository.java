package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de turnos: expone el turno abierto de una caja o de una sucursal.
 */
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    /**
     * Obtiene el turno abierto más reciente de una caja.
     *
     * @param cajaId ID de la caja
     * @return el turno activo de apertura más reciente, o vacío si la caja no tiene turno abierto
     */
    Optional<Turno> findFirstByCajaIdAndActivoTrueOrderByFechaAperturaDesc(Long cajaId);

    /**
     * Obtiene el turno abierto más reciente de una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @return el turno activo de apertura más reciente, o vacío si la sucursal no tiene turno abierto
     */
    Optional<Turno> findFirstBySucursalIdAndActivoTrueOrderByFechaAperturaDesc(Long sucursalId);
}