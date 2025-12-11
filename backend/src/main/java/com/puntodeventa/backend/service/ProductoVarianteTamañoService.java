package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoVarianteTamañoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoVarianteTamaño;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.ProductoTamaño;
import com.puntodeventa.backend.repository.ProductoVarianteTamañoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.ProductoTamañoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar la relación entre productos/variantes y sus tamaños.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoVarianteTamañoService {
    
    private final ProductoVarianteTamañoRepository varianteTamañoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTamañoRepository tamañoRepository;
    
    /**
     * Obtiene todos los tamaños de una variante/producto
     */
    @Transactional(readOnly = true)
    public List<ProductoVarianteTamañoDTO> obtenerTamañosPorProducto(Long productoId) {
        verificarProductoExiste(productoId);
        return varianteTamañoRepository.findByProductoId(productoId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una relación producto-tamaño por ID
     */
    @Transactional(readOnly = true)
    public ProductoVarianteTamañoDTO obtenerPorId(Long id) {
        return varianteTamañoRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));
    }
    
    /**
     * Verifica si un producto tiene un tamaño específico
     */
    @Transactional(readOnly = true)
    public boolean existeTamañoEnProducto(Long productoId, Long tamañoId) {
        return varianteTamañoRepository.findByProductoIdAndTamañoId(productoId, tamañoId).isPresent();
    }
    
    /**
     * Agrega un tamaño a un producto/variante
     */
    public ProductoVarianteTamañoDTO agregarTamaño(Long productoId, Long tamañoId, Integer orden) {
        Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + productoId));
        
        ProductoTamaño tamaño = tamañoRepository.findById(tamañoId)
            .orElseThrow(() -> new EntityNotFoundException("Tamaño no encontrado: " + tamañoId));
        
        // Verificar que no exista ya
        if (varianteTamañoRepository.findByProductoIdAndTamañoId(productoId, tamañoId).isPresent()) {
            throw new IllegalArgumentException("Este producto ya tiene este tamaño asignado");
        }
        
        ProductoVarianteTamaño varianteTamaño = ProductoVarianteTamaño.builder()
            .producto(producto)
            .tamaño(tamaño)
            .orden(orden != null ? orden : 0)
            .build();
        
        ProductoVarianteTamaño saved = varianteTamañoRepository.save(varianteTamaño);
        return toDTO(saved);
    }
    
    /**
     * Actualiza el orden de un tamaño en un producto
     */
    public ProductoVarianteTamañoDTO actualizarOrden(Long id, Integer nuevoOrden) {
        ProductoVarianteTamaño varianteTamaño = varianteTamañoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));
        
        varianteTamaño.setOrden(nuevoOrden != null ? nuevoOrden : 0);
        ProductoVarianteTamaño updated = varianteTamañoRepository.save(varianteTamaño);
        return toDTO(updated);
    }
    
    /**
     * Elimina un tamaño de un producto
     */
    public void eliminarTamaño(Long id) {
        if (!varianteTamañoRepository.existsById(id)) {
            throw new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id);
        }
        varianteTamañoRepository.deleteById(id);
    }
    
    /**
     * Elimina todos los tamaños de un producto (usar con cuidado)
     */
    public void eliminarTodosPorProducto(Long productoId) {
        List<ProductoVarianteTamaño> tamañosProducto = varianteTamañoRepository.findByProductoId(productoId);
        varianteTamañoRepository.deleteAll(tamañosProducto);
    }
    
    /**
     * Obtiene todos los productos que usan un tamaño específico
     */
    @Transactional(readOnly = true)
    public List<ProductoVarianteTamañoDTO> obtenerProductosPorTamaño(Long tamañoId) {
        verificarTamañoExiste(tamañoId);
        return varianteTamañoRepository.findByTamañoId(tamañoId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Convierte una entidad a DTO
     */
    private ProductoVarianteTamañoDTO toDTO(ProductoVarianteTamaño varianteTamaño) {
        return new ProductoVarianteTamañoDTO(
            varianteTamaño.getId(),
            varianteTamaño.getProducto().getId(),
            varianteTamaño.getProducto().getNombre(),
            varianteTamaño.getTamaño().getId(),
            varianteTamaño.getTamaño().getNombre(),
            varianteTamaño.getTamaño().getPrecioExtra(),
            varianteTamaño.getOrden()
        );
    }
    
    private void verificarProductoExiste(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new EntityNotFoundException("Producto no encontrado: " + productoId);
        }
    }
    
    private void verificarTamañoExiste(Long tamañoId) {
        if (!tamañoRepository.existsById(tamañoId)) {
            throw new EntityNotFoundException("Tamaño no encontrado: " + tamañoId);
        }
    }
}
