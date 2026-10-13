package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CategoriaProductoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import com.puntodeventa.backend.context.SucursalContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio de gestión de categorías de producto.
 * Toda operación se acota a la sucursal del usuario; la baja es lógica para no
 * romper el historial de productos ni de reportes que las referencian.
 */
@Slf4j
@Service
@Transactional
public class CategoriaProductoService {

    private final CategoriaProductoRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final SucursalRepository sucursalRepository;

    public CategoriaProductoService(CategoriaProductoRepository categoriaRepository,
            ProductoRepository productoRepository,
            SucursalRepository sucursalRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.sucursalRepository = sucursalRepository;
    }

    // ❌ NO CACHEAR: El filtro activa cambia frecuentemente (soft deletes)
    // Los filtros y la búsqueda se aplican en memoria porque el catálogo de
    // categorías es pequeño y así se evita multiplicar las variantes de consulta.
    /**
     * Lista las categorías de producto de la sucursal del usuario, con filtros
     * opcionales por estado activo y por texto de nombre.
     *
     * @param activa Filtro por estado; vacío para no filtrar.
     * @param q      Texto a buscar en el nombre; vacío para no filtrar.
     * @return Lista de DTO con las categorías que cumplen los filtros.
     */
    @Transactional(readOnly = true)
    public List<CategoriaProductoDTO> listar(Optional<Boolean> activa, Optional<String> q) {
        // ✅ SEGREGACIÓN: Obtener categorías solo de la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();
        return categoriaRepository.findBySucursal(sucursalId).stream()
                .filter(c -> activa.map(a -> a.equals(c.getActiva())).orElse(true))
                .filter(c -> q.map(s -> c.getNombre() != null && c.getNombre().toLowerCase().contains(s.toLowerCase()))
                        .orElse(true))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una categoría de producto de la sucursal del usuario.
     *
     * @param id Identificador de la categoría.
     * @return DTO de la categoría encontrada.
     * @throws ResourceNotFoundException si la categoría no existe o no pertenece a la sucursal.
     */
    @Cacheable(value = "categorias-productos", key = "#id")
    @Transactional(readOnly = true)
    public CategoriaProductoDTO obtener(Long id) {
        // ✅ SEGREGACIÓN: Validar que la categoría pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();

        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));

        if (c.getSucursal() == null || !c.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Categoría no encontrada en su sucursal");
        }

        return toDTO(c);
    }

    /**
     * Crea una categoría de producto en la sucursal del usuario.
     *
     * @param dto Datos de la categoría a crear.
     * @return DTO de la categoría creada.
     * @throws ResourceNotFoundException si la sucursal no existe.
     */
    @CacheEvict(value = "categorias-productos", allEntries = true)
    public CategoriaProductoDTO crear(CategoriaProductoDTO dto) {
        // ✅ SEGREGACIÓN: Asignar la categoría a la sucursal del usuario actual
        Long sucursalId = SucursalContext.getSucursalId();
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada: " + sucursalId));

        CategoriaProducto c = new CategoriaProducto();
        apply(dto, c);
        c.setSucursal(sucursal);
        return toDTO(categoriaRepository.save(c));
    }

    /**
     * Actualiza una categoría de producto existente.
     *
     * @param id  Identificador de la categoría a actualizar.
     * @param dto Datos a aplicar sobre la categoría.
     * @return DTO de la categoría actualizada.
     * @throws ResourceNotFoundException si la categoría no existe.
     */
    @CacheEvict(value = "categorias-productos", allEntries = true)
    public CategoriaProductoDTO actualizar(Long id, CategoriaProductoDTO dto) {
        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        apply(dto, c);
        return toDTO(categoriaRepository.save(c));
    }

    /**
     * Da de baja una categoría de producto de forma lógica y desactiva en cascada
     * sus subcategorías.
     * Se rechaza el borrado si aún hay productos asignados: eliminarla dejaría
     * productos huérfanos de categoría.
     *
     * @param id Identificador de la categoría a desactivar.
     * @throws ResourceNotFoundException si la categoría no existe.
     * @throws IllegalArgumentException  si la categoría tiene productos asociados.
     */
    @CacheEvict(value = "categorias-productos", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));

        // ✅ VERIFICAR que no hay productos usando esta categoría
        long productosConCategoria = productoRepository.findByCategoriaId(id).size();
        if (productosConCategoria > 0) {
            throw new IllegalArgumentException(
                    "No se puede eliminar la categoría '" + c.getNombre() + "' porque tiene " +
                            productosConCategoria + " producto(s) asociado(s). " +
                            "Elimina o reasigna los productos antes de eliminar la categoría.");
        }

        // ✅ CASCADA BLANDA: Las subcategorías se desactivan con la categoría
        // (Auditoría 2026-09-11, T1.6: soft-delete en vez de hard delete)
        if (c.getSubcategorias() != null && !c.getSubcategorias().isEmpty()) {
            c.getSubcategorias().forEach(sub -> sub.setActiva(false));
            log.info("Desactivando {} subcategorías de la categoría: {} (ID: {})",
                    c.getSubcategorias().size(), c.getNombre(), id);
        }

        // Borrado lógico: la categoría queda inactiva y oculta, sin romper
        // historial ni referencias. Antes se hacía deleteById (hard delete).
        c.setActiva(false);
        categoriaRepository.save(c);
        log.info("Categoría desactivada (soft delete): {} (ID: {})", c.getNombre(), c.getId());
    }

    private void apply(CategoriaProductoDTO dto, CategoriaProducto c) {
        if (dto.nombre() != null)
            c.setNombre(dto.nombre());
        c.setDescripcion(dto.descripcion());
        if (dto.activa() != null)
            c.setActiva(dto.activa());
        if (dto.orden() != null)
            c.setOrden(dto.orden());
    }

    private CategoriaProductoDTO toDTO(CategoriaProducto c) {
        return new CategoriaProductoDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getActiva(),
                c.getOrden());
    }
}
