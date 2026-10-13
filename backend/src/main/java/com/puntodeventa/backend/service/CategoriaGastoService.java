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

    /**
     * Lista todas las categorías de gasto de la sucursal del usuario, incluidas las inactivas.
     *
     * @return Lista de DTO con el catálogo de categorías de la sucursal.
     */
    public List<CategoriaGastoDTO> obtenerTodas() {
        Long sucursalId = SucursalContext.getSucursalId();
        return categoriaGastoRepository.findBySucursalId(sucursalId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Lista las categorías de gasto activas de la sucursal del usuario.
     *
     * @return Lista de DTO de las categorías con {@code activo} en true.
     */
    public List<CategoriaGastoDTO> obtenerActivas() {
        Long sucursalId = SucursalContext.getSucursalId();
        return categoriaGastoRepository.findBySucursalIdAndActivoTrue(sucursalId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Obtiene una categoría de gasto por su identificador.
     *
     * @param id Identificador de la categoría.
     * @return DTO de la categoría encontrada.
     * @throws ResourceNotFoundException si la categoría no existe.
     */
    public CategoriaGastoDTO obtenerPorId(Long id) {
        CategoriaGasto categoria = categoriaGastoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + id));
        return toDTO(categoria);
    }

    /**
     * Crea una categoría de gasto en la sucursal del usuario.
     *
     * @param dto Datos de la categoría a crear.
     * @return DTO de la categoría creada.
     * @throws ResourceNotFoundException si la sucursal no existe.
     */
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

    /**
     * Actualiza una categoría de gasto existente.
     *
     * @param id  Identificador de la categoría a actualizar.
     * @param dto Datos a aplicar sobre la categoría.
     * @return DTO de la categoría actualizada.
     * @throws ResourceNotFoundException si la categoría no existe.
     */
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

    /**
     * Da de baja una categoría de gasto de forma lógica.
     * No se borra la fila porque los gastos históricos la referencian.
     *
     * @param id Identificador de la categoría a desactivar.
     * @throws ResourceNotFoundException si la categoría no existe.
     */
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
