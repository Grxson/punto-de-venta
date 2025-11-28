package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaProductoRepository categoriaRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaProductoRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId, Optional<String> q) {
        // Obtener solo productos base (producto_base_id IS NULL)
        List<Producto> productos = productoRepository.findAll().stream()
                .filter(p -> p.getProductoBase() == null) // Solo productos base
                .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
                .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
                .filter(p -> categoriaId.map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId())).orElse(true))
                .filter(p -> q.map(s -> p.getNombre() != null && p.getNombre().toLowerCase().contains(s.toLowerCase())).orElse(true))
                .toList();
        
        return productos.stream()
                .map(this::toDTOWithVariantes)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoDTO obtener(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return toDTO(p);
    }

    public ProductoDTO crear(ProductoDTO dto) {
        Producto p = new Producto();
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    public void eliminar(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        // Borrado lógico
        p.setActivo(false);
        productoRepository.save(p);
    }

    public ProductoDTO cambiarEstado(Long id, boolean activo) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        p.setActivo(activo);
        return toDTO(productoRepository.save(p));
    }

    private void apply(ProductoDTO dto, Producto p) {
        if (dto.nombre() != null) p.setNombre(dto.nombre());
        p.setDescripcion(dto.descripcion());
        if (dto.categoriaId() != null) {
            CategoriaProducto c = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + dto.categoriaId()));
            p.setCategoria(c);
        } else {
            p.setCategoria(null);
        }
        p.setPrecio(dto.precio());
        p.setCostoEstimado(dto.costoEstimado());
        p.setSku(dto.sku());
        if (dto.activo() != null) p.setActivo(dto.activo());
        if (dto.disponibleEnMenu() != null) p.setDisponibleEnMenu(dto.disponibleEnMenu());
    }

    private ProductoDTO toDTO(Producto p) {
        return new ProductoDTO(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getPrecio(),
                p.getCostoEstimado(),
                p.getSku(),
                p.getActivo(),
                p.getDisponibleEnMenu(),
                null // Sin variantes para compatibilidad
        );
    }

    /**
     * Convierte un producto base a DTO incluyendo sus variantes
     */
    private ProductoDTO toDTOWithVariantes(Producto productoBase) {
        // Buscar variantes de este producto base
        List<ProductoDTO.VarianteDTO> variantes = productoRepository.findAll().stream()
                .filter(p -> p.getProductoBase() != null && p.getProductoBase().getId().equals(productoBase.getId()))
                .filter(p -> p.getActivo()) // Solo variantes activas
                .sorted((v1, v2) -> {
                    Integer orden1 = v1.getOrdenVariante() != null ? v1.getOrdenVariante() : 999;
                    Integer orden2 = v2.getOrdenVariante() != null ? v2.getOrdenVariante() : 999;
                    return orden1.compareTo(orden2);
                })
                .map(v -> new ProductoDTO.VarianteDTO(
                        v.getId(),
                        v.getNombre(),
                        v.getNombreVariante(),
                        v.getPrecio(),
                        v.getOrdenVariante()
                ))
                .toList();

        return new ProductoDTO(
                productoBase.getId(),
                productoBase.getNombre(),
                productoBase.getDescripcion(),
                productoBase.getCategoria() != null ? productoBase.getCategoria().getId() : null,
                productoBase.getCategoria() != null ? productoBase.getCategoria().getNombre() : null,
                productoBase.getPrecio(),
                productoBase.getCostoEstimado(),
                productoBase.getSku(),
                productoBase.getActivo(),
                productoBase.getDisponibleEnMenu(),
                variantes.isEmpty() ? null : variantes
        );
    }
}
