package com.puntodeventa.backend.repository;
import com.puntodeventa.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(String nombre);
    List<Rol> findByActivoTrue();
    List<Rol> findByActivoFalse();
}
