package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.CrearUsuarioRequest;
import com.puntodeventa.backend.dto.LoginRequest;
import com.puntodeventa.backend.dto.LoginResponse;
import com.puntodeventa.backend.dto.UsuarioDTO;
import com.puntodeventa.backend.service.UsuarioServicio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para autenticación y gestión de usuarios")
@CrossOrigin(origins = "*", maxAge = 3600)

public class AutenticacionController {
    @Autowired
    private UsuarioServicio usuarioServicio;

    @PostMapping("/login")
    @Operation(summary = "Login de usuario", description = "Autentica un usuario y retorna un token JWT")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = usuarioServicio.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea un nuevo usuario en el sistema")
    public ResponseEntity<UsuarioDTO> registrar(@Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDTO usuario = usuarioServicio.crearUsuario(request);
        return ResponseEntity.status(201).body(usuario);
    }

    @GetMapping("/usuarios/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Retorna los datos de un usuario específico")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioServicio.obtenerUsuario(id);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/usuarios/sucursal/{sucursalId}")
    @Operation(summary = "Obtener usuarios por sucursal", description = "Retorna todos los usuarios activos de una sucursal")
    public ResponseEntity<?> obtenerUsuariosPorSucursal(
            @PathVariable Long sucursalId,
            @RequestParam(required = false, defaultValue = "true") Boolean activo) {
        var usuarios = usuarioServicio.obtenerUsuariosPorSucursal(sucursalId, activo);
        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/usuarios/{id}")
    @Operation(summary = "Actualizar usuario", description = "Actualiza los datos de un usuario")
    public ResponseEntity<UsuarioDTO> actualizarUsuario(
            @PathVariable Long id,
            @Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioDTO usuario = usuarioServicio.actualizarUsuario(id, request);
        return ResponseEntity.ok(usuario);
    }

    @DeleteMapping("/usuarios/{id}")
    @Operation(summary = "Dar de baja usuario", description = "Desactiva un usuario del sistema")
    public ResponseEntity<?> desactivarUsuario(@PathVariable Long id) {
        usuarioServicio.desactivarUsuario(id);
        return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
            put("mensaje", "Usuario desactivado correctamente");
        }});
    }

    @PostMapping("/usuarios/{id}/reactivar")
    @Operation(summary = "Reactivar usuario", description = "Reactiva un usuario desactivado")
    public ResponseEntity<UsuarioDTO> reactivarUsuario(@PathVariable Long id) {
        UsuarioDTO usuario = usuarioServicio.reactivarUsuario(id);
        return ResponseEntity.ok(usuario);
    }
}
