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
    // Se está moviendo hacia invalidación de caché completo
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

    @Cacheable(value = "categorias-productos", key = "#id")
    @Transactional(readOnly = true)
    public CategoriaProductoDTO obtener(Long id) {
        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        return toDTO(c);
    }

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

    @CacheEvict(value = "categorias-productos", allEntries = true)
    public CategoriaProductoDTO actualizar(Long id, CategoriaProductoDTO dto) {
        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));
        apply(dto, c);
        return toDTO(categoriaRepository.save(c));
    }

    @CacheEvict(value = "categorias-productos", allEntries = true)
    public void eliminar(Long id) {
        CategoriaProducto c = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id: " + id));

        // ✅ VERIFICAR que no hay productos usando esta categoría
        long productosConCategoria = productoRepository.findByCategoriaId(id).size();
        if (productosConCategoria > 0) {
            throw new IllegalArgumentException(
                    "No se puede eliminar la categoría '" + c.getNombre() + "' porque tiene " + 
                    productosConCategoria + " producto(s) asociado(s). " +
                    "Elimina o reasigna los productos antes de eliminar la categoría."
            );
        }

        // Eliminar definitivamente de la BD
        categoriaRepository.deleteById(id);
        log.info("Categoría eliminada permanentemente: {} (ID: {})", c.getNombre(), c.getId());
    }

    private void apply(CategoriaProductoDTO dto, CategoriaProducto c) {
        if (dto.nombre() != null)
            c.setNombre(dto.nombre());
        c.setDescripcion(dto.descripcion());
        if (dto.activa() != null)
            c.setActiva(dto.activa());
    }

    private CategoriaProductoDTO toDTO(CategoriaProducto c) {
        return new CategoriaProductoDTO(
                c.getId(),
                c.getNombre(),
                c.getDescripcion(),
                c.getActiva());
    }
}
