package com.puntodeventa.backend.repository;
import com.puntodeventa.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findBySucursalIdAndActivo(Long sucursalId, Boolean activo);
    List<Usuario> findByRolId(Long rolId);
}