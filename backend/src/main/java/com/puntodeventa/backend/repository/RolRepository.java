package com.puntodeventa.backend.repository;
import com.puntodeventa.backend.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio de roles: expone los roles del sistema y su estado de activación.
 */
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    /**
     * Busca un rol por su nombre único.
     *
     * @param nombre nombre del rol (ej: ADMIN, CAJERO, GERENTE)
     * @return el rol coincidente, o vacío si no existe
     */
    Optional<Rol> findByNombre(String nombre);

    /**
     * Recupera los roles activos.
     *
     * @return lista de roles con activo = true
     */
    @Query("SELECT r FROM Rol r WHERE r.activo = true")
    List<Rol> findByActivoTrue();

    /**
     * Recupera los roles inactivos.
     * Existe para consultar los roles retirados sin borrar su histórico.
     *
     * @return lista de roles con activo = false
     */
    @Query("SELECT r FROM Rol r WHERE r.activo = false")
    List<Rol> findByActivoFalse();
}
