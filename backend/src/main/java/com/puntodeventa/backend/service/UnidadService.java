package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.UnidadDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.Unidad;
import com.puntodeventa.backend.repository.UnidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de unidades de medida.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnidadService {

    private final UnidadRepository unidadRepository;
    private final InventarioMapper mapper;

    @Cacheable(value = "unidades", unless = "#result.isEmpty()")
    public List<UnidadDTO> obtenerTodas() {
        return unidadRepository.findAll().stream()
                .map(mapper::toUnidadDTO)
                .toList();
    }

    @Cacheable(value = "unidades", key = "#id")
    public UnidadDTO obtenerPorId(Long id) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + id));
        return mapper.toUnidadDTO(unidad);
    }

    @CacheEvict(value = "unidades", allEntries = true)
    @Transactional
    public UnidadDTO crear(UnidadDTO dto) {
        Unidad unidad = mapper.toUnidad(dto);
        unidad = unidadRepository.save(unidad);
        return mapper.toUnidadDTO(unidad);
    }

    @CacheEvict(value = "unidades", allEntries = true)
    @Transactional
    public UnidadDTO actualizar(Long id, UnidadDTO dto) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + id));

        unidad.setNombre(dto.nombre());
        unidad.setAbreviatura(dto.abreviatura());
        unidad.setFactorBase(dto.factorBase());
        unidad.setDescripcion(dto.descripcion());

        unidad = unidadRepository.save(unidad);
        return mapper.toUnidadDTO(unidad);
    }

    @CacheEvict(value = "unidades", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        if (!unidadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Unidad no encontrada con id: " + id);
        }
        unidadRepository.deleteById(id);
    }
}
