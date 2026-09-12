package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CajaRepository extends JpaRepository<Caja, Long> {
    Optional<Caja> findFirstBySucursalIdAndActivaTrueOrderByIdAsc(Long sucursalId);
}