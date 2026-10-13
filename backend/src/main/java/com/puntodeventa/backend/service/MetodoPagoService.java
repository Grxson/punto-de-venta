package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.MetodoPagoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.MetodoPago;
import com.puntodeventa.backend.repository.MetodoPagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de métodos de pago.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;

    /**
     * Lista todos los métodos de pago, incluidos los inactivos.
     *
     * @return Lista de DTO con el catálogo completo; no se cachea si viene vacía.
     */
    @Cacheable(value = "metodos-pago", unless = "#result.isEmpty()")
    public List<MetodoPagoDTO> obtenerTodos() {
        return metodoPagoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Lista los métodos de pago activos.
     *
     * @return Lista de DTO de los métodos con {@code activo} en true.
     */
    @Cacheable(value = "metodos-pago", key = "'activos'")
    public List<MetodoPagoDTO> obtenerActivos() {
        return metodoPagoRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Obtiene un método de pago por su identificador.
     *
     * @param id Identificador del método de pago.
     * @return DTO del método encontrado.
     * @throws ResourceNotFoundException si el método no existe.
     */
    @Cacheable(value = "metodos-pago", key = "#id")
    public MetodoPagoDTO obtenerPorId(Long id) {
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        return toDTO(metodoPago);
    }

    /**
     * Crea un método de pago.
     *
     * @param dto Datos del método a crear.
     * @return DTO del método creado.
     */
    @CacheEvict(value = "metodos-pago", allEntries = true)
    @Transactional
    public MetodoPagoDTO crear(MetodoPagoDTO dto) {
        MetodoPago metodoPago = MetodoPago.builder()
                .nombre(dto.nombre())
                .requiereReferencia(dto.requiereReferencia())
                .activo(dto.activo())
                .descripcion(dto.descripcion())
                .build();

        MetodoPago guardado = metodoPagoRepository.save(metodoPago);
        return toDTO(guardado);
    }

    /**
     * Actualiza un método de pago existente.
     *
     * @param id  Identificador del método a actualizar.
     * @param dto Datos a aplicar sobre el método.
     * @return DTO del método actualizado.
     * @throws ResourceNotFoundException si el método no existe.
     */
    @CacheEvict(value = "metodos-pago", allEntries = true)
    @Transactional
    public MetodoPagoDTO actualizar(Long id, MetodoPagoDTO dto) {
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        metodoPago.setNombre(dto.nombre());
        metodoPago.setRequiereReferencia(dto.requiereReferencia());
        metodoPago.setActivo(dto.activo());
        metodoPago.setDescripcion(dto.descripcion());

        MetodoPago actualizado = metodoPagoRepository.save(metodoPago);
        return toDTO(actualizado);
    }

    /**
     * Elimina un método de pago de forma física.
     * Al no referenciarse desde el historial, el borrado no rompe integridad.
     *
     * @param id Identificador del método a eliminar.
     * @throws ResourceNotFoundException si el método no existe.
     */
    @CacheEvict(value = "metodos-pago", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        if (!metodoPagoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Método de pago no encontrado con ID: " + id);
        }
        metodoPagoRepository.deleteById(id);
    }

    // Convierte una entidad en su DTO de salida.
    private MetodoPagoDTO toDTO(MetodoPago metodoPago) {
        return new MetodoPagoDTO(
                metodoPago.getId(),
                metodoPago.getNombre(),
                metodoPago.getRequiereReferencia(),
                metodoPago.getActivo(),
                metodoPago.getDescripcion());
    }
}
