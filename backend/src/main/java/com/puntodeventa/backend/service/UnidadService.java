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
 * Servicio de gestión de unidades de medida.
 * El catálogo es pequeño y de lectura muy frecuente (lo consultan recetas,
 * ingredientes y productos), por eso las lecturas se cachean y cada escritura
 * invalida la caché completa al no poder enumerar las claves afectadas.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UnidadService {

    private final UnidadRepository unidadRepository;
    private final InventarioMapper mapper;

    /**
     * Lista todas las unidades de medida.
     *
     * @return Lista de DTO con el catálogo completo; se omite cachear si viene vacío
     *         para no congelar un arranque con la tabla sin poblar.
     */
    @Cacheable(value = "unidades", unless = "#result.isEmpty()")
    public List<UnidadDTO> obtenerTodas() {
        return unidadRepository.findAll().stream()
                .map(mapper::toUnidadDTO)
                .toList();
    }

    /**
     * Obtiene una unidad de medida por su identificador.
     *
     * @param id Identificador de la unidad.
     * @return DTO de la unidad encontrada.
     * @throws ResourceNotFoundException si la unidad no existe.
     */
    @Cacheable(value = "unidades", key = "#id")
    public UnidadDTO obtenerPorId(Long id) {
        Unidad unidad = unidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + id));
        return mapper.toUnidadDTO(unidad);
    }

    /**
     * Crea una unidad de medida.
     *
     * @param dto Datos de la unidad a crear.
     * @return DTO de la unidad creada.
     */
    @CacheEvict(value = "unidades", allEntries = true)
    @Transactional
    public UnidadDTO crear(UnidadDTO dto) {
        Unidad unidad = mapper.toUnidad(dto);
        unidad = unidadRepository.save(unidad);
        return mapper.toUnidadDTO(unidad);
    }

    /**
     * Actualiza una unidad de medida existente.
     *
     * @param id  Identificador de la unidad a actualizar.
     * @param dto Datos a aplicar sobre la unidad.
     * @return DTO de la unidad actualizada.
     * @throws ResourceNotFoundException si la unidad no existe.
     */
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

    /**
     * Elimina una unidad de medida.
     *
     * @param id Identificador de la unidad a eliminar.
     * @throws ResourceNotFoundException si la unidad no existe.
     */
    @CacheEvict(value = "unidades", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        if (!unidadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Unidad no encontrada con id: " + id);
        }
        unidadRepository.deleteById(id);
    }
}
