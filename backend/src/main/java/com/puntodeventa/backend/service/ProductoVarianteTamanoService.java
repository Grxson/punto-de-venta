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
 * Un tamaño es una presentación del producto (por ejemplo grande o Chico) que
 * puede llevar un recargo sobre el precio base; la relación guarda además el
 * orden en que se ofrecen.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoVarianteTamanoService {

    private final ProductoVarianteTamanoRepository varianteTamanoRepository;
    private final ProductoRepository productoRepository;
    private final ProductoTamanoRepository tamanoRepository;

    /**
     * Obtiene todos los tamaños de una variante/producto.
     *
     * @param productoId Identificador del producto o variante.
     * @return Lista de DTO con los tamaños asignados.
     * @throws EntityNotFoundException si el producto no existe.
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
     * Obtiene una relación producto-tamaño por su identificador.
     *
     * @param id Identificador de la relación.
     * @return DTO de la relación encontrada.
     * @throws EntityNotFoundException si la relación no existe.
     */
    @Transactional(readOnly = true)
    public ProductoVarianteTamanoDTO obtenerPorId(Long id) {
        return varianteTamanoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));
    }

    /**
     * Verifica si un producto tiene un tamaño específico.
     *
     * @param productoId Identificador del producto o variante.
     * @param tamanoId   Identificador del tamaño.
     * @return {@code true} si el tamaño está asignado al producto.
     */
    @Transactional(readOnly = true)
    public boolean existeTamanoEnProducto(Long productoId, Long tamanoId) {
        return varianteTamanoRepository.findByProductoIdAndTamanoId(productoId, tamanoId).isPresent();
    }

    /**
     * Agrega un tamaño a un producto/variante.
     *
     * @param productoId Identificador del producto o variante.
     * @param tamanoId   Identificador del tamaño a asignar.
     * @param orden      Posición en el menú; si es {@code null} se toma cero.
     * @return DTO de la relación creada.
     * @throws EntityNotFoundException si el producto o el tamaño no existen.
     * @throws IllegalArgumentException si el tamaño ya está asignado al producto.
     */
    public ProductoVarianteTamanoDTO agregarTamano(Long productoId, Long tamanoId, Integer orden) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + productoId));

        ProductoTamano tamano = tamanoRepository.findById(tamanoId)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + tamanoId));

        // Verificar que no exista ya
        if (varianteTamanoRepository.findByProductoIdAndTamanoId(productoId, tamanoId).isPresent()) {
            throw new IllegalArgumentException("Este producto ya tiene este tamaño asignado");
        }

        ProductoVarianteTamano varianteTamano = ProductoVarianteTamano.builder()
                .producto(producto)
                .tamano(tamano)
                .orden(orden != null ? orden : 0)
                .build();

        ProductoVarianteTamano saved = varianteTamanoRepository.save(varianteTamano);
        return toDTO(saved);
    }

    /**
     * Actualiza el orden de un tamaño en un producto.
     *
     * @param id          Identificador de la relación a actualizar.
     * @param nuevoOrden  Nueva posición en el menú; si es {@code null} se toma cero.
     * @return DTO de la relación actualizada.
     * @throws EntityNotFoundException si la relación no existe.
     */
    public ProductoVarianteTamanoDTO actualizarOrden(Long id, Integer nuevoOrden) {
        ProductoVarianteTamano varianteTamano = varianteTamanoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id));

        varianteTamano.setOrden(nuevoOrden != null ? nuevoOrden : 0);
        ProductoVarianteTamano updated = varianteTamanoRepository.save(varianteTamano);
        return toDTO(updated);
    }

    /**
     * Elimina un tamaño de un producto.
     *
     * @param id Identificador de la relación a eliminar.
     * @throws EntityNotFoundException si la relación no existe.
     */
    public void eliminarTamano(Long id) {
        if (!varianteTamanoRepository.existsById(id)) {
            throw new EntityNotFoundException("Relación producto-tamaño no encontrada: " + id);
        }
        varianteTamanoRepository.deleteById(id);
    }

    /**
     * Elimina todos los tamaños de un producto.
     * ⚠️ Elimina en cascada todas las relaciones: úsese solo al rehacer la
     * composición de tamaños del producto.
     *
     * @param productoId Identificador del producto o variante.
     */
    public void eliminarTodosPorProducto(Long productoId) {
        List<ProductoVarianteTamano> tamanosProducto = varianteTamanoRepository.findByProductoId(productoId);
        varianteTamanoRepository.deleteAll(tamanosProducto);
    }

    /**
     * Obtiene todos los productos que usan un tamaño específico.
     *
     * @param tamanoId Identificador del tamaño.
     * @return Lista de DTO con las relaciones que usan ese tamaño.
     * @throws EntityNotFoundException si el tamaño no existe.
     */
    @Transactional(readOnly = true)
    public List<ProductoVarianteTamanoDTO> obtenerProductosPorTamano(Long tamanoId) {
        verificarTamanoExiste(tamanoId);
        return varianteTamanoRepository.findByTamanoId(tamanoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convierte una entidad a DTO.
     * El recargo del tamaño se proyecta porque el cliente lo necesita para calcular
     * el precio final sin consultar el tamaño por separado.
     *
     * @param varianteTamano Relación producto-tamaño a proyectar.
     * @return DTO con el producto, el tamaño y su recargo.
     */
    private ProductoVarianteTamanoDTO toDTO(ProductoVarianteTamano varianteTamano) {
        return new ProductoVarianteTamanoDTO(
                varianteTamano.getId(),
                varianteTamano.getProducto().getId(),
                varianteTamano.getProducto().getNombre(),
                varianteTamano.getTamano().getId(),
                varianteTamano.getTamano().getNombre(),
                varianteTamano.getTamano().getPrecioExtra(),
                varianteTamano.getOrden());
    }

    /**
     * Valida que exista el producto antes de operar sobre sus tamaños.
     *
     * @param productoId Identificador del producto o variante.
     * @throws EntityNotFoundException si el producto no existe.
     */
    private void verificarProductoExiste(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new EntityNotFoundException("Producto no encontrado: " + productoId);
        }
    }

    /**
     * Valida que exista el tamaño antes de buscar los productos que lo usan.
     *
     * @param tamanoId Identificador del tamaño.
     * @throws EntityNotFoundException si el tamaño no existe.
     */
    private void verificarTamanoExiste(Long tamanoId) {
        if (!tamanoRepository.existsById(tamanoId)) {
            throw new EntityNotFoundException("Tamano no encontrado: " + tamanoId);
        }
    }
}
