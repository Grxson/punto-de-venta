package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.RecetaDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.IngredienteRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.RecetaRepository;
import com.puntodeventa.backend.repository.UnidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Servicio para gestión de recetas (BOM - Bill of Materials).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecetaService {
    
    private final RecetaRepository recetaRepository;
    private final ProductoRepository productoRepository;
    private final IngredienteRepository ingredienteRepository;
    private final UnidadRepository unidadRepository;
    private final InventarioMapper mapper;
    
    public List<RecetaDTO> obtenerPorProducto(Long productoId) {
        return recetaRepository.findByProductoIdWithDetails(productoId).stream()
            .map(mapper::toRecetaDTO)
            .toList();
    }
    
    public List<RecetaDTO> obtenerPorIngrediente(Long ingredienteId) {
        return recetaRepository.findByIngredienteId(ingredienteId).stream()
            .map(mapper::toRecetaDTO)
            .toList();
    }
    
    @Transactional
    public RecetaDTO crear(RecetaDTO dto) {
        // Validar que el producto existe
        Producto producto = productoRepository.findById(dto.productoId())
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + dto.productoId()));
        
        // Validar que el ingrediente existe
        Ingrediente ingrediente = ingredienteRepository.findById(dto.ingredienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado con id: " + dto.ingredienteId()));
        
        // Validar que la unidad existe
        Unidad unidad = unidadRepository.findById(dto.unidadId())
            .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + dto.unidadId()));
        
        Receta receta = Receta.builder()
            .productoId(dto.productoId())
            .producto(producto)
            .ingredienteId(dto.ingredienteId())
            .ingrediente(ingrediente)
            .cantidad(dto.cantidad())
            .unidad(unidad)
            .mermaTeorica(dto.mermaTeorica() != null ? dto.mermaTeorica() : BigDecimal.ZERO)
            .build();
        
        receta = recetaRepository.save(receta);
        return mapper.toRecetaDTO(receta);
    }
    
    @Transactional
    public RecetaDTO actualizar(Long productoId, Long ingredienteId, RecetaDTO dto) {
        RecetaId recetaId = new RecetaId(productoId, ingredienteId);
        Receta receta = recetaRepository.findById(recetaId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Receta no encontrada para producto: " + productoId + " e ingrediente: " + ingredienteId));
        
        // Validar que la unidad existe
        Unidad unidad = unidadRepository.findById(dto.unidadId())
            .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada con id: " + dto.unidadId()));
        
        receta.setCantidad(dto.cantidad());
        receta.setUnidad(unidad);
        receta.setMermaTeorica(dto.mermaTeorica() != null ? dto.mermaTeorica() : BigDecimal.ZERO);
        
        receta = recetaRepository.save(receta);
        return mapper.toRecetaDTO(receta);
    }
    
    @Transactional
    public void eliminar(Long productoId, Long ingredienteId) {
        RecetaId recetaId = new RecetaId(productoId, ingredienteId);
        if (!recetaRepository.existsById(recetaId)) {
            throw new ResourceNotFoundException(
                "Receta no encontrada para producto: " + productoId + " e ingrediente: " + ingredienteId);
        }
        recetaRepository.deleteById(recetaId);
    }
    
    @Transactional
    public void eliminarRecetasDeProducto(Long productoId) {
        List<Receta> recetas = recetaRepository.findByProductoId(productoId);
        recetaRepository.deleteAll(recetas);
    }
    
    /**
     * Calcula el costo estándar de un producto basado en su receta.
     * Incluye el ajuste por merma teórica.
     */
    public BigDecimal calcularCostoReceta(Long productoId) {
        List<Receta> recetas = recetaRepository.findByProductoIdWithDetails(productoId);
        
        if (recetas.isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        return recetas.stream()
            .map(this::calcularCostoIngrediente)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    private BigDecimal calcularCostoIngrediente(Receta receta) {
        BigDecimal cantidad = receta.getCantidad();
        BigDecimal mermaTeorica = receta.getMermaTeorica();
        BigDecimal costoUnitario = receta.getIngrediente().getCostoUnitarioBase();
        
        // cantidad_real = cantidad / (1 - merma_teorica)
        BigDecimal cantidadReal = mermaTeorica.compareTo(BigDecimal.ONE) < 0
            ? cantidad.divide(BigDecimal.ONE.subtract(mermaTeorica), 6, BigDecimal.ROUND_HALF_UP)
            : cantidad;
        
        // Aplicar factor de conversión de unidad si es necesario
        BigDecimal factorConversion = receta.getUnidad().getFactorBase();
        BigDecimal cantidadEnUnidadBase = cantidadReal.multiply(factorConversion);
        
        // costo = cantidad_en_unidad_base * costo_unitario_base
        return cantidadEnUnidadBase.multiply(costoUnitario);
    }
}
