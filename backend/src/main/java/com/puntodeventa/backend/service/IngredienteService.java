package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.IngredienteDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.Ingrediente;
import com.puntodeventa.backend.model.Proveedor;
import com.puntodeventa.backend.model.Unidad;
import com.puntodeventa.backend.repository.IngredienteRepository;
import com.puntodeventa.backend.repository.ProveedorRepository;
import com.puntodeventa.backend.repository.UnidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de ingredientes del inventario.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class IngredienteService {

    private final IngredienteRepository ingredienteRepository;
    private final UnidadRepository unidadRepository;
    private final ProveedorRepository proveedorRepository;
    private final InventarioMapper mapper;

    @Cacheable(value = "ingredientes", unless = "#result.isEmpty()")
    public List<IngredienteDTO> obtenerTodos() {
        return ingredienteRepository.findAll().stream()
                .map(mapper::toIngredienteDTO)
                .toList();
    }

    @Cacheable(value = "ingredientes", key = "'activos'")
    public List<IngredienteDTO> obtenerActivos() {
        return ingredienteRepository.findByActivoTrue().stream()
                .map(mapper::toIngredienteDTO)
                .toList();
    }

    @Cacheable(value = "ingredientes", key = "#id")
    public IngredienteDTO obtenerPorId(Long id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado con id: " + id));
        return mapper.toIngredienteDTO(ingrediente);
    }

    public List<IngredienteDTO> obtenerPorCategoria(String categoria) {
        return ingredienteRepository.findByCategoria(categoria).stream()
                .map(mapper::toIngredienteDTO)
                .toList();
    }

    public List<String> obtenerCategorias() {
        return ingredienteRepository.findAllCategorias();
    }

    public List<IngredienteDTO> buscarPorNombre(String nombre) {
        return ingredienteRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(mapper::toIngredienteDTO)
                .toList();
    }

    @CacheEvict(value = "ingredientes", allEntries = true)
    @Transactional
    public IngredienteDTO crear(IngredienteDTO dto) {
        Unidad unidadBase = unidadRepository.findById(dto.unidadBaseId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Unidad base no encontrada con id: " + dto.unidadBaseId()));

        Proveedor proveedor = null;
        if (dto.proveedorId() != null) {
            proveedor = proveedorRepository.findById(dto.proveedorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Proveedor no encontrado con id: " + dto.proveedorId()));
        }

        Ingrediente ingrediente = Ingrediente.builder()
                .nombre(dto.nombre())
                .categoria(dto.categoria())
                .unidadBase(unidadBase)
                .costoUnitarioBase(dto.costoUnitarioBase())
                .stockMinimo(dto.stockMinimo())
                .proveedor(proveedor)
                .sku(dto.sku())
                .activo(dto.activo() != null ? dto.activo() : true)
                .build();

        ingrediente = ingredienteRepository.save(ingrediente);
        return mapper.toIngredienteDTO(ingrediente);
    }

    @CacheEvict(value = "ingredientes", allEntries = true)
    @Transactional
    public IngredienteDTO actualizar(Long id, IngredienteDTO dto) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado con id: " + id));

        Unidad unidadBase = unidadRepository.findById(dto.unidadBaseId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Unidad base no encontrada con id: " + dto.unidadBaseId()));

        Proveedor proveedor = null;
        if (dto.proveedorId() != null) {
            proveedor = proveedorRepository.findById(dto.proveedorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Proveedor no encontrado con id: " + dto.proveedorId()));
        }

        ingrediente.setNombre(dto.nombre());
        ingrediente.setCategoria(dto.categoria());
        ingrediente.setUnidadBase(unidadBase);
        ingrediente.setCostoUnitarioBase(dto.costoUnitarioBase());
        ingrediente.setStockMinimo(dto.stockMinimo());
        ingrediente.setProveedor(proveedor);
        ingrediente.setSku(dto.sku());
        ingrediente.setActivo(dto.activo() != null ? dto.activo() : true);

        ingrediente = ingredienteRepository.save(ingrediente);
        return mapper.toIngredienteDTO(ingrediente);
    }

    @CacheEvict(value = "ingredientes", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Ingrediente ingrediente = ingredienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado con id: " + id));
        ingrediente.setActivo(false);
        ingredienteRepository.save(ingrediente);
    }
}
