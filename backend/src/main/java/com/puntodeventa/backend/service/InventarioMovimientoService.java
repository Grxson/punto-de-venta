package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.InventarioMovimientoDTO;
import com.puntodeventa.backend.model.InventarioMovimiento;
import com.puntodeventa.backend.repository.InventarioMovimientoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioMovimientoService {
    @Autowired
    private InventarioMovimientoRepository movimientoRepository;

    @Autowired
    private com.puntodeventa.backend.repository.IngredienteRepository ingredienteRepository;

    @Autowired
    private com.puntodeventa.backend.repository.UnidadRepository unidadRepository;

    // Métodos CRUD y de consulta
    @Transactional(readOnly = true)
    public List<InventarioMovimientoDTO> listarTodos() {
        return movimientoRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InventarioMovimientoDTO obtenerPorId(Long id) {
        return movimientoRepository.findById(id)
            .map(this::toDTO)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<InventarioMovimientoDTO> obtenerPorIngrediente(Long ingredienteId) {
        return movimientoRepository.findAll().stream()
            .filter(m -> m.getIngrediente().getId().equals(ingredienteId))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventarioMovimientoDTO> obtenerPorIngredienteYTipo(Long ingredienteId, String tipo) {
        return movimientoRepository.findAll().stream()
            .filter(m -> m.getIngrediente().getId().equals(ingredienteId) 
                && m.getTipo().equalsIgnoreCase(tipo))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventarioMovimientoDTO> obtenerPorRangoFechas(java.time.LocalDateTime desde, java.time.LocalDateTime hasta) {
        return movimientoRepository.findAll().stream()
            .filter(m -> m.getFecha().isAfter(desde) && m.getFecha().isBefore(hasta))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public InventarioMovimientoDTO registrarMovimiento(InventarioMovimientoDTO dto) {
        // Crear la entidad primero
        InventarioMovimiento mov = new InventarioMovimiento();
        mov.setId(dto.id());
        mov.setTipo(dto.tipo());
        mov.setCantidad(dto.cantidad());
        mov.setCostoUnitario(dto.costoUnitario());
        
        // Mapear ingrediente
        if (dto.ingredienteId() != null) {
            mov.setIngrediente(ingredienteRepository.findById(dto.ingredienteId())
                .orElseThrow(() -> new IllegalArgumentException("Ingrediente con ID " + dto.ingredienteId() + " no encontrado")));
        } else {
            throw new IllegalArgumentException("El ingredienteId es obligatorio");
        }

        // Mapear unidad
        if (dto.unidadId() != null) {
            mov.setUnidad(unidadRepository.findById(dto.unidadId())
                .orElseThrow(() -> new IllegalArgumentException("Unidad con ID " + dto.unidadId() + " no encontrada")));
        } else {
            throw new IllegalArgumentException("El unidadId es obligatorio");
        }

        // Calcular costoTotal si no se envía
        if (dto.costoTotal() != null) {
            mov.setCostoTotal(dto.costoTotal());
        } else if (dto.cantidad() != null && dto.costoUnitario() != null) {
            mov.setCostoTotal(dto.cantidad().multiply(dto.costoUnitario()));
        } else {
            // Si no hay costoTotal ni datos para calcularlo, usar 0
            mov.setCostoTotal(java.math.BigDecimal.ZERO);
        }

        // Asignar fecha actual si no se envía
        if (dto.fecha() != null) {
            mov.setFecha(dto.fecha());
        } else {
            mov.setFecha(java.time.LocalDateTime.now());
        }

        // Mapear campos adicionales
        mov.setRefTipo(dto.refTipo());
        mov.setRefId(dto.refId());
        mov.setLote(dto.lote());
        mov.setCaducidad(dto.caducidad());
        mov.setNota(dto.nota());

        InventarioMovimiento guardado = movimientoRepository.save(mov);
        return toDTO(guardado);
    }

    // Conversión Entity <-> DTO
    private InventarioMovimientoDTO toDTO(InventarioMovimiento m) {
            return new InventarioMovimientoDTO(
                m.getId(),
                m.getIngrediente() != null ? m.getIngrediente().getId() : null,
                m.getIngrediente() != null ? m.getIngrediente().getNombre() : null,
                m.getTipo(),
                m.getCantidad(),
                m.getUnidad() != null ? m.getUnidad().getId() : null,
                m.getUnidad() != null ? m.getUnidad().getNombre() : null,
                m.getUnidad() != null ? m.getUnidad().getAbreviatura() : null,
                m.getCostoUnitario(),
                m.getCostoTotal(),
                m.getFecha(),
                m.getRefTipo(),
                m.getRefId(),
                m.getLote(),
                m.getCaducidad(),
                m.getNota()
            );
    }

    private InventarioMovimiento toEntity(InventarioMovimientoDTO dto) {
        InventarioMovimiento m = new InventarioMovimiento();
        m.setId(dto.id());
        m.setTipo(dto.tipo());
        m.setCantidad(dto.cantidad());
        m.setCostoUnitario(dto.costoUnitario());
        m.setCostoTotal(dto.costoTotal());
        m.setFecha(dto.fecha());

        // Mapear ingrediente
        if (dto.ingredienteId() != null) {
            m.setIngrediente(ingredienteRepository.findById(dto.ingredienteId()).orElse(null));
        }

        // Mapear unidad
        if (dto.unidadId() != null) {
            m.setUnidad(unidadRepository.findById(dto.unidadId()).orElse(null));
        }

        // Mapear campos adicionales
        m.setRefTipo(dto.refTipo());
        m.setRefId(dto.refId());
        m.setLote(dto.lote());
        m.setCaducidad(dto.caducidad());
        m.setNota(dto.nota());

        return m;
    }
}
