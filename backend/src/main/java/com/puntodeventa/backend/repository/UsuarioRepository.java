package com.puntodeventa.backend.repository;
import com.puntodeventa.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

/**
 * Repositorio de usuarios: expone la búsqueda por identidad y la segregación por sucursal y rol.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Busca un usuario por su credencial de acceso.
     *
     * @param username nombre de usuario
     * @return el usuario coincidente, o vacío si no existe
     */
    Optional<Usuario> findByUsername(String username);

    /**
     * Busca un usuario por su correo institucional.
     *
     * @param email correo del usuario
     * @return el usuario coincidente, o vacío si no existe
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Recupera los usuarios asignados a una sucursal.
     *
     * @param sucursalId ID de la sucursal
     * @return lista de usuarios de la sucursal
     */
    List<Usuario> findBySucursalId(Long sucursalId);

    /**
     * Recupera los usuarios de una sucursal filtrados por su estado de activación.
     *
     * @param sucursalId ID de la sucursal
     * @param activo     estado deseado (true activos, false inactivos)
     * @return lista de usuarios coincidentes
     */
    List<Usuario> findBySucursalIdAndActivo(Long sucursalId, Boolean activo);

    /**
     * Recupera los usuarios que tienen un rol concreto.
     *
     * @param rolId ID del rol
     * @return lista de usuarios con ese rol
     */
    List<Usuario> findByRolId(Long rolId);
}