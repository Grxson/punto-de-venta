package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.GastoIndirectoDTO;
import com.puntodeventa.backend.model.GastoIndirecto;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.GastoIndirectoRepository;
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
 * Servicio para gestión de Gastos Indirectos
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GastoIndirectoService {

    private final GastoIndirectoRepository gastoIndirectoRepository;
    private final SucursalRepository sucursalRepository;

    /**
     * Obtiene todos los gastos indirectos de la sucursal actual.
     *
     * @return Lista de DTO con los gastos indirectos de la sucursal.
     */
    public List<GastoIndirectoDTO> obtenerPorSucursal() {
        Long sucursalId = SucursalContext.getSucursalId();
        return gastoIndirectoRepository.findBySucursalId(sucursalId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene solo los gastos indirectos activos de la sucursal actual.
     *
     * @return Lista de DTO de los gastos con {@code activo} en true.
     */
    public List<GastoIndirectoDTO> obtenerActivos() {
        Long sucursalId = SucursalContext.getSucursalId();
        return gastoIndirectoRepository.findBySucursalIdAndActivoTrue(sucursalId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un gasto indirecto por su identificador.
     *
     * @param id Identificador del gasto indirecto.
     * @return DTO del gasto encontrado.
     * @throws RuntimeException si el gasto no existe.
     */
    public GastoIndirectoDTO obtenerPorId(Long id) {
        return gastoIndirectoRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Gasto indirecto no encontrado: " + id));
    }

    /**
     * Crea un gasto indirecto en la sucursal del usuario.
     * Los montos no informados se asumen en cero.
     *
     * @param dto Datos del gasto indirecto a crear.
     * @return DTO del gasto creado.
     * @throws IllegalArgumentException si el nombre es obligatorio, no hay sucursal en el contexto o no existe.
     * @throws RuntimeException         si ocurre un error inesperado al persistir.
     */
    public GastoIndirectoDTO crear(GastoIndirectoDTO dto) {
        try {
            // Validar campos obligatorios
            if (dto.getNombre() == null || dto.getNombre().trim().isEmpty()) {
                throw new IllegalArgumentException("El nombre del gasto indirecto es obligatorio");
            }

            Long sucursalId = SucursalContext.getSucursalId();
            if (sucursalId == null) {
                throw new IllegalArgumentException("No se pudo obtener el ID de la sucursal del contexto");
            }

            Sucursal sucursal = sucursalRepository.findById(sucursalId)
                    .orElseThrow(() -> new IllegalArgumentException("Sucursal no encontrada: " + sucursalId));

            // Convertir montos a BigDecimal si no lo son (frontend envía números)
            BigDecimal montoMensual = dto.getMontoMensual() != null ? dto.getMontoMensual() : BigDecimal.ZERO;
            BigDecimal montoSemanal = dto.getMontoSemanal() != null ? dto.getMontoSemanal() : BigDecimal.ZERO;
            BigDecimal montoDiario = dto.getMontoDiario() != null ? dto.getMontoDiario() : BigDecimal.ZERO;

            GastoIndirecto gastoIndirecto = GastoIndirecto.builder()
                    .sucursal(sucursal)
                    .nombre(dto.getNombre().trim())
                    .descripcion(dto.getDescripcion())
                    .montoMensual(montoMensual)
                    .montoSemanal(montoSemanal)
                    .montoDiario(montoDiario)
                    .activo(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            log.info("Intentando crear gasto indirecto: nombre='{}', sucursal={}, monto={}",
                    gastoIndirecto.getNombre(), sucursalId, montoMensual);

            GastoIndirecto saved = gastoIndirectoRepository.save(gastoIndirecto);
            log.info("Gasto indirecto creado exitosamente: id={}, nombre='{}'", saved.getId(), saved.getNombre());
            return convertToDTO(saved);
        } catch (IllegalArgumentException e) {
            log.warn("Validación fallida al crear gasto indirecto: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al crear gasto indirecto", e);
            throw new RuntimeException("Error al crear gasto indirecto: " + e.getMessage(), e);
        }
    }

    /**
     * Actualiza un gasto indirecto existente.
     *
     * @param id  Identificador del gasto a actualizar.
     * @param dto Datos a aplicar sobre el gasto.
     * @return DTO del gasto actualizado.
     * @throws RuntimeException si el gasto no existe.
     */
    public GastoIndirectoDTO actualizar(Long id, GastoIndirectoDTO dto) {
        GastoIndirecto gastoIndirecto = gastoIndirectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto indirecto no encontrado: " + id));

        gastoIndirecto.setNombre(dto.getNombre());
        gastoIndirecto.setDescripcion(dto.getDescripcion());
        gastoIndirecto.setMontoMensual(dto.getMontoMensual());
        gastoIndirecto.setMontoSemanal(dto.getMontoSemanal());
        gastoIndirecto.setMontoDiario(dto.getMontoDiario());
        gastoIndirecto.setActivo(dto.getActivo());
        gastoIndirecto.setUpdatedAt(LocalDateTime.now());

        GastoIndirecto updated = gastoIndirectoRepository.save(gastoIndirecto);
        log.info("Gasto indirecto actualizado: {}", updated.getId());
        return convertToDTO(updated);
    }

    /**
     * Da de baja un gasto indirecto de forma lógica.
     *
     * @param id Identificador del gasto a desactivar.
     * @throws RuntimeException si el gasto no existe.
     */
    public void eliminar(Long id) {
        GastoIndirecto gastoIndirecto = gastoIndirectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto indirecto no encontrado: " + id));

        gastoIndirecto.setActivo(false);
        gastoIndirecto.setUpdatedAt(LocalDateTime.now());
        gastoIndirectoRepository.save(gastoIndirecto);
        log.info("Gasto indirecto desactivado: {}", id);
    }

    /**
     * Calcula la parte de gasto indirecto diario que corresponde a cada producto vendido.
     * Suma el monto diario de todos los gastos activos de la sucursal y lo reparte
     * entre los productos vendidos; sin ventas no hay costo que asignar.
     *
     * @param sucursalId        Identificador de la sucursal.
     * @param productosVendidos Cantidad de productos vendidos del período.
     * @return Gasto indirecto por producto, redondeado a dos decimales.
     */
    public BigDecimal calcularGastoPorProducto(Long sucursalId, Long productosVendidos) {
        if (productosVendidos == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalGastoDiario = gastoIndirectoRepository.findBySucursalId(sucursalId)
                .stream()
                .filter(GastoIndirecto::getActivo)
                .map(GastoIndirecto::getMontoDiario)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return totalGastoDiario.divide(BigDecimal.valueOf(productosVendidos), 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Convertir a DTO
     */
    private GastoIndirectoDTO convertToDTO(GastoIndirecto gastoIndirecto) {
        return GastoIndirectoDTO.builder()
                .id(gastoIndirecto.getId())
                .sucursalId(gastoIndirecto.getSucursal().getId())
                .sucursalNombre(gastoIndirecto.getSucursal().getNombre())
                .nombre(gastoIndirecto.getNombre())
                .descripcion(gastoIndirecto.getDescripcion())
                .montoMensual(gastoIndirecto.getMontoMensual())
                .montoSemanal(gastoIndirecto.getMontoSemanal())
                .montoDiario(gastoIndirecto.getMontoDiario())
                .activo(gastoIndirecto.getActivo())
                .createdAt(gastoIndirecto.getCreatedAt())
                .updatedAt(gastoIndirecto.getUpdatedAt())
                .build();
    }
}
