package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoVarianteTamanoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoVarianteTamano;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.ProductoTamano;
import com.puntodeventa.backend.repository.ProductoVarianteTamanoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.ProductoTamanoRepository;
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
public class ProductoVarianteTamanoService {
    
    private final ProductoVarianteTamanoRepository varianteTamanoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTamanoRepository tamañoRepository;
    
    /**
     * Obtiene todos los tamaños de una variante/producto
     */
    @Transactional(readOnly = true)
    public List<ProductoVarianteTamanoDTO> obtenerTamanosPorProducto(Long productoId) {
        verificarProductoExiste(productoId);
        return varianteTamanoRepository.findByProductoId(productoId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una relación producto-tamaño por ID
     */
    @Transactional(readOnly = true)
    public ProductoVarianteTamanoDTO obtenerPorId(Long id) {
        return varianteTamanoRepository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));
    }
    
    /**
     * Verifica si un producto tiene un tamaño específico
     */
    @Transactional(readOnly = true)
    public boolean existeTamanoEnProducto(Long productoId, Long tamañoId) {
        return varianteTamanoRepository.findByProductoIdAndTamanoId(productoId, tamañoId).isPresent();
    }
    
    /**
     * Agrega un tamaño a un producto/variante
     */
    public ProductoVarianteTamanoDTO agregarTamano(Long productoId, Long tamañoId, Integer orden) {
        Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + productoId));
        
        ProductoTamano tamaño = tamañoRepository.findById(tamañoId)
            .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + tamañoId));
        
        // Verificar que no exista ya
        if (varianteTamanoRepository.findByProductoIdAndTamanoId(productoId, tamañoId).isPresent()) {
            throw new IllegalArgumentException("Este producto ya tiene este tamaño asignado");
        }
        
        ProductoVarianteTamano varianteTamano = ProductoVarianteTamano.builder()
            .producto(producto)
            .tamaño(tamaño)
            .orden(orden != null ? orden : 0)
            .build();
        
        ProductoVarianteTamano saved = varianteTamanoRepository.save(varianteTamano);
        return toDTO(saved);
    }
    
    /**
     * Actualiza el orden de un tamaño en un producto
     */
    public ProductoVarianteTamanoDTO actualizarOrden(Long id, Integer nuevoOrden) {
        ProductoVarianteTamano varianteTamano = varianteTamanoRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));
        
        varianteTamano.setOrden(nuevoOrden != null ? nuevoOrden : 0);
        ProductoVarianteTamano updated = varianteTamanoRepository.save(varianteTamano);
        return toDTO(updated);
    }
    
    /**
     * Elimina un tamaño de un producto
     */
    public void eliminarTamano(Long id) {
        if (!varianteTamanoRepository.existsById(id)) {
            throw new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id);
        }
        varianteTamanoRepository.deleteById(id);
    }
    
    /**
     * Elimina todos los tamaños de un producto (usar con cuidado)
     */
    public void eliminarTodosPorProducto(Long productoId) {
        List<ProductoVarianteTamano> tamañosProducto = varianteTamanoRepository.findByProductoId(productoId);
        varianteTamanoRepository.deleteAll(tamañosProducto);
    }
    
    /**
     * Obtiene todos los productos que usan un tamaño específico
     */
    @Transactional(readOnly = true)
    public List<ProductoVarianteTamanoDTO> obtenerProductosPorTamano(Long tamañoId) {
        verificarTamanoExiste(tamañoId);
        return varianteTamanoRepository.findByTamanoId(tamañoId)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Convierte una entidad a DTO
     */
    private ProductoVarianteTamanoDTO toDTO(ProductoVarianteTamano varianteTamano) {
        return new ProductoVarianteTamanoDTO(
            varianteTamano.getId(),
            varianteTamano.getProducto().getId(),
            varianteTamano.getProducto().getNombre(),
            varianteTamano.getTamano().getId(),
            varianteTamano.getTamano().getNombre(),
            varianteTamano.getTamano().getPrecioExtra(),
            varianteTamano.getOrden()
        );
    }
    
    private void verificarProductoExiste(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new EntityNotFoundException("Producto no encontrado: " + productoId);
        }
    }
    
    private void verificarTamanoExiste(Long tamañoId) {
        if (!tamañoRepository.existsById(tamañoId)) {
            throw new EntityNotFoundException("Tamano no encontrado: " + tamañoId);
        }
    }
}
