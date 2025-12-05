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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
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
            log.info("Intentando login para usuario: {}", request.username());
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
            
            log.info("Autenticación exitosa para: {}", request.username());

            Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

            log.info("Usuario encontrado: {} - Activo: {} - Rol: {}", 
                usuario.getUsername(), usuario.getActivo(), usuario.getRol().getNombre());

            // Actualizar último acceso
            usuario.setUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getId(), usuario.getRol().getNombre());

            UsuarioDTO usuarioDTO = mapearADTO(usuario);
            return new LoginResponse(token, usuarioDTO, "Login exitoso");

        } catch (AuthenticationException e) {
            log.error("Error de autenticación para usuario: {} - {}", request.username(), e.getMessage());
            throw new IllegalArgumentException("Username o contraseña inválidos");
        } catch (Exception e) {
            log.error("Error inesperado durante login para usuario: {} - {}", request.username(), e.getMessage(), e);
            throw new RuntimeException("Error en el proceso de login: " + e.getMessage(), e);
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
     * Cambiar rol de un usuario
     */
    @Transactional
    public UsuarioDTO cambiarRol(Long id, Long rolId) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        Rol rol = rolRepository.findById(rolId)
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));

        usuario.setRol(rol);
        usuario.setUpdatedAt(LocalDateTime.now());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);

        return mapearADTO(usuarioActualizado);
    }

    /**
     * Mapear Usuario a UsuarioDTO
     */
    private UsuarioDTO mapearADTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setUsername(usuario.getUsername());
        dto.setActivo(usuario.getActivo());
        dto.setSucursalId(usuario.getSucursal().getId());
        dto.setUltimoAcceso(usuario.getUltimoAcceso());
        dto.setCreatedAt(usuario.getCreatedAt());
        dto.setUpdatedAt(usuario.getUpdatedAt());
        
        // Mapear rol si existe
        if (usuario.getRol() != null) {
            UsuarioDTO.RolDTO rolDTO = UsuarioDTO.RolDTO.builder()
                .id(usuario.getRol().getId())
                .nombre(usuario.getRol().getNombre())
                .descripcion(usuario.getRol().getDescripcion())
                .activo(usuario.getRol().getActivo())
                .build();
            dto.setRol(rolDTO);
            dto.setRolNombre(usuario.getRol().getNombre());
        }
        
        return dto;
    }
}