package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.ProductoSucursalDTO;
import com.puntodeventa.backend.exception.EntityNotFoundException;
import com.puntodeventa.backend.model.SucursalProducto;
import com.puntodeventa.backend.repository.SucursalProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio para gestionar la disponibilidad de productos por sucursal.
 * 
 * Responsabilidades:
 * - Obtener productos disponibles en la sucursal actual
 * - Verificar disponibilidad de un producto en una sucursal
 * - Asignar/desasignar productos a sucursales (admin)
 * - Actualizar precios por sucursal (admin)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SucursalProductoService {

    private final SucursalProductoRepository sucursalProductoRepository;

    /**
     * Obtiene todos los productos disponibles en la sucursal actual del usuario.
     * Automáticamente usa el contexto de sucursal (SucursalContext.getSucursalId()).
     */
    @Cacheable(value = "productosSucursal", key = "#root.target.getSucursalIdFromContext()")
    public List<ProductoSucursalDTO> obtenerProductosDisponibles() {
        Long sucursalId = SucursalContext.getSucursalId();
        return obtenerProductosDisponibles(sucursalId);
    }

    /**
     * Obtiene todos los productos disponibles en una sucursal específica.
     */
    public List<ProductoSucursalDTO> obtenerProductosDisponibles(Long sucursalId) {
        return sucursalProductoRepository
            .findBySucursalIdAndDisponibleTrueOrderByOrdenVisualizacionAscNombreAsc(sucursalId)
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Obtiene todos los productos (incluyendo no disponibles) de una sucursal.
     * Solo para admin.
     */
    public List<ProductoSucursalDTO> obtenerTodosProductosSucursal(Long sucursalId) {
        return sucursalProductoRepository
            .findBySucursalIdOrderByOrdenVisualizacionAscNombreAsc(sucursalId)
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Busca productos por nombre en la sucursal actual.
     */
    public List<ProductoSucursalDTO> buscarProductos(String nombre) {
        Long sucursalId = SucursalContext.getSucursalId();
        return sucursalProductoRepository
            .buscarPorNombreEnSucursal(sucursalId, nombre)
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Verifica si un producto está disponible en la sucursal actual.
     */
    public boolean estaDisponible(Long productoId) {
        Long sucursalId = SucursalContext.getSucursalId();
        return sucursalProductoRepository.estaDisponibleEnSucursal(sucursalId, productoId);
    }

    /**
     * Obtiene la configuración de un producto en una sucursal específica.
     */
    public ProductoSucursalDTO obtenerProductoEnSucursal(Long sucursalId, Long productoId) {
        SucursalProducto sp = sucursalProductoRepository
            .findBySucursalIdAndProductoId(sucursalId, productoId)
            .orElseThrow(() -> new EntityNotFoundException(
                "Producto " + productoId + " no encontrado en sucursal " + sucursalId
            ));
        return mapToDTO(sp);
    }

    /**
     * Obtiene todos los productos de todas las sucursales (solo para admin).
     */
    public List<ProductoSucursalDTO> obtenerTodosProductosTodosSucursales() {
        return sucursalProductoRepository
            .findAllByOrderBySucursalNombreAscOrdenVisualizacionAscProductoNombreAsc()
            .stream()
            .map(this::mapToDTO)
            .toList();
    }

    /**
     * Mapea SucursalProducto a DTO.
     */
    private ProductoSucursalDTO mapToDTO(SucursalProducto sp) {
        return new ProductoSucursalDTO(
            sp.getProducto().getId(),
            sp.getProducto().getNombre(),
            sp.getProducto().getDescripcion(),
            sp.getProducto().getCategoria() != null ? sp.getProducto().getCategoria().getNombre() : null,
            sp.getProducto().getPrecio(),
            sp.getPrecioEfectivo(),
            sp.getProducto().getSku(),
            sp.getOrdenVisualizacion(),
            sp.getDisponible(),
            sp.getProducto().getProductoBase() == null,
            sp.getProducto().getProductoBase() != null ? sp.getProducto().getProductoBase().getId() : null,
            sp.getProducto().getNombreVariante(),
            sp.getHorarioDisponibilidad(),
            sp.getDiasDisponibilidad(),
            sp.getNotas()
        );
    }

    // Método helper para obtener sucursalId desde el contexto (para caché)
    public Long getSucursalIdFromContext() {
        return SucursalContext.getSucursalId();
    }
}
