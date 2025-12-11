package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoTamanoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoTamano;
import com.puntodeventa.backend.repository.ProductoTamanoRepository;
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
public class ProductoTamanoService {

    private final ProductoTamanoRepository tamanoRepository;

    /**
     * Obtiene todos los tamaños activos
     */
    @Transactional(readOnly = true)
    public List<ProductoTamanoDTO> obtenerTodosActivos() {
        return tamanoRepository.findAllActivos()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un tamaño por ID
     */
    @Transactional(readOnly = true)
    public ProductoTamanoDTO obtenerPorId(Long id) {
        return tamanoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));
    }

    /**
     * Obtiene un tamaño por nombre
     */
    @Transactional(readOnly = true)
    public ProductoTamanoDTO obtenerPorNombre(String nombre) {
        return tamanoRepository.findByNombreIgnoreCase(nombre)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + nombre));
    }

    /**
     * Busca tamaños por nombre
     */
    @Transactional(readOnly = true)
    public List<ProductoTamanoDTO> buscar(String nombre) {
        return tamanoRepository.buscarPorNombre(nombre)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea un nuevo tamaño
     */
    public ProductoTamanoDTO crear(ProductoTamanoDTO dto) {
        // Verificar que no existe un tamaño con el mismo nombre
        if (tamanoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
        }

        ProductoTamano tamano = ProductoTamano.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .precioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO)
                .orden(dto.orden() != null ? dto.orden() : 0)
                .activo(true)
                .createdAt(LocalDateTime.now())
                .build();

        ProductoTamano saved = tamanoRepository.save(tamano);
        return toDTO(saved);
    }

    /**
     * Actualiza un tamaño existente
     */
    public ProductoTamanoDTO actualizar(Long id, ProductoTamanoDTO dto) {
        ProductoTamano tamano = tamanoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));

        // Verificar que no existe otro tamaño con el mismo nombre
        if (!tamano.getNombre().equalsIgnoreCase(dto.nombre())) {
            if (tamanoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
                throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
            }
        }

        tamano.setNombre(dto.nombre());
        tamano.setDescripcion(dto.descripcion());
        tamano.setPrecioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO);
        tamano.setOrden(dto.orden() != null ? dto.orden() : 0);
        tamano.setActivo(dto.activo() != null ? dto.activo() : true);
        tamano.setUpdatedAt(LocalDateTime.now());

        ProductoTamano updated = tamanoRepository.save(tamano);
        return toDTO(updated);
    }

    /**
     * Desactiva un tamaño (soft delete)
     */
    public void desactivar(Long id) {
        ProductoTamano tamano = tamanoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));

        tamano.setActivo(false);
        tamano.setUpdatedAt(LocalDateTime.now());
        tamanoRepository.save(tamano);
    }

    /**
     * Elimina un tamaño (borrado físico)
     */
    public void eliminar(Long id) {
        if (!tamanoRepository.existsById(id)) {
            throw new EntityNotFoundException("Tamano no encontrado: " + id);
        }
        tamanoRepository.deleteById(id);
    }

    /**
     * Convierte una entidad a DTO
     */
    private ProductoTamanoDTO toDTO(ProductoTamano tamano) {
        return new ProductoTamanoDTO(
                tamano.getId(),
                tamano.getNombre(),
                tamano.getDescripcion(),
                tamano.getPrecioExtra(),
                tamano.getOrden(),
                tamano.getActivo());
    }
}
