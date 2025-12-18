package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.IngredienteDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final GastoRepository gastoRepository;
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
                .descripcion(dto.descripcion())
                .categoria(dto.categoria())
                .unidadBase(unidadBase)
                .stockMinimo(dto.stockMinimo())
                .proveedor(proveedor)
                .sku(dto.sku())
                .activo(dto.activo() != null ? dto.activo() : true)
                .build();

        // LÓGICA DE VINCULACIÓN CON GASTO
        BigDecimal costoUnitarioCalculado = dto.costoUnitarioBase();
        
        if (dto.gastoId() != null) {
            Gasto gasto = gastoRepository.findById(dto.gastoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + dto.gastoId()));
            
            ingrediente.setGasto(gasto);
            ingrediente.setCostoTotalGasto(gasto.getMonto());
            
            if (dto.unidadGastoId() != null) {
                Unidad unidadGasto = unidadRepository.findById(dto.unidadGastoId())
                        .orElseThrow(() -> new ResourceNotFoundException("Unidad de gasto no encontrada con id: " + dto.unidadGastoId()));
                ingrediente.setUnidadGasto(unidadGasto);
            }
            
            if (dto.factorConversion() != null && dto.factorConversion() > 0) {
                ingrediente.setFactorConversion(dto.factorConversion());
                // CÁLCULO AUTOMÁTICO: costo por unidad = costo total gasto / factor de conversión
                costoUnitarioCalculado = gasto.getMonto()
                        .divide(new BigDecimal(dto.factorConversion()), 6, BigDecimal.ROUND_HALF_UP);
            }
        }
        
        ingrediente.setCostoUnitarioBase(costoUnitarioCalculado);
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
        ingrediente.setDescripcion(dto.descripcion());
        ingrediente.setCategoria(dto.categoria());
        ingrediente.setUnidadBase(unidadBase);
        ingrediente.setStockMinimo(dto.stockMinimo());
        ingrediente.setProveedor(proveedor);
        ingrediente.setSku(dto.sku());
        ingrediente.setActivo(dto.activo() != null ? dto.activo() : true);

        // LÓGICA DE VINCULACIÓN CON GASTO
        BigDecimal costoUnitarioCalculado = dto.costoUnitarioBase();
        
        if (dto.gastoId() != null) {
            Gasto gasto = gastoRepository.findById(dto.gastoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + dto.gastoId()));
            
            ingrediente.setGasto(gasto);
            ingrediente.setCostoTotalGasto(gasto.getMonto());
            
            if (dto.unidadGastoId() != null) {
                Unidad unidadGasto = unidadRepository.findById(dto.unidadGastoId())
                        .orElseThrow(() -> new ResourceNotFoundException("Unidad de gasto no encontrada con id: " + dto.unidadGastoId()));
                ingrediente.setUnidadGasto(unidadGasto);
            }
            
            if (dto.factorConversion() != null && dto.factorConversion() > 0) {
                ingrediente.setFactorConversion(dto.factorConversion());
                // CÁLCULO AUTOMÁTICO: costo por unidad = costo total gasto / factor de conversión
                costoUnitarioCalculado = gasto.getMonto()
                        .divide(new BigDecimal(dto.factorConversion()), 6, BigDecimal.ROUND_HALF_UP);
            }
        } else {
            // Si no hay gasto vinculado, limpiar los campos de vinculación
            ingrediente.setGasto(null);
            ingrediente.setCostoTotalGasto(null);
            ingrediente.setUnidadGasto(null);
            ingrediente.setFactorConversion(1);
        }
        
        ingrediente.setCostoUnitarioBase(costoUnitarioCalculado);
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
