package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TurnoRepository extends JpaRepository<Turno, Long> {
    Optional<Turno> findFirstByCajaIdAndActivoTrueOrderByFechaAperturaDesc(Long cajaId);

    Optional<Turno> findFirstBySucursalIdAndActivoTrueOrderByFechaAperturaDesc(Long sucursalId);
}