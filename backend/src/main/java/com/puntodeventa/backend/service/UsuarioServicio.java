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

/**
 * Servicio de gestión de cuentas de usuario y sesión.
 * Valida unicidad de credenciales, cifra contraseñas con el {@code PasswordEncoder}
 * y emite los tokens JWT que transportan la identidad, el rol y la sucursal del
 * usuario en cada petición.
 */
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
     * Crea un nuevo usuario.
     * El usuario nace activo y affiliated a la sucursal indicada en la petición.
     *
     * @param request Datos de alta, incluida la contraseña en texto plano.
     * @return DTO del usuario creado, sin datos sensibles.
     * @throws IllegalArgumentException si el username o el email ya están en uso.
     * @throws EntityNotFoundException si el rol o la sucursal no existen.
     */
    @Transactional
    public UsuarioDTO crearUsuario(CrearUsuarioRequest request) {
        // El username y el email son claves de acceso: se validan antes de tocar
        // cualquier campo para no cifrar una contraseña que después se rechaza.
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
     * Autentica al usuario y emite su token JWT.
     * La sucursal del token se toma de la ficha del usuario, nunca de la petición,
     * porque delimita el alcance de datos de cada sesión.
     *
     * @param request Credenciales del usuario.
     * @return Respuesta con el token, el perfil del usuario y un mensaje de resultado.
     * @throws AuthenticationException si las credenciales son inválidas.
     * @throws EntityNotFoundException si el usuario autenticado no existe en la base de datos.
     * @throws IllegalStateException si el usuario no tiene sucursal asignada.
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
            // Auditoría 2026-09-11 (T1.1): propagar AuthenticationException real para
            // que el handler global responda 401 (antes se convertía en 400 por
            // IllegalArgumentException).
            throw e;
        } catch (IllegalStateException e) {
            throw new RuntimeException("Error en el proceso de login: " + e.getMessage(), e);
        }
    }

    /**
     * Renueva el token JWT de un usuario.
     * Se invoca cuando el token está por expirar o ya expiró. No se revalida la
     * contraseña porque el token ya demostró autenticidad; sí se comprueba que la
     * cuenta siga activa y con sucursal asignada.
     *
     * @param expiredToken Token previo, incluso ya vencido.
     * @return Respuesta con el token nuevo, el perfil del usuario y un mensaje de resultado.
     * @throws EntityNotFoundException si el usuario del token no existe.
     * @throws IllegalStateException si el usuario está inactivo o no tiene sucursal asignada.
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
     * Obtiene un usuario por su identificador.
     *
     * @param id Identificador del usuario.
     * @return DTO del usuario encontrado.
     * @throws EntityNotFoundException si el usuario no existe.
     */
    public UsuarioDTO obtenerUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        return mapearADTO(usuario);
    }

    /**
     * Obtiene los usuarios de una sucursal, opcionalmente filtrando por estado.
     *
     * @param sucursalId Identificador de la sucursal.
     * @param activo     {@code true} solo activos, {@code false} solo inactivos,
     *                   {@code null} para no filtrar.
     * @return Lista de DTO de los usuarios de la sucursal.
     * @throws RuntimeException si la consulta a la base de datos falla.
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
     * Actualiza los datos de un usuario.
     * Una contraseña vacía o nula se interpreta como "sin cambio", para que el
     * formulario de edición no esté obligado a reenviarla.
     *
     * @param id      Identificador del usuario a actualizar.
     * @param request Datos a actualizar, incluida la contraseña opcional.
     * @return DTO del usuario ya persistido.
     * @throws EntityNotFoundException si el usuario, el rol o la sucursal no existen.
     * @throws IllegalArgumentException si el email o el username pertenecen a otro usuario.
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
     * Da de baja un usuario sin borrar su historial.
     * Se conserva la fila porque las ventas y los movimientos de inventario ya
     * la referencian; la baja es lógica y reversible con {@link #reactivarUsuario}.
     *
     * @param id Identificador del usuario.
     * @throws EntityNotFoundException si el usuario no existe.
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
     * Reactiva un usuario dado de baja previamente.
     *
     * @param id Identificador del usuario.
     * @return DTO del usuario reactivado.
     * @throws EntityNotFoundException si el usuario no existe.
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
     * Cambia el rol de un usuario.
     * El rol se sustituye por completo y no se fusiona con el anterior: el
     * permiso efectivo siempre es el del último rol asignado.
     *
     * @param id    Identificador del usuario.
     * @param rolId Identificador del nuevo rol.
     * @return DTO del usuario con el rol actualizado.
     * @throws EntityNotFoundException si el usuario o el rol no existen.
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
     * Proyecta la entidad de usuario a su DTO.
     * La contraseña nunca se proyecta: sale del modelo de salida por diseño.
     *
     * @param usuario Entidad a proyectar.
     * @return DTO con los datos del usuario y su rol anidado, si lo tiene.
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