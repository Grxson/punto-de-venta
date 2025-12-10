package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoTamañoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoTamaño;
import com.puntodeventa.backend.repository.ProductoTamañoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar tamaños de productos.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoTamañoService {
    
    private final ProductoTamañoRepository tamañoRepository;
    
    /**
     * Obtiene todos los tamaños activos
     */
    @Transactional(readOnly = true)
    public List<ProductoTamañoDTO> obtenerTodosActivos() {
        return tamañoRepository.findAllActivos()
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene un tamaño por ID
     */
    @Transactional(readOnly = true)
    public ProductoTamañoDTO obtenerPorId(Long id) {
        return tamañoRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Tamaño no encontrado: " + id));
    }
    
    /**
     * Obtiene un tamaño por nombre
     */
    @Transactional(readOnly = true)
    public ProductoTamañoDTO obtenerPorNombre(String nombre) {
        return tamañoRepository.findByNombreIgnoreCase(nombre)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Tamaño no encontrado: " + nombre));
    }
    
    /**
     * Busca tamaños por nombre
     */
    @Transactional(readOnly = true)
    public List<ProductoTamañoDTO> buscar(String nombre) {
        return tamañoRepository.buscarPorNombre(nombre)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Crea un nuevo tamaño
     */
    public ProductoTamañoDTO crear(ProductoTamañoDTO dto) {
        // Verificar que no existe un tamaño con el mismo nombre
        if (tamañoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
        }
        
        ProductoTamaño tamaño = ProductoTamaño.builder()
            .nombre(dto.nombre())
            .descripcion(dto.descripcion())
            .precioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO)
            .orden(dto.orden() != null ? dto.orden() : 0)
            .activo(true)
            .createdAt(LocalDateTime.now())
            .build();
        
        ProductoTamaño saved = tamañoRepository.save(tamaño);
        return toDTO(saved);
    }
    
    /**
     * Actualiza un tamaño existente
     */
    public ProductoTamañoDTO actualizar(Long id, ProductoTamañoDTO dto) {
        ProductoTamaño tamaño = tamañoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Tamaño no encontrado: " + id));
        
        // Verificar que no existe otro tamaño con el mismo nombre
        if (!tamaño.getNombre().equalsIgnoreCase(dto.nombre())) {
            if (tamañoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
                throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
            }
        }
        
        tamaño.setNombre(dto.nombre());
        tamaño.setDescripcion(dto.descripcion());
        tamaño.setPrecioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO);
        tamaño.setOrden(dto.orden() != null ? dto.orden() : 0);
        tamaño.setActivo(dto.activo() != null ? dto.activo() : true);
        tamaño.setUpdatedAt(LocalDateTime.now());
        
        ProductoTamaño updated = tamañoRepository.save(tamaño);
        return toDTO(updated);
    }
    
    /**
     * Desactiva un tamaño (soft delete)
     */
    public void desactivar(Long id) {
        ProductoTamaño tamaño = tamañoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Tamaño no encontrado: " + id));
        
        tamaño.setActivo(false);
        tamaño.setUpdatedAt(LocalDateTime.now());
        tamañoRepository.save(tamaño);
    }
    
    /**
     * Elimina un tamaño (borrado físico)
     */
    public void eliminar(Long id) {
        if (!tamañoRepository.existsById(id)) {
            throw new EntityNotFoundException("Tamaño no encontrado: " + id);
        }
        tamañoRepository.deleteById(id);
    }
    
    /**
     * Convierte una entidad a DTO
     */
    private ProductoTamañoDTO toDTO(ProductoTamaño tamaño) {
        return new ProductoTamañoDTO(
            tamaño.getId(),
            tamaño.getNombre(),
            tamaño.getDescripcion(),
            tamaño.getPrecioExtra(),
            tamaño.getOrden(),
            tamaño.getActivo()
        );
    }
}
