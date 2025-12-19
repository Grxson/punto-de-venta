package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CrearUsuarioRequest;
import com.puntodeventa.backend.dto.EditarUsuarioRequest;
import com.puntodeventa.backend.dto.LoginRequest;
import com.puntodeventa.backend.dto.LoginResponse;
import com.puntodeventa.backend.dto.UsuarioDTO;
import com.puntodeventa.backend.model.Rol;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.RolRepository;
import com.puntodeventa.backend.repository.UsuarioRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import com.puntodeventa.backend.security.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
    private SucursalRepository sucursalRepository;

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

        Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
            .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));

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
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );

            Usuario usuario = usuarioRepository.findByUsername(request.username())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

            if (usuario.getSucursal() == null) {
                throw new IllegalStateException("El usuario debe tener una sucursal asignada antes de iniciar sesión");
            }

            usuario.setUltimoAcceso(LocalDateTime.now());
            usuarioRepository.save(usuario);

            Long sucursalId = usuario.getSucursal().getId();
            String token = jwtUtil.generateToken(
                usuario.getUsername(), 
                usuario.getId(), 
                usuario.getRol().getNombre(),
                sucursalId
            );

            UsuarioDTO usuarioDTO = mapearADTO(usuario);
            return new LoginResponse(token, usuarioDTO, "Login exitoso");

        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("Username o contraseña inválidos");
        } catch (IllegalStateException e) {
            throw new RuntimeException("Error en el proceso de login: " + e.getMessage(), e);
        }
    }

    /**
     * Renovar token JWT - Se llama cuando el token está a punto de expirar o ya expiró
     */
    public LoginResponse refreshToken(String expiredToken) {
        try {
            Long usuarioId = jwtUtil.extractUsuarioId(expiredToken);
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
            
            if (!usuario.getActivo()) {
                throw new IllegalStateException("El usuario está inactivo y no puede renovar su sesión");
            }
            
            if (usuario.getSucursal() == null) {
                throw new IllegalStateException("El usuario no tiene sucursal asignada");
            }
            
            Long sucursalId = usuario.getSucursal().getId();
            String nuevoToken = jwtUtil.generateToken(
                usuario.getUsername(), 
                usuario.getId(), 
                usuario.getRol().getNombre(),
                sucursalId
            );
            
            UsuarioDTO usuarioDTO = mapearADTO(usuario);
            return new LoginResponse(nuevoToken, usuarioDTO, "Token renovado exitosamente");
            
        } catch (EntityNotFoundException e) {
            throw e;
        } catch (IllegalStateException e) {
            throw new RuntimeException("Error al renovar token: " + e.getMessage(), e);
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
        try {
            List<Usuario> usuarios = activo == null
                ? usuarioRepository.findBySucursalId(sucursalId)
                : usuarioRepository.findBySucursalIdAndActivo(sucursalId, activo);
            return usuarios.stream().map(this::mapearADTO).toList();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener usuarios de la sucursal: " + e.getMessage(), e);
        }
    }

    /**
     * Actualizar usuario
     */
    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, EditarUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (!usuario.getEmail().equals(request.email())) {
            usuarioRepository.findByEmail(request.email())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> { throw new IllegalArgumentException("El email ya existe"); });
        }

        if (!usuario.getUsername().equals(request.username())) {
            usuarioRepository.findByUsername(request.username())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> { throw new IllegalArgumentException("El username ya existe"); });
        }

        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setEmail(request.email());
        usuario.setUsername(request.username());

        String password = request.password();
        if (password != null && !password.isBlank()) {
            usuario.setPassword(passwordEncoder.encode(password));
        }

        usuario.setRol(rolRepository.findById(request.rolId())
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado")));
        usuario.setSucursal(sucursalRepository.findById(request.sucursalId())
            .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada")));

        usuario.setUpdatedAt(LocalDateTime.now());
        return mapearADTO(usuarioRepository.save(usuario));
    }

    /**
     * Dar de baja (desactivar) usuario
     */
    @Transactional
    public void desactivarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        if (usuario.getActivo()) {
            usuario.setActivo(false);
            usuario.setUpdatedAt(LocalDateTime.now());
            usuarioRepository.save(usuario);
            usuarioRepository.flush();
        }
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
        UsuarioDTO.RolDTO rolDTO = null;
        if (usuario.getRol() != null) {
            rolDTO = UsuarioDTO.RolDTO.builder()
                .id(usuario.getRol().getId())
                .nombre(usuario.getRol().getNombre())
                .descripcion(usuario.getRol().getDescripcion())
                .activo(usuario.getRol().getActivo())
                .build();
        }

        return UsuarioDTO.builder()
            .id(usuario.getId())
            .nombre(usuario.getNombre())
            .apellido(usuario.getApellido())
            .email(usuario.getEmail())
            .username(usuario.getUsername())
            .activo(usuario.getActivo())
            .rol(rolDTO)
            .rolNombre(usuario.getRol() != null ? usuario.getRol().getNombre() : null)
            .sucursalId(usuario.getSucursal() != null ? usuario.getSucursal().getId() : null)
            .ultimoAcceso(usuario.getUltimoAcceso())
            .createdAt(usuario.getCreatedAt())
            .updatedAt(usuario.getUpdatedAt())
            .build();
    }
}