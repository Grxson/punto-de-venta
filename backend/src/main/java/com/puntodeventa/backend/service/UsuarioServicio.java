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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
        log.info("Obteniendo usuarios para sucursal {} con filtro activo: {}", sucursalId, activo);
        
        try {
            List<Usuario> usuarios;
            
            // Si activo es null, obtener todos; si es un valor específico, filtrar
            if (activo == null) {
                usuarios = usuarioRepository.findBySucursalId(sucursalId);
                log.info("Obteniendo todos los usuarios de la sucursal: {} registros encontrados", usuarios.size());
            } else {
                usuarios = usuarioRepository.findBySucursalIdAndActivo(sucursalId, activo);
                log.info("Obteniendo usuarios {} de la sucursal: {} registros encontrados", 
                    activo ? "activos" : "inactivos", usuarios.size());
            }
            
            return usuarios.stream().map(this::mapearADTO).toList();
        } catch (Exception e) {
            log.error("Error al obtener usuarios de la sucursal {}: {}", sucursalId, e.getMessage(), e);
            throw new RuntimeException("Error al obtener usuarios de la sucursal: " + e.getMessage(), e);
        }
    }

    /**
     * Actualizar usuario
     */
    @Transactional
    public UsuarioDTO actualizarUsuario(Long id, EditarUsuarioRequest request) {
        log.info("Iniciando actualización de usuario ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        log.debug("Usuario encontrado: {} ({})", usuario.getUsername(), usuario.getId());

        // Validar que el email no esté duplicado (solo si cambió)
        if (!usuario.getEmail().equals(request.email())) {
            // Buscar si existe otro usuario con ese email
            Optional<Usuario> existente = usuarioRepository.findByEmail(request.email());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new IllegalArgumentException("El email ya existe: " + request.email());
            }
            log.debug("Email será actualizado de {} a {}", usuario.getEmail(), request.email());
        }

        // Validar que el username no esté duplicado (solo si cambió)
        if (!usuario.getUsername().equals(request.username())) {
            // Buscar si existe otro usuario con ese username
            Optional<Usuario> existente = usuarioRepository.findByUsername(request.username());
            if (existente.isPresent() && !existente.get().getId().equals(id)) {
                throw new IllegalArgumentException("El username ya existe: " + request.username());
            }
            log.debug("Username será actualizado de {} a {}", usuario.getUsername(), request.username());
        }

        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setEmail(request.email());
        usuario.setUsername(request.username());

        // Actualizar password solo si se proporciona y no está vacío
        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
            log.debug("Password actualizado para usuario: {}", usuario.getUsername());
        }

        // Actualizar rol
        Rol rol = rolRepository.findById(request.rolId())
            .orElseThrow(() -> new EntityNotFoundException("Rol no encontrado"));
        usuario.setRol(rol);
        log.debug("Rol actualizado a: {}", rol.getNombre());

        // Actualizar sucursal
        Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
            .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada"));
        usuario.setSucursal(sucursal);
        log.debug("Sucursal actualizada a: {}", sucursal.getNombre());

        usuario.setUpdatedAt(LocalDateTime.now());
        Usuario usuarioActualizado = usuarioRepository.save(usuario);
        
        log.info("✅ Usuario actualizado exitosamente: {} ({})", usuarioActualizado.getUsername(), usuarioActualizado.getId());

        return mapearADTO(usuarioActualizado);
    }

    /**
     * Dar de baja (desactivar) usuario
     */
    @Transactional
    public void desactivarUsuario(Long id) {
        log.info("Iniciando desactivación de usuario ID: {}", id);
        
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        log.info("Usuario encontrado: {} ({}), Estado actual: {}", usuario.getUsername(), usuario.getId(), usuario.getActivo());

        // Prevenir auto-desactivación
        if (usuario.getId().equals(id) && usuario.getActivo()) {
            usuario.setActivo(false);
            usuario.setUpdatedAt(LocalDateTime.now());
            usuarioRepository.save(usuario);
            usuarioRepository.flush(); // Forzar flush a la BD inmediatamente
            
            log.info("✅ Usuario desactivado exitosamente: {} ({})", usuario.getUsername(), usuario.getId());
        } else {
            log.warn("El usuario ya estaba desactivado o no se pudo cambiar el estado");
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
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setEmail(usuario.getEmail());
        dto.setUsername(usuario.getUsername());
        dto.setActivo(usuario.getActivo());
        
        // Mapear sucursal si existe
        if (usuario.getSucursal() != null) {
            dto.setSucursalId(usuario.getSucursal().getId());
        }
        
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