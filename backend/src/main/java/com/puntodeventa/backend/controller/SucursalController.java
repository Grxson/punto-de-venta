package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.SucursalDTO;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller para gestión de sucursales
 */
@Slf4j
@RestController
@RequestMapping("/api/sucursales")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SucursalController {

    private final SucursalRepository sucursalRepository;

    /**
     * Obtener todas las sucursales activas
     */
    @GetMapping
    public ResponseEntity<List<SucursalDTO>> obtenerTodas(
        @RequestParam(required = false) Boolean activo) {
        log.info("Obteniendo sucursales con activo: {}", activo);
        
        List<Sucursal> sucursales;
        if (activo != null && activo) {
            sucursales = sucursalRepository.findByActivoTrue();
        } else if (activo != null && !activo) {
            sucursales = sucursalRepository.findByActivoFalse();
        } else {
            sucursales = sucursalRepository.findAll();
        }
        
        List<SucursalDTO> sucursalesDTO = sucursales.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(sucursalesDTO);
    }

    /**
     * Obtener sucursal por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<SucursalDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo sucursal con ID: {}", id);
        return sucursalRepository.findById(id)
            .map(sucursal -> ResponseEntity.ok(convertToDTO(sucursal)))
            .orElseGet(() -> {
                log.warn("Sucursal no encontrada con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Crear nueva sucursal
     */
    @PostMapping
    public ResponseEntity<SucursalDTO> crear(@RequestBody SucursalDTO sucursalDTO) {
        log.info("Creando nueva sucursal: {}", sucursalDTO.getNombre());
        
        Sucursal sucursal = new Sucursal();
        sucursal.setNombre(sucursalDTO.getNombre());
        sucursal.setDireccion(sucursalDTO.getDireccion());
        sucursal.setTelefono(sucursalDTO.getTelefono());
        sucursal.setActivo(true);
        
        Sucursal sucursalGuardada = sucursalRepository.save(sucursal);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(convertToDTO(sucursalGuardada));
    }

    /**
     * Actualizar sucursal
     */
    @PutMapping("/{id}")
    public ResponseEntity<SucursalDTO> actualizar(
        @PathVariable Long id,
        @RequestBody SucursalDTO sucursalDTO) {
        log.info("Actualizando sucursal con ID: {}", id);
        
        return sucursalRepository.findById(id)
            .map(sucursal -> {
                sucursal.setNombre(sucursalDTO.getNombre());
                sucursal.setDireccion(sucursalDTO.getDireccion());
                sucursal.setTelefono(sucursalDTO.getTelefono());
                Sucursal sucursalActualizada = sucursalRepository.save(sucursal);
                return ResponseEntity.ok(convertToDTO(sucursalActualizada));
            })
            .orElseGet(() -> {
                log.warn("Sucursal no encontrada con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Desactivar sucursal
     */
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<SucursalDTO> desactivar(@PathVariable Long id) {
        log.info("Desactivando sucursal con ID: {}", id);
        
        return sucursalRepository.findById(id)
            .map(sucursal -> {
                sucursal.setActivo(false);
                Sucursal sucursalActualizada = sucursalRepository.save(sucursal);
                return ResponseEntity.ok(convertToDTO(sucursalActualizada));
            })
            .orElseGet(() -> {
                log.warn("Sucursal no encontrada con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Reactivar sucursal
     */
    @PutMapping("/{id}/reactivar")
    public ResponseEntity<SucursalDTO> reactivar(@PathVariable Long id) {
        log.info("Reactivando sucursal con ID: {}", id);
        
        return sucursalRepository.findById(id)
            .map(sucursal -> {
                sucursal.setActivo(true);
                Sucursal sucursalActualizada = sucursalRepository.save(sucursal);
                return ResponseEntity.ok(convertToDTO(sucursalActualizada));
            })
            .orElseGet(() -> {
                log.warn("Sucursal no encontrada con ID: {}", id);
                return ResponseEntity.notFound().build();
            });
    }

    /**
     * Convertir Sucursal a SucursalDTO
     */
    private SucursalDTO convertToDTO(Sucursal sucursal) {
        return SucursalDTO.builder()
            .id(sucursal.getId())
            .nombre(sucursal.getNombre())
            .direccion(sucursal.getDireccion())
            .telefono(sucursal.getTelefono())
            .activo(sucursal.getActivo())
            .build();
    }
}
