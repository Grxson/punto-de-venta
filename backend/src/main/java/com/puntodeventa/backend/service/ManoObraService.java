package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.ManoObraDTO;
import com.puntodeventa.backend.model.ManoObra;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.ManoObraRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de Mano de Obra
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ManoObraService {

    private final ManoObraRepository manoObraRepository;
    private final SucursalRepository sucursalRepository;

    /**
     * Obtener toda la mano de obra de la sucursal actual
     */
    public List<ManoObraDTO> obtenerPorSucursal() {
        Long sucursalId = SucursalContext.getSucursalId();
        return manoObraRepository.findBySucursalId(sucursalId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener solo mano de obra activa
     */
    public List<ManoObraDTO> obtenerActivos() {
        Long sucursalId = SucursalContext.getSucursalId();
        return manoObraRepository.findBySucursalIdAndActivoTrue(sucursalId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener un registro de mano de obra por ID
     */
    public ManoObraDTO obtenerPorId(Long id) {
        return manoObraRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Mano de obra no encontrada: " + id));
    }

    /**
     * Crear un nuevo registro de mano de obra
     */
    public ManoObraDTO crear(ManoObraDTO dto) {
        try {
            // Validar campos obligatorios
            if (dto.getPuesto() == null || dto.getPuesto().trim().isEmpty()) {
                throw new IllegalArgumentException("El puesto es obligatorio");
            }

            Long sucursalId = SucursalContext.getSucursalId();
            if (sucursalId == null) {
                throw new IllegalArgumentException("No se pudo obtener el ID de la sucursal del contexto");
            }

            Sucursal sucursal = sucursalRepository.findById(sucursalId)
                    .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada: " + sucursalId));

            // Convertir montos a BigDecimal si no lo son
            BigDecimal salarioMensual = dto.getSalarioMensual() != null ? dto.getSalarioMensual() : BigDecimal.ZERO;
            BigDecimal pagoPorTurno = dto.getPagoPorTurno() != null ? dto.getPagoPorTurno() : BigDecimal.ZERO;

            ManoObra manoObra = ManoObra.builder()
                    .sucursal(sucursal)
                    .puesto(dto.getPuesto().trim())
                    .salarioMensual(salarioMensual)
                    .pagoPorTurno(pagoPorTurno)
                    .periodo(dto.getPeriodo())
                    .activo(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            log.info("Intentando crear mano de obra: puesto='{}', sucursal={}, salario={}",
                    manoObra.getPuesto(), sucursalId, salarioMensual);

            ManoObra saved = manoObraRepository.save(manoObra);
            log.info("Mano de obra creada exitosamente: id={}, puesto='{}'", saved.getId(), saved.getPuesto());
            return convertToDTO(saved);
        } catch (IllegalArgumentException e) {
            log.warn("Validación fallida al crear mano de obra: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear mano de obra", e);
            throw new RuntimeException("Error al crear mano de obra: " + e.getMessage(), e);
        }
    }

    /**
     * Actualizar un registro de mano de obra
     */
    public ManoObraDTO actualizar(Long id, ManoObraDTO dto) {
        ManoObra manoObra = manoObraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mano de obra no encontrada: " + id));

        manoObra.setPuesto(dto.getPuesto());
        manoObra.setSalarioMensual(dto.getSalarioMensual());
        manoObra.setPagoPorTurno(dto.getPagoPorTurno());
        manoObra.setPeriodo(dto.getPeriodo());
        manoObra.setActivo(dto.getActivo());
        manoObra.setUpdatedAt(LocalDateTime.now());

        ManoObra updated = manoObraRepository.save(manoObra);
        log.info("Mano de obra actualizada: {}", updated.getId());
        return convertToDTO(updated);
    }

    /**
     * Eliminar (desactivar) un registro de mano de obra
     */
    public void eliminar(Long id) {
        ManoObra manoObra = manoObraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mano de obra no encontrada: " + id));

        manoObra.setActivo(false);
        manoObra.setUpdatedAt(LocalDateTime.now());
        manoObraRepository.save(manoObra);
        log.info("Mano de obra desactivada: {}", id);
    }

    /**
     * Calcular costo de mano de obra por producto
     */
    public BigDecimal calcularManoObraPorProducto(Long sucursalId, Long productosVendidos) {
        if (productosVendidos == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalManoObraDiaria = manoObraRepository.findBySucursalId(sucursalId)
                .stream()
                .filter(ManoObra::getActivo)
                .map(mo -> {
                    if ("MENSUAL".equals(mo.getPeriodo())) {
                        // Asumir 22 días de trabajo por mes
                        return mo.getSalarioMensual().divide(BigDecimal.valueOf(22), 2, java.math.RoundingMode.HALF_UP);
                    } else if ("SEMANAL".equals(mo.getPeriodo())) {
                        // Asumir 5-6 días de trabajo por semana, dividimos entre 6
                        return mo.getSalarioMensual().divide(BigDecimal.valueOf(6), 2, java.math.RoundingMode.HALF_UP);
                    } else {
                        // POR_TURNO
                        return mo.getPagoPorTurno();
                    }
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalManoObraDiaria.divide(BigDecimal.valueOf(productosVendidos), 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Convertir a DTO
     */
    private ManoObraDTO convertToDTO(ManoObra manoObra) {
        return ManoObraDTO.builder()
                .id(manoObra.getId())
                .sucursalId(manoObra.getSucursal().getId())
                .sucursalNombre(manoObra.getSucursal().getNombre())
                .usuarioId(manoObra.getUsuario() != null ? manoObra.getUsuario().getId() : null)
                .usuarioNombre(manoObra.getUsuario() != null ? manoObra.getUsuario().getNombre() : null)
                .puesto(manoObra.getPuesto())
                .salarioMensual(manoObra.getSalarioMensual())
                .pagoPorTurno(manoObra.getPagoPorTurno())
                .periodo(manoObra.getPeriodo())
                .activo(manoObra.getActivo())
                .createdAt(manoObra.getCreatedAt())
                .updatedAt(manoObra.getUpdatedAt())
                .build();
    }
}
