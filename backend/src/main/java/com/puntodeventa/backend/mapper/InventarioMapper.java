package com.puntodeventa.backend.mapper;

import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.model.*;
import org.springframework.stereotype.Component;

/**
 * Mapper para convertir entre entidades de inventario y DTOs.
 * Usa Java 21 pattern matching y records.
 */
@Component
public class InventarioMapper {
    
    // === UNIDAD ===
    public UnidadDTO toUnidadDTO(Unidad unidad) {
        if (unidad == null) return null;
        return new UnidadDTO(
            unidad.getId(),
            unidad.getNombre(),
            unidad.getAbreviatura(),
            unidad.getFactorBase(),
            unidad.getDescripcion()
        );
    }
    
    public Unidad toUnidad(UnidadDTO dto) {
        if (dto == null) return null;
        return Unidad.builder()
            .id(dto.id())
            .nombre(dto.nombre())
            .abreviatura(dto.abreviatura())
            .factorBase(dto.factorBase())
            .descripcion(dto.descripcion())
            .build();
    }
    
    // === PROVEEDOR ===
    public ProveedorDTO toProveedorDTO(Proveedor proveedor) {
        if (proveedor == null) return null;
        return new ProveedorDTO(
            proveedor.getId(),
            proveedor.getNombre(),
            proveedor.getContacto(),
            proveedor.getTelefono(),
            proveedor.getEmail(),
            proveedor.getActivo()
        );
    }
    
    public Proveedor toProveedor(ProveedorDTO dto) {
        if (dto == null) return null;
        return Proveedor.builder()
            .id(dto.id())
            .nombre(dto.nombre())
            .contacto(dto.contacto())
            .telefono(dto.telefono())
            .email(dto.email())
            .activo(dto.activo() != null ? dto.activo() : true)
            .build();
    }
    
    // === INGREDIENTE ===
    public IngredienteDTO toIngredienteDTO(Ingrediente ingrediente) {
        if (ingrediente == null) return null;
        return new IngredienteDTO(
            ingrediente.getId(),
            ingrediente.getNombre(),
            ingrediente.getCategoria(),
            ingrediente.getUnidadBase() != null ? ingrediente.getUnidadBase().getId() : null,
            ingrediente.getUnidadBase() != null ? ingrediente.getUnidadBase().getNombre() : null,
            ingrediente.getUnidadBase() != null ? ingrediente.getUnidadBase().getAbreviatura() : null,
            ingrediente.getCostoUnitarioBase(),
            ingrediente.getStockMinimo(),
            ingrediente.getProveedor() != null ? ingrediente.getProveedor().getId() : null,
            ingrediente.getProveedor() != null ? ingrediente.getProveedor().getNombre() : null,
            ingrediente.getSku(),
            ingrediente.getActivo()
        );
    }
    
    // === RECETA ===
    public RecetaDTO toRecetaDTO(Receta receta) {
        if (receta == null) return null;
        return new RecetaDTO(
            receta.getProductoId(),
            receta.getProducto() != null ? receta.getProducto().getNombre() : null,
            receta.getIngredienteId(),
            receta.getIngrediente() != null ? receta.getIngrediente().getNombre() : null,
            receta.getCantidad(),
            receta.getUnidad() != null ? receta.getUnidad().getId() : null,
            receta.getUnidad() != null ? receta.getUnidad().getNombre() : null,
            receta.getUnidad() != null ? receta.getUnidad().getAbreviatura() : null,
            receta.getMermaTeorica()
        );
    }
    
    // === INVENTARIO MOVIMIENTO ===
    public InventarioMovimientoDTO toInventarioMovimientoDTO(InventarioMovimiento movimiento) {
        if (movimiento == null) return null;
        return new InventarioMovimientoDTO(
            movimiento.getId(),
            movimiento.getIngrediente() != null ? movimiento.getIngrediente().getId() : null,
            movimiento.getIngrediente() != null ? movimiento.getIngrediente().getNombre() : null,
            movimiento.getTipo(),
            movimiento.getCantidad(),
            movimiento.getUnidad() != null ? movimiento.getUnidad().getId() : null,
            movimiento.getUnidad() != null ? movimiento.getUnidad().getNombre() : null,
            movimiento.getUnidad() != null ? movimiento.getUnidad().getAbreviatura() : null,
            movimiento.getCostoUnitario(),
            movimiento.getCostoTotal(),
            movimiento.getFecha(),
            movimiento.getRefTipo(),
            movimiento.getRefId(),
            movimiento.getLote(),
            movimiento.getCaducidad(),
            movimiento.getNota()
        );
    }
    
    // === MERMA ===
    public MermaDTO toMermaDTO(Merma merma) {
        if (merma == null) return null;
        return new MermaDTO(
            merma.getId(),
            merma.getIngrediente() != null ? merma.getIngrediente().getId() : null,
            merma.getIngrediente() != null ? merma.getIngrediente().getNombre() : null,
            merma.getCantidad(),
            merma.getUnidad() != null ? merma.getUnidad().getId() : null,
            merma.getUnidad() != null ? merma.getUnidad().getNombre() : null,
            merma.getUnidad() != null ? merma.getUnidad().getAbreviatura() : null,
            merma.getMotivo(),
            merma.getFecha(),
            merma.getResponsable() != null ? merma.getResponsable().getId() : null,
            merma.getResponsable() != null ? merma.getResponsable().getNombre() : null,
            merma.getCostoUnitario(),
            merma.getCostoTotal()
        );
    }
}
