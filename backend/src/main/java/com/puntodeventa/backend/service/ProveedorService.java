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
 * Servicio para gestión de proveedores.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final InventarioMapper mapper;

    @Cacheable(value = "proveedores", unless = "#result.isEmpty()")
    public List<ProveedorDTO> obtenerTodos() {
        return proveedorRepository.findAll().stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    @Cacheable(value = "proveedores", key = "'activos'")
    public List<ProveedorDTO> obtenerActivos() {
        return proveedorRepository.findByActivoTrue().stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    @Cacheable(value = "proveedores", key = "#id")
    public ProveedorDTO obtenerPorId(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        return mapper.toProveedorDTO(proveedor);
    }

    public List<ProveedorDTO> buscarPorNombre(String nombre) {
        return proveedorRepository.findByNombreContainingIgnoreCase(nombre).stream()
                .map(mapper::toProveedorDTO)
                .toList();
    }

    @CacheEvict(value = "proveedores", allEntries = true)
    @Transactional
    public ProveedorDTO crear(ProveedorDTO dto) {
        Proveedor proveedor = mapper.toProveedor(dto);
        proveedor = proveedorRepository.save(proveedor);
        return mapper.toProveedorDTO(proveedor);
    }

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

    @CacheEvict(value = "proveedores", allEntries = true)
    @Transactional
    public void eliminar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }
}
