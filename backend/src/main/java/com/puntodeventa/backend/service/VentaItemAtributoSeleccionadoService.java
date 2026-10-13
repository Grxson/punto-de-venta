package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.VentaItemAtributoSeleccionadoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.VentaItemAtributoSeleccionado;
import com.puntodeventa.backend.model.VentaItem;
import com.puntodeventa.backend.model.ProductoAtributo;
import com.puntodeventa.backend.model.ProductoAtributoOpcion;
import com.puntodeventa.backend.repository.VentaItemAtributoSeleccionadoRepository;
import com.puntodeventa.backend.repository.VentaItemRepository;
import com.puntodeventa.backend.repository.ProductoAtributoRepository;
import com.puntodeventa.backend.repository.ProductoAtributoOpcionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar los atributos seleccionados en items de venta.
 * Un atributo seleccionado puede provenir del catálogo (atributo más opción) o
 * de un valor escrito libremente por el cajero; ambos casos conviven en la misma
 * tabla y el {@code precioExtra} se suma al subtotal del item.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class VentaItemAtributoSeleccionadoService {
    
    private final VentaItemAtributoSeleccionadoRepository atributoSeleccionadoRepository;
    private final VentaItemRepository ventaItemRepository;
    private final ProductoAtributoRepository atributoRepository;
    private final ProductoAtributoOpcionRepository opcionRepository;
    
    /**
     * Obtiene todos los atributos seleccionados de un item de venta.
     *
     * @param ventaItemId Identificador del item de venta.
     * @return Lista de atributos seleccionados del item, en el orden de la base de datos.
     * @throws EntityNotFoundException si el item de venta no existe.
     */
    @Transactional(readOnly = true)
    public List<VentaItemAtributoSeleccionadoDTO> obtenerAtributosDelItem(Long ventaItemId) {
        verificarVentaItemExiste(ventaItemId);
        return atributoSeleccionadoRepository.findByVentaItemId(ventaItemId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Agrega un atributo seleccionado del catálogo a un item de venta.
     *
     * @param ventaItemId  Identificador del item de venta.
     * @param atributoId   Identificador del atributo, opcional.
     * @param opcionId     Identificador de la opción del atributo, opcional.
     * @param precioExtra Sobrecosto de la opción; si es {@code null} se toma cero.
     * @return DTO del atributo seleccionado ya persistido.
     * @throws EntityNotFoundException si el item, el atributo o la opción no existen.
     */
    public VentaItemAtributoSeleccionadoDTO agregarAtributo(
        Long ventaItemId,
        Long atributoId,
        Long opcionId,
        BigDecimal precioExtra
    ) {
        VentaItem ventaItem = ventaItemRepository.findById(ventaItemId)
            .orElseThrow(() -> new EntityNotFoundException("Item de venta no encontrado: " + ventaItemId));
        
        ProductoAtributo atributo = null;
        if (atributoId != null) {
            atributo = atributoRepository.findById(atributoId)
                .orElseThrow(() -> new EntityNotFoundException("Atributo no encontrado: " + atributoId));
        }
        
        ProductoAtributoOpcion opcion = null;
        if (opcionId != null) {
            opcion = opcionRepository.findById(opcionId)
                .orElseThrow(() -> new EntityNotFoundException("Opción no encontrado: " + opcionId));
        }
        
        VentaItemAtributoSeleccionado atributoSeleccionado = VentaItemAtributoSeleccionado.builder()
            .ventaItem(ventaItem)
            .atributo(atributo)
            .opcion(opcion)
            .precioExtra(precioExtra != null ? precioExtra : BigDecimal.ZERO)
            .createdAt(LocalDateTime.now())
            .build();
        
        VentaItemAtributoSeleccionado saved = atributoSeleccionadoRepository.save(atributoSeleccionado);
        return toDTO(saved);
    }
    
    /**
     * Agrega un atributo con valor personalizado, para cuando la opción no está en el catálogo.
     *
     * @param ventaItemId       Identificador del item de venta.
     * @param valorSeleccionado Texto libre capturado por el cajero.
     * @param precioExtra       Sobrecosto asociado; si es {@code null} se toma cero.
     * @return DTO del atributo seleccionado ya persistido.
     * @throws EntityNotFoundException si el item de venta no existe.
     */
    public VentaItemAtributoSeleccionadoDTO agregarAtributoPersonalizado(
        Long ventaItemId,
        String valorSeleccionado,
        BigDecimal precioExtra
    ) {
        VentaItem ventaItem = ventaItemRepository.findById(ventaItemId)
            .orElseThrow(() -> new EntityNotFoundException("Item de venta no encontrado: " + ventaItemId));
        
        VentaItemAtributoSeleccionado atributoSeleccionado = VentaItemAtributoSeleccionado.builder()
            .ventaItem(ventaItem)
            .valorSeleccionado(valorSeleccionado)
            .precioExtra(precioExtra != null ? precioExtra : BigDecimal.ZERO)
            .createdAt(LocalDateTime.now())
            .build();
        
        VentaItemAtributoSeleccionado saved = atributoSeleccionadoRepository.save(atributoSeleccionado);
        return toDTO(saved);
    }
    
    /**
     * Elimina un atributo seleccionado.
     *
     * @param id Identificador del atributo seleccionado.
     * @throws EntityNotFoundException si el atributo seleccionado no existe.
     */
    public void eliminarAtributo(Long id) {
        if (!atributoSeleccionadoRepository.existsById(id)) {
            throw new EntityNotFoundException("Atributo seleccionado no encontrado: " + id);
        }
        atributoSeleccionadoRepository.deleteById(id);
    }
    
    /**
     * Elimina todos los atributos seleccionados de un item de venta.
     *
     * @param ventaItemId Identificador del item de venta.
     * @throws EntityNotFoundException si el item de venta no existe.
     */
    public void limpiarAtributosDelItem(Long ventaItemId) {
        verificarVentaItemExiste(ventaItemId);
        atributoSeleccionadoRepository.deleteByVentaItemId(ventaItemId);
    }
    
    /**
     * Convierte una entidad a DTO.
     *
     * @param atributoSeleccionado Entidad a proyectar.
     * @return DTO con el atributo, la opción y el valor libre resueltos.
     */
    private VentaItemAtributoSeleccionadoDTO toDTO(VentaItemAtributoSeleccionado atributoSeleccionado) {
        return new VentaItemAtributoSeleccionadoDTO(
            atributoSeleccionado.getId(),
            atributoSeleccionado.getVentaItem().getId(),
            atributoSeleccionado.getAtributo() != null ? atributoSeleccionado.getAtributo().getId() : null,
            atributoSeleccionado.getAtributo() != null ? atributoSeleccionado.getAtributo().getNombre() : null,
            atributoSeleccionado.getOpcion() != null ? atributoSeleccionado.getOpcion().getId() : null,
            atributoSeleccionado.getOpcion() != null ? atributoSeleccionado.getOpcion().getNombre() : null,
            atributoSeleccionado.getValorSeleccionado(),
            atributoSeleccionado.getPrecioExtra()
        );
    }
    
    /**
     * Valida que exista el item de venta antes de operar sobre sus atributos.
     * Se usa {@code existsById} y no la entidad completa porque las operaciones
     * pendientes solo necesitan confirmar la existencia.
     *
     * @param ventaItemId Identificador del item de venta.
     * @throws EntityNotFoundException si el item de venta no existe.
     */
    private void verificarVentaItemExiste(Long ventaItemId) {
        if (!ventaItemRepository.existsById(ventaItemId)) {
            throw new EntityNotFoundException("Item de venta no encontrado: " + ventaItemId);
        }
    }
}
