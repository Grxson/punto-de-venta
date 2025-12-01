package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.MetodoPagoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.MetodoPago;
import com.puntodeventa.backend.repository.MetodoPagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestión de métodos de pago.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;

    @Cacheable(value = "metodos-pago", unless = "#result.isEmpty()")
    public List<MetodoPagoDTO> obtenerTodos() {
        return metodoPagoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Cacheable(value = "metodos-pago", key = "'activos'")
    public List<MetodoPagoDTO> obtenerActivos() {
        return metodoPagoRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .toList();
    }

    @Cacheable(value = "metodos-pago", key = "#id")
    public MetodoPagoDTO obtenerPorId(Long id) {
        MetodoPago metodoPago = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        return toDTO(metodoPago);
    }

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

    @CacheEvict(value = "metodos-pago", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        if (!metodoPagoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Método de pago no encontrado con ID: " + id);
        }
        metodoPagoRepository.deleteById(id);
    }

    // Método helper para conversión a DTO
    private MetodoPagoDTO toDTO(MetodoPago metodoPago) {
        return new MetodoPagoDTO(
                metodoPago.getId(),
                metodoPago.getNombre(),
                metodoPago.getRequiereReferencia(),
                metodoPago.getActivo(),
                metodoPago.getDescripcion());
    }
}
