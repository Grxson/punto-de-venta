package com.puntodeventa.backend.repository;
import com.puntodeventa.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombre(String nombre);
    @Query("SELECT r FROM Rol r WHERE r.activo = true")
    List<Rol> findByActivoTrue();
    @Query("SELECT r FROM Rol r WHERE r.activo = false")
    List<Rol> findByActivoFalse();
}
