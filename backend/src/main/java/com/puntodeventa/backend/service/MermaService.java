package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.MermaDTO;
import com.puntodeventa.backend.model.Merma;
import com.puntodeventa.backend.repository.MermaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MermaService {
    @Autowired
    private MermaRepository mermaRepository;

    @Autowired
    private com.puntodeventa.backend.repository.IngredienteRepository ingredienteRepository;

    @Autowired
    private com.puntodeventa.backend.repository.UnidadRepository unidadRepository;

    @Autowired
    private com.puntodeventa.backend.repository.UsuarioRepository usuarioRepository;

    // Métodos CRUD y de consulta
    @Transactional(readOnly = true)
    public List<MermaDTO> listarTodas() {
        return mermaRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MermaDTO obtenerPorId(Long id) {
        return mermaRepository.findById(id)
            .map(this::toDTO)
            .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MermaDTO> obtenerPorIngrediente(Long ingredienteId) {
        return mermaRepository.findAll().stream()
            .filter(m -> m.getIngrediente().getId().equals(ingredienteId))
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public MermaDTO registrarMerma(MermaDTO dto) {
        // Crear la entidad directamente
        Merma m = new Merma();
        m.setId(dto.id());
        m.setCantidad(dto.cantidad());
        m.setMotivo(dto.motivo());
        m.setCostoUnitario(dto.costoUnitario());

        // Mapear ingrediente
        if (dto.ingredienteId() != null) {
            m.setIngrediente(ingredienteRepository.findById(dto.ingredienteId())
                .orElseThrow(() -> new IllegalArgumentException("Ingrediente con ID " + dto.ingredienteId() + " no encontrado")));
        } else {
            throw new IllegalArgumentException("El ingredienteId es obligatorio");
        }

        // Mapear unidad
        if (dto.unidadId() != null) {
            m.setUnidad(unidadRepository.findById(dto.unidadId())
                .orElseThrow(() -> new IllegalArgumentException("Unidad con ID " + dto.unidadId() + " no encontrada")));
        } else {
            throw new IllegalArgumentException("El unidadId es obligatorio");
        }

        // Mapear responsable (opcional)
        if (dto.responsableId() != null) {
            m.setResponsable(usuarioRepository.findById(dto.responsableId()).orElse(null));
        }

        // Calcular costoTotal si no se envía
        if (dto.costoTotal() != null) {
            m.setCostoTotal(dto.costoTotal());
        } else if (dto.cantidad() != null && dto.costoUnitario() != null) {
            m.setCostoTotal(dto.cantidad().multiply(dto.costoUnitario()));
        } else {
            // Si no hay costoTotal ni datos para calcularlo, usar 0
            m.setCostoTotal(java.math.BigDecimal.ZERO);
        }

        // Asignar fecha actual si no se envía
        if (dto.fecha() != null) {
            m.setFecha(dto.fecha());
        } else {
            m.setFecha(java.time.LocalDateTime.now());
        }

        Merma guardada = mermaRepository.save(m);
        return toDTO(guardada);
    }

    // Conversión Entity <-> DTO
    private MermaDTO toDTO(Merma m) {
        return new MermaDTO(
            m.getId(),
            m.getIngrediente().getId(),
            m.getIngrediente().getNombre(),
            m.getCantidad(),
            m.getUnidad().getId(),
            m.getUnidad().getNombre(),
            m.getUnidad().getAbreviatura(),
            m.getMotivo(),
            m.getFecha(),
            m.getResponsable() != null ? m.getResponsable().getId() : null,
            m.getResponsable() != null ? m.getResponsable().getNombre() : null,
            m.getCostoUnitario(),
            m.getCostoTotal()
        );
    }

    private Merma toEntity(MermaDTO dto) {
        Merma m = new Merma();
        m.setId(dto.id());
        m.setCantidad(dto.cantidad());
        m.setMotivo(dto.motivo());
        m.setFecha(dto.fecha());
        m.setCostoUnitario(dto.costoUnitario());
        m.setCostoTotal(dto.costoTotal());

        // Mapear ingrediente
        if (dto.ingredienteId() != null) {
            m.setIngrediente(ingredienteRepository.findById(dto.ingredienteId()).orElse(null));
        }
        if (m.getIngrediente() == null) {
            throw new IllegalArgumentException("El ingrediente es obligatorio y no existe");
        }

        // Mapear unidad
        if (dto.unidadId() != null) {
            m.setUnidad(unidadRepository.findById(dto.unidadId()).orElse(null));
        }
        if (m.getUnidad() == null) {
            throw new IllegalArgumentException("La unidad es obligatoria y no existe");
        }

        // Mapear responsable
        if (dto.responsableId() != null) {
            m.setResponsable(usuarioRepository.findById(dto.responsableId()).orElse(null));
        }

        // Validar fecha y costoTotal
        if (m.getFecha() == null) {
            throw new IllegalArgumentException("La fecha es obligatoria");
        }
        if (m.getCostoTotal() == null) {
            throw new IllegalArgumentException("El costo total es obligatorio");
        }

        return m;
    }
}
