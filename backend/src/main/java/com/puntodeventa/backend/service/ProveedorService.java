package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProveedorDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.Proveedor;
import com.puntodeventa.backend.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio de gestión de proveedores.
 * La baja es lógica: los ingredientes y las compras referencian al proveedor, por
 * lo que eliminar un registro rompería el historial; se desactiva en su lugar.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final InventarioMapper mapper;

    /**
     * Lista todos los proveedores, incluidos los inactivos.
     *
     * @return Lista de DTO con todos los proveedores; no se cachea si viene vacía.
     */
    @Cacheable(value = "proveedores", unless = "#result.isEmpty()")
    public List<ProveedorDTO> obtenerTodos() {
        return proveedorRepository.findAll().stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    /**
     * Lista los proveedores activos.
     *
     * @return Lista de DTO de los proveedores con {@code activo} en true.
     */
    @Cacheable(value = "proveedores", key = "'activos'")
    public List<ProveedorDTO> obtenerActivos() {
        return proveedorRepository.findByActivoTrue().stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    /**
     * Obtiene un proveedor por su identificador.
     *
     * @param id Identificador del proveedor.
     * @return DTO del proveedor encontrado.
     * @throws ResourceNotFoundException si el proveedor no existe.
     */
    @Cacheable(value = "proveedores", key = "#id")
    public ProveedorDTO obtenerPorId(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        return mapper.toProveedorDTO(proveedor);
    }

    /**
     * Busca proveedores cuyo nombre contenga el texto indicado.
     * No se cachea porque el texto de búsqueda es arbitrario y multiplicaría las claves.
     *
     * @param nombre Fragmento de nombre a localizar, sin distinción de mayúsculas.
     * @return Lista de DTO con los proveedores coincidentes.
     */
    public List<ProveedorDTO> buscarPorNombre(String nombre) {
        return proveedorRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    /**
     * Crea un proveedor.
     *
     * @param dto Datos del proveedor a crear.
     * @return DTO del proveedor creado.
     */
    @CacheEvict(value = "proveedores", allEntries = true)
    @Transactional
    public ProveedorDTO crear(ProveedorDTO dto) {
        Proveedor proveedor = mapper.toProveedor(dto);
        proveedor = proveedorRepository.save(proveedor);
        return mapper.toProveedorDTO(proveedor);
    }

    /**
     * Actualiza un proveedor existente.
     *
     * @param id  Identificador del proveedor a actualizar.
     * @param dto Datos a aplicar sobre el proveedor.
     * @return DTO del proveedor actualizado.
     * @throws ResourceNotFoundException si el proveedor no existe.
     */
    @CacheEvict(value = "proveedores", allEntries = true)
    @Transactional
    public ProveedorDTO actualizar(Long id, ProveedorDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));

        proveedor.setNombre(dto.nombre());
        proveedor.setContacto(dto.contacto());
        proveedor.setTelefono(dto.telefono());
        proveedor.setEmail(dto.email());
        proveedor.setActivo(dto.activo() != null ? dto.activo() : true);

        proveedor = proveedorRepository.save(proveedor);
        return mapper.toProveedorDTO(proveedor);
    }

    /**
     * Da de baja un proveedor marcándolo como inactivo.
     *
     * @param id Identificador del proveedor.
     * @throws ResourceNotFoundException si el proveedor no existe.
     */
    @CacheEvict(value = "proveedores", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }
}
