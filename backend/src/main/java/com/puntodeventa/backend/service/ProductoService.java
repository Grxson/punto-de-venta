package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
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
    private final SucursalRepository sucursalRepository;

    public ProductoService(ProductoRepository productoRepository, CategoriaProductoRepository categoriaRepository, SucursalRepository sucursalRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.sucursalRepository = sucursalRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductoDTO> listar(Optional<Boolean> activo, Optional<Boolean> enMenu, Optional<Long> categoriaId,
            Optional<String> q) {
        // ✅ SEGREGACIÓN: Obtener solo productos de la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        // Obtener solo productos base (producto_base_id IS NULL) de la sucursal actual
        List<Producto> productos = productoRepository.findBySucursalIdAndProductoBaseIdIsNull(sucursalId).stream()
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
        // ✅ SEGREGACIÓN: Validar que el producto pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        
        // Validar segregación: el producto debe pertenecer a la sucursal del usuario
        if (p.getSucursal() == null || !p.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Producto no encontrado en su sucursal");
        }

        // Si es un producto base (no tiene producto base), devolver con variantes
        if (p.getProductoBase() == null) {
            return toDTOWithVariantes(p);
        } else {
            // Si es una variante, devolver sin variantes
            return toDTO(p);
        }
    }

    /**
     * Obtener variantes de un producto base
     */
    @Cacheable(value = "productos", key = "'variantes-' + #productoBaseId")
    @Transactional(readOnly = true)
    public List<ProductoDTO> obtenerVariantes(Long productoBaseId) {
        // ✅ SEGREGACIÓN: Validar que el producto base pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        // Verificar que el producto base existe y pertenece a esta sucursal
        Producto productoBase = productoRepository.findById(productoBaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + productoBaseId));
        
        if (productoBase.getSucursal() == null || !productoBase.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Producto no encontrado en su sucursal");
        }

        // Buscar variantes (todas las variantes están en la misma sucursal que el base)
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
        // ✅ SEGREGACIÓN: Auto-asignar sucursal del usuario actual
        Long sucursalId = SucursalContext.getSucursalId();
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));
        
        Producto p = new Producto();
        apply(dto, p);
        p.setSucursal(sucursal);
        
        Producto guardado = productoRepository.save(p);
        return toDTO(guardado);
    }

    @CacheEvict(value = "productos", allEntries = true)
    public ProductoDTO actualizar(Long id, ProductoDTO dto) {
        // ✅ SEGREGACIÓN: Validar que el producto pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        
        if (p.getSucursal() == null || !p.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Producto no encontrado en su sucursal");
        }

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
        // ✅ SEGREGACIÓN: Validar que el producto pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
        
        if (p.getSucursal() == null || !p.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Producto no encontrado en su sucursal");
        }

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

    /**
     * Eliminar producto definitivamente (hard delete)
     * Solo permite eliminar si el producto no tiene:
     * - Ventas asociadas
     * - Recetas asociadas
     * - Variantes (si es producto base)
     */
    @CacheEvict(value = "productos", allEntries = true)
    public void eliminarDefinitivamente(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // Verificar si el producto tiene variantes (si es un producto base)
        List<Producto> variantes = productoRepository.findAll().stream()
                .filter(prod -> prod.getProductoBase() != null && prod.getProductoBase().getId().equals(id))
                .toList();
        if (!variantes.isEmpty()) {
            throw new IllegalStateException("No se puede eliminar un producto base que tiene variantes");
        }

        // TODO: Verificar que no tenga ventas asociadas
        // TODO: Verificar que no tenga recetas asociadas

        // Realizar el hard delete
        productoRepository.deleteById(id);
    }

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
        p.setPrecio(dto.precio());
        p.setCostoEstimado(dto.costoEstimado());
        p.setSku(dto.sku());
        if (dto.activo() != null)
            p.setActivo(dto.activo());
        if (dto.disponibleEnMenu() != null)
            p.setDisponibleEnMenu(dto.disponibleEnMenu());

        // Manejar producto base para variantes
        // 🔒 IMPORTANTE: Solo actualizar si viene explícitamente en el DTO
        // Esto preserva la relación productoBase al actualizar otros campos como
        // categoría/subcategoría
        if (dto.productoBaseId() != null) {
            Producto productoBase = productoRepository.findById(dto.productoBaseId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto base no encontrado con id: " + dto.productoBaseId()));
            p.setProductoBase(productoBase);
        }
        // Nota: Si dto.productoBaseId() es null, NO modificamos productoBase.
        // Esto permite editar categorías sin perder la relación de variantes.

        // Manejar campos específicos de variante
        if (dto.nombreVariante() != null) {
            p.setNombreVariante(dto.nombreVariante());

            // Si es una variante y cambió el nombreVariante, reconstruir el nombre completo
            // automáticamente para mantener consistencia
            if (p.getProductoBase() != null) {
                p.setNombre(p.getProductoBase().getNombre() + " - " + dto.nombreVariante());
            }
        }
        if (dto.ordenVariante() != null) {
            p.setOrdenVariante(dto.ordenVariante());
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
                null, // Sin variantes para compatibilidad
                p.getProductoBase() != null ? p.getProductoBase().getId() : null,
                p.getNombreVariante(),
                p.getOrdenVariante());
    }

    /**
     * Convierte un producto base a DTO incluyendo sus variantes
     */
    private ProductoDTO toDTOWithVariantes(Producto productoBase) {
        // Usar la relación inversa @OneToMany para obtener variantes
        List<Producto> variantesProducto = productoBase.getVariantes() != null ? productoBase.getVariantes()
                : new java.util.ArrayList<>();

        List<ProductoDTO.VarianteDTO> variantes = variantesProducto.stream()
                .filter(v -> Boolean.TRUE.equals(v.getActivo())) // Solo variantes activas
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
                variantes.isEmpty() ? null : variantes,
                null, // productoBaseId null para productos base
                null, // nombreVariante null para productos base
                null // ordenVariante null para productos base
        );
    }
}
