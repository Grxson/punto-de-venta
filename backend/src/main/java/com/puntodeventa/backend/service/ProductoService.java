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
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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
        
        // 🚀 OPTIMIZACIÓN: Query única con LEFT JOIN FETCH para variantes + categorías
        List<Producto> productos = productoRepository.findProductosBaseConVariantes(sucursalId).stream()
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

    /**
     * OPTIMIZACIÓN PASO 1.2: Listar productos con paginación
     * 
     * ✅ OPTIMIZACIÓN CRÍTICA: Usa query con LEFT JOIN FETCH para evitar N+1
     * Antes: findBySucursalIdAndProductoBaseIdIsNull() + toDTOWithVariantes() = 1+N queries
     * Después: findProductosBaseConVariantes() = 1 query con JOIN FETCH
     * Impacto esperado: De 5.8 segundos a ~200ms (96% mejora)
     */
    @Transactional(readOnly = true)
    public Page<ProductoDTO> listarPaginado(
            Pageable pageable,
            Optional<Boolean> activo,
            Optional<Boolean> enMenu,
            Optional<Long> categoriaId,
            Optional<String> q) {
        
        // ✅ SEGREGACIÓN: Obtener solo productos de la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        
        // 🚀 OPTIMIZACIÓN: Query única con LEFT JOIN FETCH para variantes + categorías
        // Esto evita completamente el N+1 problem
        List<Producto> productosBase = productoRepository.findProductosBaseConVariantes(sucursalId).stream()
                .filter(p -> activo.map(a -> a.equals(p.getActivo())).orElse(true))
                .filter(p -> enMenu.map(m -> m.equals(p.getDisponibleEnMenu())).orElse(true))
                .filter(p -> categoriaId.map(id -> p.getCategoria() != null && id.equals(p.getCategoria().getId()))
                        .orElse(true))
                .filter(p -> q.map(s -> p.getNombre() != null && p.getNombre().toLowerCase().contains(s.toLowerCase()))
                        .orElse(true))
                .toList();

        // Convertir a DTOs (sin N+1 porque variantes ya están cargadas)
        List<ProductoDTO> dtos = productosBase.stream()
                .map(this::toDTOWithVariantes)
                .collect(Collectors.toList());

        // Aplicar paginación manualmente (porque los filtros están en memoria)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dtos.size());

        List<ProductoDTO> pageContent = dtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, dtos.size());
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
     * 
     * OPTIMIZACIÓN PASO 1.5: Usa query optimizada sin N+1
     * Antes: findAll() + filter = N+1 queries
     * Después: findVariantesByProductoBaseId() = 1 query
     * Impacto: -70% queries para obtener variantes
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

        // ✅ OPTIMIZACIÓN: Usar query específica en lugar de findAll() 
        return productoRepository.findVariantesByProductoBaseId(productoBaseId).stream()
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
            // ✅ OPTIMIZACIÓN PASO 1.5: Usar query específica en lugar de findAll()
            boolean existeOtraConSameNombre = productoRepository
                    .findVariantesByProductoBaseId(p.getProductoBase().getId()).stream()
                    .filter(prod -> !prod.getId().equals(id)) // Excluir la misma variante
                    .anyMatch(prod -> prod.getNombreVariante() != null
                            && prod.getNombreVariante().equalsIgnoreCase(dto.nombreVariante().trim()));

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
     * Elimina en cascada:
     * - Todas las variantes del producto base
     * - El producto base
     */
    @CacheEvict(value = "productos", allEntries = true)
    public void eliminarDefinitivamente(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));

        // ✅ SEGREGACIÓN: Validar que el producto pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        if (p.getSucursal() == null || !p.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Producto no encontrado en su sucursal");
        }

        // Si es un producto base, obtener todas sus variantes para eliminarlas primero
        if (p.getProductoBase() == null && p.getVariantes() != null && !p.getVariantes().isEmpty()) {
            // Hay variantes: eliminarlas en cascada (JPA lo hará automáticamente)
            log.info("Eliminando {} variantes del producto base: {} (ID: {})", 
                    p.getVariantes().size(), p.getNombre(), id);
        }

        // TODO: Verificar que no tenga ventas asociadas
        // TODO: Verificar que no tenga recetas asociadas

        // Realizar el hard delete - JPA eliminará en cascada todas las variantes
        productoRepository.deleteById(id);
        log.info("Producto eliminado definitivamente: {} (ID: {})", p.getNombre(), id);
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
        
        // Limpiar nombreVariante removiendo guiones y espacios al inicio/final
        String nombreVarianteLimpio = dto.nombreVariante() != null ? 
            dto.nombreVariante().trim().replaceAll("^[\\s\\-]+|[\\s\\-]+$", "") : null;
        
        variante.setNombre(
                productoBase.getNombre() + (nombreVarianteLimpio != null ? " - " + nombreVarianteLimpio : ""));
        variante.setNombreVariante(nombreVarianteLimpio);
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
            // Limpiar nombreVariante removiendo guiones y espacios al inicio/final
            String nombreVarianteLimpio = dto.nombreVariante().trim().replaceAll("^[\\s\\-]+|[\\s\\-]+$", "");
            p.setNombreVariante(nombreVarianteLimpio);

            // Si es una variante y cambió el nombreVariante, reconstruir el nombre completo
            // automáticamente para mantener consistencia
            if (p.getProductoBase() != null) {
                String nombreBaseLimpio = p.getProductoBase().getNombre().trim().replaceAll("[\\s\\-]+$", "");
                p.setNombre(nombreBaseLimpio + " - " + nombreVarianteLimpio);
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
                p.getOrdenVariante(),
                null, // tamaños: null por defecto
                null  // atributos: null por defecto
        );
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
                null, // ordenVariante null para productos base
                null, // tamaños: null por defecto
                null  // atributos: null por defecto
        );
    }
}
