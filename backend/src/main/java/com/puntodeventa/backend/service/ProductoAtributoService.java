package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoAtributoDTO;
import com.puntodeventa.backend.dto.ProductoAtributoOpcionDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoAtributo;
import com.puntodeventa.backend.model.ProductoAtributoOpcion;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.ProductoAtributoOpcionRepository;
import com.puntodeventa.backend.repository.ProductoAtributoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar atributos y opciones de productos.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoAtributoService {
    
    private final ProductoAtributoRepository atributoRepository;
    private final ProductoAtributoOpcionRepository opcionRepository;
    private final ProductoRepository productoRepository;
    
    // ============================================================
    // Métodos para Atributos
    // ============================================================
    
    /**
     * Obtiene todos los atributos activos de un producto.
     *
     * @param productoId Identificador del producto.
     * @return Lista de DTO de los atributos activos.
     * @throws EntityNotFoundException si el producto no existe.
     */
    @Transactional(readOnly = true)
    public List<ProductoAtributoDTO> obtenerAtributosActivos(Long productoId) {
        verificarProductoExiste(productoId);
        return atributoRepository.findByProductoIdActivos(productoId)
            .stream()
            .map(this::atributoToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene todos los atributos de un producto, incluidos los inactivos.
     *
     * @param productoId Identificador del producto.
     * @return Lista de DTO con todos los atributos del producto.
     * @throws EntityNotFoundException si el producto no existe.
     */
    @Transactional(readOnly = true)
    public List<ProductoAtributoDTO> obtenerTodosAtributos(Long productoId) {
        verificarProductoExiste(productoId);
        return atributoRepository.findByProductoId(productoId)
            .stream()
            .map(this::atributoToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene un atributo por su identificador.
     *
     * @param atributoId Identificador del atributo.
     * @return DTO del atributo encontrado.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    @Transactional(readOnly = true)
    public ProductoAtributoDTO obtenerAtributoPorId(Long atributoId) {
        return atributoRepository.findById(atributoId)
            .map(this::atributoToDTO)
            .orElseThrow(() -> new EntityNotFoundException("Atributo no encontrado: " + atributoId));
    }
    
    /**
     * Crea un atributo para un producto y, si el DTO trae opciones, las persiste en
     * el mismo alta.
     *
     * @param productoId Identificador del producto.
     * @param dto        Datos del atributo, con sus opciones opcionales.
     * @return DTO del atributo creado.
     * @throws EntityNotFoundException si el producto no existe.
     */
    public ProductoAtributoDTO crearAtributo(Long productoId, ProductoAtributoDTO dto) {
        Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + productoId));
        
        ProductoAtributo atributo = ProductoAtributo.builder()
            .producto(producto)
            .nombre(dto.getNombre())
            .tipo(ProductoAtributo.TipoAtributo.valueOf(dto.getTipo()))
            .requerido(dto.getRequerido() != null ? dto.getRequerido() : false)
            .orden(dto.getOrden() != null ? dto.getOrden() : 0)
            .activo(true)
            .createdAt(LocalDateTime.now())
            .build();
        
        ProductoAtributo saved = atributoRepository.save(atributo);
        
        // Crear las opciones si existen
        if (dto.getOpciones() != null && !dto.getOpciones().isEmpty()) {
            for (ProductoAtributoOpcionDTO opcionDTO : dto.getOpciones()) {
                ProductoAtributoOpcion opcion = ProductoAtributoOpcion.builder()
                    .atributo(saved)
                    .nombre(opcionDTO.nombre())
                    .precioExtra(opcionDTO.precioExtra() != null ? opcionDTO.precioExtra() : BigDecimal.ZERO)
                    .orden(opcionDTO.orden() != null ? opcionDTO.orden() : 0)
                    .activo(true)
                    .createdAt(LocalDateTime.now())
                    .build();
                opcionRepository.save(opcion);
            }
        }
        
        return atributoToDTO(saved);
    }
    
    /**
     * Actualiza un atributo existente.
     *
     * @param atributoId Identificador del atributo a actualizar.
     * @param dto        Datos a aplicar sobre el atributo.
     * @return DTO del atributo actualizado.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    public ProductoAtributoDTO actualizarAtributo(Long atributoId, ProductoAtributoDTO dto) {
        ProductoAtributo atributo = atributoRepository.findById(atributoId)
            .orElseThrow(() -> new EntityNotFoundException("Atributo no encontrado: " + atributoId));
        
        atributo.setNombre(dto.getNombre());
        atributo.setTipo(ProductoAtributo.TipoAtributo.valueOf(dto.getTipo()));
        atributo.setRequerido(dto.getRequerido() != null ? dto.getRequerido() : false);
        atributo.setOrden(dto.getOrden() != null ? dto.getOrden() : 0);
        atributo.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        atributo.setUpdatedAt(LocalDateTime.now());
        
        ProductoAtributo updated = atributoRepository.save(atributo);
        return atributoToDTO(updated);
    }
    
    /**
     * Desactiva un atributo sin borrar la fila.
     *
     * @param atributoId Identificador del atributo a desactivar.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    public void desactivarAtributo(Long atributoId) {
        ProductoAtributo atributo = atributoRepository.findById(atributoId)
            .orElseThrow(() -> new EntityNotFoundException("Atributo no encontrado: " + atributoId));
        
        atributo.setActivo(false);
        atributo.setUpdatedAt(LocalDateTime.now());
        atributoRepository.save(atributo);
    }
    
    /**
     * Elimina un atributo de forma física.
     *
     * @param atributoId Identificador del atributo a eliminar.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    public void eliminarAtributo(Long atributoId) {
        if (!atributoRepository.existsById(atributoId)) {
            throw new EntityNotFoundException("Atributo no encontrado: " + atributoId);
        }
        atributoRepository.deleteById(atributoId);
    }
    
    // ============================================================
    // Métodos para Opciones
    // ============================================================
    
    /**
     * Obtiene todas las opciones activas de un atributo.
     *
     * @param atributoId Identificador del atributo.
     * @return Lista de DTO de las opciones activas.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    @Transactional(readOnly = true)
    public List<ProductoAtributoOpcionDTO> obtenerOpcionesActivas(Long atributoId) {
        verificarAtributoExiste(atributoId);
        return opcionRepository.findByAtributoIdActivas(atributoId)
            .stream()
            .map(this::opcionToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene todas las opciones de un atributo, incluidas las inactivas.
     *
     * @param atributoId Identificador del atributo.
     * @return Lista de DTO con todas las opciones del atributo.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    @Transactional(readOnly = true)
    public List<ProductoAtributoOpcionDTO> obtenerTodasOpciones(Long atributoId) {
        verificarAtributoExiste(atributoId);
        return opcionRepository.findByAtributoId(atributoId)
            .stream()
            .map(this::opcionToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Obtiene una opción por su identificador.
     *
     * @param opcionId Identificador de la opción.
     * @return DTO de la opción encontrada.
     * @throws EntityNotFoundException si la opción no existe.
     */
    @Transactional(readOnly = true)
    public ProductoAtributoOpcionDTO obtenerOpcionPorId(Long opcionId) {
        return opcionRepository.findById(opcionId)
            .map(this::opcionToDTO)
            .orElseThrow(() -> new EntityNotFoundException("Opción no encontrada: " + opcionId));
    }
    
    /**
     * Crea una opción para un atributo.
     *
     * @param atributoId Identificador del atributo.
     * @param dto        Datos de la opción a crear.
     * @return DTO de la opción creada.
     * @throws EntityNotFoundException si el atributo no existe.
     */
    public ProductoAtributoOpcionDTO crearOpcion(Long atributoId, ProductoAtributoOpcionDTO dto) {
        ProductoAtributo atributo = atributoRepository.findById(atributoId)
            .orElseThrow(() -> new EntityNotFoundException("Atributo no encontrado: " + atributoId));
        
        ProductoAtributoOpcion opcion = ProductoAtributoOpcion.builder()
            .atributo(atributo)
            .nombre(dto.nombre())
            .precioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO)
            .orden(dto.orden() != null ? dto.orden() : 0)
            .activo(true)
            .createdAt(LocalDateTime.now())
            .build();
        
        ProductoAtributoOpcion saved = opcionRepository.save(opcion);
        return opcionToDTO(saved);
    }
    
    /**
     * Actualiza una opción existente.
     *
     * @param opcionId Identificador de la opción a actualizar.
     * @param dto      Datos a aplicar sobre la opción.
     * @return DTO de la opción actualizada.
     * @throws EntityNotFoundException si la opción no existe.
     */
    public ProductoAtributoOpcionDTO actualizarOpcion(Long opcionId, ProductoAtributoOpcionDTO dto) {
        ProductoAtributoOpcion opcion = opcionRepository.findById(opcionId)
            .orElseThrow(() -> new EntityNotFoundException("Opción no encontrada: " + opcionId));
        
        opcion.setNombre(dto.nombre());
        opcion.setPrecioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO);
        opcion.setOrden(dto.orden() != null ? dto.orden() : 0);
        opcion.setActivo(dto.activo() != null ? dto.activo() : true);
        opcion.setUpdatedAt(LocalDateTime.now());
        
        ProductoAtributoOpcion updated = opcionRepository.save(opcion);
        return opcionToDTO(updated);
    }
    
    /**
     * Desactiva una opción sin borrar la fila.
     *
     * @param opcionId Identificador de la opción a desactivar.
     * @throws EntityNotFoundException si la opción no existe.
     */
    public void desactivarOpcion(Long opcionId) {
        ProductoAtributoOpcion opcion = opcionRepository.findById(opcionId)
            .orElseThrow(() -> new EntityNotFoundException("Opción no encontrada: " + opcionId));
        
        opcion.setActivo(false);
        opcion.setUpdatedAt(LocalDateTime.now());
        opcionRepository.save(opcion);
    }
    
    /**
     * Elimina una opción de forma física.
     *
     * @param opcionId Identificador de la opción a eliminar.
     * @throws EntityNotFoundException si la opción no existe.
     */
    public void eliminarOpcion(Long opcionId) {
        if (!opcionRepository.existsById(opcionId)) {
            throw new EntityNotFoundException("Opción no encontrada: " + opcionId);
        }
        opcionRepository.deleteById(opcionId);
    }
    
    // ============================================================
    // Métodos privados
    // ============================================================
    
    private void verificarProductoExiste(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new EntityNotFoundException("Producto no encontrado: " + productoId);
        }
    }
    
    private void verificarAtributoExiste(Long atributoId) {
        if (!atributoRepository.existsById(atributoId)) {
            throw new EntityNotFoundException("Atributo no encontrado: " + atributoId);
        }
    }
    
    private ProductoAtributoDTO atributoToDTO(ProductoAtributo atributo) {
        return new ProductoAtributoDTO(
            atributo.getId(),
            atributo.getProducto().getId(),
            atributo.getNombre(),
            atributo.getTipo().toString(),
            atributo.getRequerido(),
            atributo.getOrden(),
            atributo.getActivo(),
            atributo.getOpciones() != null
                ? atributo.getOpciones().stream().map(this::opcionToDTO).collect(Collectors.toList())
                : null
        );
    }
    
    private ProductoAtributoOpcionDTO opcionToDTO(ProductoAtributoOpcion opcion) {
        return new ProductoAtributoOpcionDTO(
            opcion.getId(),
            opcion.getAtributo().getId(),
            opcion.getNombre(),
            opcion.getPrecioExtra(),
            opcion.getOrden(),
            opcion.getActivo()
        );
    }
}
