package com.puntodeventa.backend.security;

import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collection;
import java.util.Collections;

/**
 * Servicio que carga los detalles de autenticación de un usuario para Spring Security,
 * trasladando el rol de la base de datos a una autoridad {@code ROLE_*}.
 */
@Service
public class UsuarioDetallesService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Busca el usuario y construye sus detalles de autenticación.
     *
     * @param username nombre de usuario buscado
     * @return detalles del usuario con su rol como autoridad
     * @throws UsernameNotFoundException si el usuario no existe o está inactivo
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        if (!usuario.getActivo()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + username);
        }

        Collection<GrantedAuthority> authorities = Collections.singleton(
            new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre())
        );

        return User.builder()
            .username(usuario.getUsername())
            .password(usuario.getPassword())
            .authorities(authorities)
            .disabled(!usuario.getActivo())
            .build();
    }
}