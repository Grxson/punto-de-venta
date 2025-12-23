package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CategoriaGastoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaGasto;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.CategoriaGastoRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import com.puntodeventa.backend.context.SucursalContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de categorías de gastos.
 * Soporta segregación por sucursal mediante SucursalContext.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaGastoService {

    private final CategoriaGastoRepository categoriaGastoRepository;
    private final SucursalRepository sucursalRepository;

    public List<CategoriaGastoDTO> obtenerTodas() {
        Long sucursalId = SucursalContext.getSucursalId();
        return categoriaGastoRepository.findBySucursalId(sucursalId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<CategoriaGastoDTO> obtenerActivas() {
        Long sucursalId = SucursalContext.getSucursalId();
        return categoriaGastoRepository.findBySucursalIdAndActivoTrue(sucursalId).stream()
                .map(this::toDTO)
                .toList();
    }

    public CategoriaGastoDTO obtenerPorId(Long id) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + id));
        return toDTO(categoria);
    }

    @CacheEvict(value = "categorias-gastos", allEntries = true)
    @Transactional
    public CategoriaGastoDTO crear(CategoriaGastoDTO dto) {
        Long sucursalId = SucursalContext.getSucursalId();
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));

        CategoriaGasto categoria = new CategoriaGasto();
        categoria.setSucursal(sucursal);
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        categoria.setPresupuestoMensual(dto.presupuestoMensual());
        categoria.setActivo(dto.activo() != null ? dto.activo() : true);
        categoria.setCreatedAt(LocalDateTime.now());

        categoria = categoriaGastoRepository.save(categoria);
        return toDTO(categoria);
    }

    @CacheEvict(value = "categorias-gastos", allEntries = true)
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

    @CacheEvict(value = "categorias-gastos", allEntries = true)
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
                categoria.getActivo());
    }
}
