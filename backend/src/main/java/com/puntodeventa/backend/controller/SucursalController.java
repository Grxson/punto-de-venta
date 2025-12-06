package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.CambioSucursalDTO;
import com.puntodeventa.backend.dto.ProductoSucursalDTO;
import com.puntodeventa.backend.dto.SucursalDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.model.Usuario;
import com.puntodeventa.backend.repository.SucursalRepository;
import com.puntodeventa.backend.repository.UsuarioRepository;
import com.puntodeventa.backend.service.SucursalProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final SucursalProductoService sucursalProductoService;
    private final UsuarioRepository usuarioRepository;

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

    // =====================================================================
    // ENDPOINTS DE PRODUCTOS POR SUCURSAL (Multi-sucursal)
    // =====================================================================

    @GetMapping("/actual")
    @Operation(summary = "Obtener información de la sucursal actual")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerSucursalActual() {
        try {
            Long sucursalId = SucursalContext.getSucursalId();
            String nombre = SucursalContext.getSucursalNombre().orElse("Desconocida");
            return ResponseEntity.ok(new CambioSucursalDTO(
                sucursalId,
                nombre,
                "Sin información",
                "",
                "",
                java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("No hay sucursal seleccionada");
        }
    }

    @GetMapping("/{sucursalId}/productos")
    @Operation(summary = "Obtener productos disponibles de una sucursal específica")
    @Parameter(name = "sucursalId", description = "ID de la sucursal", required = true)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProductoSucursalDTO>> obtenerProductosSucursal(@PathVariable Long sucursalId) {
        List<ProductoSucursalDTO> productos = sucursalProductoService.obtenerProductosDisponibles(sucursalId);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{sucursalId}/productos/todos")
    @Operation(summary = "Obtener todos los productos de una sucursal (incluyendo no disponibles - solo admin)")
    @Parameter(name = "sucursalId", description = "ID de la sucursal", required = true)
    public ResponseEntity<List<ProductoSucursalDTO>> obtenerTodosProductosSucursal(@PathVariable Long sucursalId) {
        List<ProductoSucursalDTO> productos = sucursalProductoService.obtenerTodosProductosSucursal(sucursalId);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{sucursalId}/producto/{productoId}")
    @Operation(summary = "Obtener detalle de un producto en una sucursal específica")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProductoSucursalDTO> obtenerProductoEnSucursal(
            @PathVariable Long sucursalId,
            @PathVariable Long productoId
    ) {
        ProductoSucursalDTO producto = sucursalProductoService.obtenerProductoEnSucursal(sucursalId, productoId);
        return ResponseEntity.ok(producto);
    }

    @PostMapping("/cambiar/{sucursalId}")
    @Operation(summary = "Cambiar a una sucursal diferente (solo admin)")
    @Parameter(name = "sucursalId", description = "ID de la sucursal a cambiar", required = true)
    public ResponseEntity<?> cambiarSucursal(@PathVariable Long sucursalId) {
        try {
            // Verificar que el usuario es admin
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Usuario usuario = usuarioRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

            if (!usuario.getRol().getNombre().equalsIgnoreCase("ADMIN")) {
                return ResponseEntity.status(403).body("Solo administradores pueden cambiar de sucursal");
            }

            // El contexto se actualiza automáticamente en el siguiente request
            // si se envía el header X-Sucursal-Id
            return ResponseEntity.ok(new CambioSucursalDTO(
                sucursalId,
                "Sucursal-" + sucursalId,
                "Contexto cambiado. Usa header: X-Sucursal-Id: " + sucursalId,
                "",
                "",
                java.time.LocalDateTime.now()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/productos/todos-sucursales")
    @Operation(summary = "Obtener todos los productos de todas las sucursales (solo admin)")
    public ResponseEntity<List<ProductoSucursalDTO>> obtenerTodosProductosTodosSucursales() {
        List<ProductoSucursalDTO> productos = sucursalProductoService.obtenerTodosProductosTodosSucursales();
        return ResponseEntity.ok(productos);
    }
}
