package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoTamanoDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.ProductoTamano;
import com.puntodeventa.backend.repository.ProductoTamanoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar tamaños de productos.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoTamanoService {

    private final ProductoTamanoRepository tamanoRepository;

    /**
     * Obtiene todos los tamaños activos.
     *
     * @return Lista de DTO de los tamaños activos.
     */
    @Transactional(readOnly = true)
    public List<ProductoTamanoDTO> obtenerTodosActivos() {
        return tamanoRepository.findAllActivos()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un tamaño por su identificador.
     *
     * @param id Identificador del tamaño.
     * @return DTO del tamaño encontrado.
     * @throws EntityNotFoundException si el tamaño no existe.
     */
    @Transactional(readOnly = true)
    public ProductoTamanoDTO obtenerPorId(Long id) {
        return tamanoRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));
    }

    /**
     * Obtiene un tamaño por su nombre, sin distinción de mayúsculas.
     *
     * @param nombre Nombre del tamaño.
     * @return DTO del tamaño encontrado.
     * @throws EntityNotFoundException si no existe un tamaño con ese nombre.
     */
    @Transactional(readOnly = true)
    public ProductoTamanoDTO obtenerPorNombre(String nombre) {
        return tamanoRepository.findByNombreIgnoreCase(nombre)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + nombre));
    }

    /**
     * Busca tamaños cuyo nombre coincida con el texto indicado.
     *
     * @param nombre Fragmento de nombre a localizar.
     * @return Lista de DTO con los tamaños coincidentes.
     */
    @Transactional(readOnly = true)
    public List<ProductoTamanoDTO> buscar(String nombre) {
        return tamanoRepository.buscarPorNombre(nombre)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crea un tamaño.
     * El precio extra y el orden toman cero si no se envían, y nace activo.
     *
     * @param dto Datos del tamaño a crear.
     * @return DTO del tamaño creado.
     * @throws IllegalArgumentException si ya existe un tamaño con el mismo nombre.
     */
    public ProductoTamanoDTO crear(ProductoTamanoDTO dto) {
        // Verificar que no existe un tamaño con el mismo nombre
        if (tamanoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
        }

        ProductoTamano tamano = ProductoTamano.builder()
                .nombre(dto.nombre())
                .descripcion(dto.descripcion())
                .precioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO)
                .orden(dto.orden() != null ? dto.orden() : 0)
                .activo(true)
                .createdAt(LocalDateTime.now())
                .build();

        ProductoTamano saved = tamanoRepository.save(tamano);
        return toDTO(saved);
    }

    /**
     * Actualiza un tamaño existente.
     * El nombre duplicado solo se comprueba cuando cambia, para no chocar consigo
     * mismo.
     *
     * @param id  Identificador del tamaño a actualizar.
     * @param dto Datos a aplicar sobre el tamaño.
     * @return DTO del tamaño actualizado.
     * @throws EntityNotFoundException   si el tamaño no existe.
     * @throws IllegalArgumentException  si ya existe otro tamaño con el nuevo nombre.
     */
    public ProductoTamanoDTO actualizar(Long id, ProductoTamanoDTO dto) {
        ProductoTamano tamano = tamanoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));

        // Verificar que no existe otro tamaño con el mismo nombre
        if (!tamano.getNombre().equalsIgnoreCase(dto.nombre())) {
            if (tamanoRepository.findByNombreIgnoreCase(dto.nombre()).isPresent()) {
                throw new IllegalArgumentException("Ya existe un tamaño con el nombre: " + dto.nombre());
            }
        }

        tamano.setNombre(dto.nombre());
        tamano.setDescripcion(dto.descripcion());
        tamano.setPrecioExtra(dto.precioExtra() != null ? dto.precioExtra() : BigDecimal.ZERO);
        tamano.setOrden(dto.orden() != null ? dto.orden() : 0);
        tamano.setActivo(dto.activo() != null ? dto.activo() : true);
        tamano.setUpdatedAt(LocalDateTime.now());

        ProductoTamano updated = tamanoRepository.save(tamano);
        return toDTO(updated);
    }

    /**
     * Desactiva un tamaño sin borrar la fila.
     *
     * @param id Identificador del tamaño a desactivar.
     * @throws EntityNotFoundException si el tamaño no existe.
     */
    public void desactivar(Long id) {
        ProductoTamano tamano = tamanoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tamano no encontrado: " + id));

        tamano.setActivo(false);
        tamano.setUpdatedAt(LocalDateTime.now());
        tamanoRepository.save(tamano);
    }

    /**
     * Elimina un tamaño de forma física.
     *
     * @param id Identificador del tamaño a eliminar.
     * @throws EntityNotFoundException si el tamaño no existe.
     */
    public void eliminar(Long id) {
        if (!tamanoRepository.existsById(id)) {
            throw new EntityNotFoundException("Tamano no encontrado: " + id);
        }
        tamanoRepository.deleteById(id);
    }

    // Convierte una entidad en su DTO de salida.
    private ProductoTamanoDTO toDTO(ProductoTamano tamano) {
        return new ProductoTamanoDTO(
                tamano.getId(),
                tamano.getNombre(),
                tamano.getDescripcion(),
                tamano.getPrecioExtra(),
                tamano.getOrden(),
                tamano.getActivo());
    }
}
