package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProveedorDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.Proveedor;
import com.puntodeventa.backend.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
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
    
    public List<ProveedorDTO> obtenerTodos() {
        return proveedorRepository.findAll().stream()
            .map(mapper::toProveedorDTO)
            .toList();
    }
    
    public List<ProveedorDTO> obtenerActivos() {
        return proveedorRepository.findByActivoTrue().stream()
            .map(mapper::toProveedorDTO)
            .toList();
    }
    
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
    
    @Transactional
    public ProveedorDTO crear(ProveedorDTO dto) {
        Proveedor proveedor = mapper.toProveedor(dto);
        proveedor = proveedorRepository.save(proveedor);
        return mapper.toProveedorDTO(proveedor);
    }
    
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
    
    @Transactional
    public void eliminar(Long id) {
        Proveedor proveedor = proveedorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }
}
