package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    @Cacheable(value = "productos", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId,
            Optional<String> q) {
        // Obtener solo productos base (producto_base_id IS NULL) - más eficiente que
        // findAll()
        List<Producto> productos = productoRepository.findByProductoBaseIdIsNull().stream()
                .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
                .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
                .filter(p -> categoriaId.map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId()))
                        .orElse(true))
                .filter(p -> q.map(s -> p.getNombre() != null && p.getNombre().toLowerCase().contains(s.toLowerCase()))
                        .orElse(true))
                .toList();

        return productos.stream()
                .map(this::toDTOWithVariantes)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "productos", key = "#id")
    @Transactional(readOnly = true)
    public ProductoDTO obtener(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        return toDTO(p);
    }

    /**
     * Obtener variantes de un producto base
     */
    @Cacheable(value = "productos", key = "'variantes-' + #productoBaseId")
    @Transactional(readOnly = true)
    public List<ProductoDTO> obtenerVariantes(Long productoBaseId) {
        // Verificar que el producto base existe
        Producto productoBase = productoRepository.findById(productoBaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productoBaseId));

        // Buscar variantes
        return productoRepository.findAll().stream()
                .filter(p -> p.getProductoBase() != null && p.getProductoBase().getId().equals(productoBaseId))
                .sorted((v1, v2) -> {
                    Integer orden1 = v1.getOrdenVariante() != null ? v1.getOrdenVariante() : 999;
                    Integer orden2 = v2.getOrdenVariante() != null ? v2.getOrdenVariante() : 999;
                    return orden1.compareTo(orden2);
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO crear(ProductoDTO dto) {
        Producto p = new Producto();
        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Si es una variante, validar que no haya otro nombreVariante igual en el mismo
        // productoBase
        if (p.getProductoBase() != null && dto.nombreVariante() != null) {
            boolean existeOtraConSameNombre = productoRepository.findAll().stream()
                    .filter(prod -> prod.getProductoBase() != null
                            && prod.getProductoBase().getId().equals(p.getProductoBase().getId())
                            && !prod.getId().equals(id) // Excluir la misma variante
                            && prod.getNombreVariante() != null
                            && prod.getNombreVariante().equalsIgnoreCase(dto.nombreVariante().trim()))
                    .findAny()
                    .isPresent();

            if (existeOtraConSameNombre) {
                throw new IllegalArgumentException(
                        "Ya existe una variante con el nombre '" + dto.nombreVariante() + "' en este producto");
            }
        }

        apply(dto, p);
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    @CacheEvict(value = "productos", allEntries = true)
    public void eliminar(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Borrado lógico en cascada: marcar todas las variantes como inactivas
        List<Producto> variantes = productoRepository.findByProductoBaseIdOrderByOrdenVarianteAsc(id);
        if (!variantes.isEmpty()) {
            variantes.forEach(v -> v.setActivo(false));
            productoRepository.saveAll(variantes);
        }

        // Marcar el producto base como inactivo
        p.setActivo(false);
        productoRepository.save(p);
    }

    @CacheEvict(value = "productos", allEntries = true)
    public void eliminarPermanentemente(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Obtener todas las variantes del producto base
        List<Producto> variantes = productoRepository.findByProductoBaseIdOrderByOrdenVarianteAsc(id);

        // Eliminar todas las variantes en cascada
        if (!variantes.isEmpty()) {
            productoRepository.deleteAll(variantes);
        }

        // Eliminar el producto base
        productoRepository.delete(p);
    }

    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO cambiarEstado(Long id, boolean activo) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        p.setActivo(activo);
        return toDTO(productoRepository.save(p));
    }

    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO crearVariante(Long productoBaseId, ProductoDTO dto) {
        // Verificar que el producto base existe
        Producto productoBase = productoRepository.findById(productoBaseId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Producto base no encontrado con id: " + productoBaseId));

        // Crear la variante
        Producto variante = new Producto();
        variante.setProductoBase(productoBase);
        variante.setNombre(
                productoBase.getNombre() + (dto.nombreVariante() != null ? " - " + dto.nombreVariante() : ""));
        variante.setNombreVariante(dto.nombreVariante());
        variante.setPrecio(dto.precio() != null ? dto.precio() : productoBase.getPrecio());
        variante.setDescripcion(productoBase.getDescripcion());
        variante.setCategoria(productoBase.getCategoria());
        variante.setCostoEstimado(dto.costoEstimado() != null ? dto.costoEstimado() : productoBase.getCostoEstimado());
        variante.setSku(dto.sku());
        variante.setActivo(true);
        variante.setDisponibleEnMenu(productoBase.getDisponibleEnMenu());
        variante.setOrdenVariante(dto.ordenVariante());

        Producto guardada = productoRepository.save(variante);
        return toDTO(guardada);
    }

    private void apply(ProductoDTO dto, Producto p) {
        if (dto.nombre() != null)
            p.setNombre(dto.nombre());
        if (dto.descripcion() != null)
            p.setDescripcion(dto.descripcion());
        if (dto.categoriaId() != null) {
            CategoriaProducto c = categoriaRepository.findById(dto.categoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Categoría no encontrada con id: " + dto.categoriaId()));
            p.setCategoria(c);
        }
        if (dto.precio() != null)
            p.setPrecio(dto.precio());
        if (dto.costoEstimado() != null)
            p.setCostoEstimado(dto.costoEstimado());
        if (dto.sku() != null)
            p.setSku(dto.sku());
        if (dto.activo() != null)
            p.setActivo(dto.activo());
        if (dto.disponibleEnMenu() != null)
            p.setDisponibleEnMenu(dto.disponibleEnMenu());
        // Asegurar que no sea una variante cuando se actualiza un producto base
        if (p.getProductoBase() != null && dto.nombreVariante() == null) {
            // Si intenta actualizar una variante como producto base, no permitir
            // (mantener la relación)
        }
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
                p.getNombreVariante(),
                p.getOrdenVariante(),
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
                        v.getOrdenVariante()))
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
                null, // nombreVariante (solo para variantes)
                null, // ordenVariante (solo para variantes)
                variantes.isEmpty() ? null : variantes);
    }
}
