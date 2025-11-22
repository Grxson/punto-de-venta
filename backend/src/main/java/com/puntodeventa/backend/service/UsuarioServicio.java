package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CrearUsuarioRequest;
import com.puntodeventa.backend.dto.LoginRequest;
import com.puntodeventa.backend.dto.LoginResponse;
import com.puntodeventa.backend.dto.UsuarioDTO;
import com.puntodeventa.backend.model.Rol;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.RolRepository;
import com.puntodeventa.backend.repository.UsuarioRepository;
import com.puntodeventa.backend.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioServicio {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Crear un nuevo usuario
     */
    @Transactional
    public UsuarioDTO crearUsuario(CrearUsuarioRequest request) {
        // Validar que el usuario no exista
        if (usuarioRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("El username ya existe: " + request.username());
        }

        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("El email ya existe: " + request.email());
        }

        // Obtener rol y sucursal
        Rol rol = rolRepository.findById(request.rolId())
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));

        Sucursal sucursal = new Sucursal(); // Asumiendo que tienes una forma de obtenerlo
        sucursal.setId(request.sucursalId());

        // Crear usuario
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setEmail(request.email());
        usuario.setUsername(request.username());
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRol(rol);
        usuario.setSucursal(sucursal);
        usuario.setActivo(true);

        Usuario usuarioGuardado = usuarioRepository.save(usuario);
        return mapearADTO(usuarioGuardado);
    }

    /**
     * Login del usuario
     */
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

            // Actualizar último acceso
            usuario.setUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getId(), usuario.getRol().getNombre());

            UsuarioDTO usuarioDTO = mapearADTO(usuario);
            return new LoginResponse(token, usuarioDTO, "Login exitoso");

        } catch (Exception e) {
            throw new IllegalArgumentException("Username o contraseña inválidos");
        }
    }

    /**
     * Obtener usuario por ID
     */
    public UsuarioDTO obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        return mapearADTO(usuario);
    }

    /**
     * Obtener todos los usuarios por sucursal
     */
    public List<UsuarioDTO> obtenerUsuariosPorSucursal(Long sucursalId, Boolean activo) {
        List<Usuario> usuarios = usuarioRepository.findBySucursalIdAndActivo(sucursalId, activo);
        return usuarios.stream().map(this::mapearADTO).toList();
    }

    /**
     * Actualizar usuario
     */
    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, CrearUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setEmail(request.email());

        if (!request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }

        Rol rol = rolRepository.findById(request.rolId())
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        usuario.setRol(rol);

        usuario.setUpdatedAt(LocalDateTime.now());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        return mapearADTO(usuarioActualizado);
    }

    /**
     * Dar de baja (desactivar) usuario
     */
    @Transactional
    public void desactivarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        usuario.setActivo(false);
        usuario.setUpdatedAt(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }

    /**
     * Reactivar usuario
     */
    @Transactional
    public UsuarioDTO reactivarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        usuario.setActivo(true);
        usuario.setUpdatedAt(LocalDateTime.now());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        return mapearADTO(usuarioActualizado);
    }

    /**
     * Mapear Usuario a UsuarioDTO
     */
    private UsuarioDTO mapearADTO(Usuario usuario) {
        return new UsuarioDTO(
            usuario.getId(),
            usuario.getNombre(),
            usuario.getApellido(),
            usuario.getEmail(),
            usuario.getUsername(),
            usuario.getActivo(),
            usuario.getRol().getNombre(),
            usuario.getSucursal().getId(),
            usuario.getUltimoAcceso(),
            usuario.getCreatedAt(),
            usuario.getUpdatedAt()
        );
    }
}