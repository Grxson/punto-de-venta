package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CategoriaGastoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaGasto;
import com.puntodeventa.backend.repository.CategoriaGastoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de categorías de gastos.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaGastoService {
    
    private final CategoriaGastoRepository categoriaGastoRepository;
    
    public List<CategoriaGastoDTO> obtenerTodas() {
        return categoriaGastoRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<CategoriaGastoDTO> obtenerActivas() {
        return categoriaGastoRepository.findByActivoTrue().stream()
            .map(this::toDTO)
            .toList();
    }
    
    public CategoriaGastoDTO obtenerPorId(Long id) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + id));
        return toDTO(categoria);
    }
    
    @Transactional
    public CategoriaGastoDTO crear(CategoriaGastoDTO dto) {
        CategoriaGasto categoria = new CategoriaGasto();
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        categoria.setPresupuestoMensual(dto.presupuestoMensual());
        categoria.setActivo(dto.activo() != null ? dto.activo() : true);
        categoria.setCreatedAt(LocalDateTime.now());
        
        categoria = categoriaGastoRepository.save(categoria);
        return toDTO(categoria);
    }
    
    @Transactional
    public CategoriaGastoDTO actualizar(Long id, CategoriaGastoDTO dto) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + id));
        
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        categoria.setPresupuestoMensual(dto.presupuestoMensual());
        categoria.setActivo(dto.activo() != null ? dto.activo() : true);
        categoria.setUpdatedAt(LocalDateTime.now());
        
        categoria = categoriaGastoRepository.save(categoria);
        return toDTO(categoria);
    }
    
    @Transactional
    public void eliminar(Long id) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + id));
        categoria.setActivo(false);
        categoria.setUpdatedAt(LocalDateTime.now());
        categoriaGastoRepository.save(categoria);
    }
    
    private CategoriaGastoDTO toDTO(CategoriaGasto categoria) {
        return new CategoriaGastoDTO(
            categoria.getId(),
            categoria.getNombre(),
            categoria.getDescripcion(),
            categoria.getPresupuestoMensual(),
            categoria.getActivo()
        );
    }
}

