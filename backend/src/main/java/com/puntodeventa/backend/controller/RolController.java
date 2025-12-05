package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.RolDTO;
import com.puntodeventa.backend.model.Rol;
import com.puntodeventa.backend.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller para gestión de roles
 */
@Slf4j
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RolController {

    private final RolRepository rolRepository;

    /**
     * Obtener todos los roles activos
     */
    @GetMapping
    public ResponseEntity<List<RolDTO>> obtenerTodos() {
        log.info("Obteniendo todos los roles activos");
        List<Rol> roles = rolRepository.findByActivoTrue();
        List<RolDTO> rolesDTO = roles.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(rolesDTO);
    }

    /**
     * Obtener todos los roles (incluyendo inactivos)
     */
    @GetMapping(params = "incluirInactivos=true")
    public ResponseEntity<List<RolDTO>> obtenerTodosConInactivos() {
        log.info("Obteniendo todos los roles (incluyendo inactivos)");
        List<Rol> roles = rolRepository.findAll();
        List<RolDTO> rolesDTO = roles.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(rolesDTO);
    }

    /**
     * Obtener rol por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RolDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo rol con ID: {}", id);
        return rolRepository.findById(id)
            .map(rol -> ResponseEntity.ok(convertToDTO(rol)))
            .orElseGet(() -> {
                log.warn("Rol no encontrado con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Crear nuevo rol
     */
    @PostMapping
    public ResponseEntity<RolDTO> crear(@RequestBody RolDTO rolDTO) {
        log.info("Creando nuevo rol: {}", rolDTO.getNombre());
        
        Rol rol = new Rol();
        rol.setNombre(rolDTO.getNombre());
        rol.setDescripcion(rolDTO.getDescripcion());
        rol.setActivo(true);
        
        Rol rolGuardado = rolRepository.save(rol);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertToDTO(rolGuardado));
    }

    /**
     * Actualizar rol
     */
    @PutMapping("/{id}")
    public ResponseEntity<RolDTO> actualizar(
        @PathVariable Long id,
        @RequestBody RolDTO rolDTO) {
        log.info("Actualizando rol con ID: {}", id);
        
        return rolRepository.findById(id)
            .map(rol -> {
                rol.setNombre(rolDTO.getNombre());
                rol.setDescripcion(rolDTO.getDescripcion());
                Rol rolActualizado = rolRepository.save(rol);
                return ResponseEntity.ok(convertToDTO(rolActualizado));
            })
            .orElseGet(() -> {
                log.warn("Rol no encontrado con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Desactivar rol
     */
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<RolDTO> desactivar(@PathVariable Long id) {
        log.info("Desactivando rol con ID: {}", id);
        
        return rolRepository.findById(id)
            .map(rol -> {
                rol.setActivo(false);
                Rol rolActualizado = rolRepository.save(rol);
                return ResponseEntity.ok(convertToDTO(rolActualizado));
            })
            .orElseGet(() -> {
                log.warn("Rol no encontrado con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Reactivar rol
     */
    @PutMapping("/{id}/reactivar")
    public ResponseEntity<RolDTO> reactivar(@PathVariable Long id) {
        log.info("Reactivando rol con ID: {}", id);
        
        return rolRepository.findById(id)
            .map(rol -> {
                rol.setActivo(true);
                Rol rolActualizado = rolRepository.save(rol);
                return ResponseEntity.ok(convertToDTO(rolActualizado));
            })
            .orElseGet(() -> {
                log.warn("Rol no encontrado con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Convertir Rol a RolDTO
     */
    private RolDTO convertToDTO(Rol rol) {
        return RolDTO.builder()
            .id(rol.getId())
            .nombre(rol.getNombre())
            .descripcion(rol.getDescripcion())
            .activo(rol.getActivo())
            .build();
    }
}
