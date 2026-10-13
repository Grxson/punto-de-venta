package com.puntodeventa.backend.mapper;

import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.model.*;
import org.springframework.stereotype.Component;

/**
 * Convierte entre las entidades del inventario y sus DTOs de salida.
 * Usa pattern matching de Java 21 y records, por lo que el mapeo es un
 * constructor explícito en lugar de un motor de reflexión.
 * <p>
 * Las asociaciones no cargadas se proyectan como {@code null} en lugar de
 * disparar una consulta diferida: los DTOs se arman para respuestas de lectura,
 * no para rehidratar entidades.
 */
@Component
public class InventarioMapper {

    // === UNIDAD ===

    /**
     * Proyecta una unidad de medida a su DTO.
     *
     * @param unidad Entidad de unidad, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
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

    /**
     * Reconstruye la entidad de unidad desde su DTO.
     *
     * @param dto DTO de origen, puede ser {@code null}.
     * @return Entidad de unidad, o {@code null} si el DTO es {@code null}.
     */
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

    /**
     * Proyecta un proveedor a su DTO.
     *
     * @param proveedor Entidad de proveedor, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
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

    /**
     * Reconstruye la entidad de proveedor desde su DTO.
     * Un DTO sin el campo {@code activo} se asume activo: los registros dados de
     * alta deben operar salvo baja explícita.
     *
     * @param dto DTO de origen, puede ser {@code null}.
     * @return Entidad de proveedor, o {@code null} si el DTO es {@code null}.
     */
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

    /**
     * Proyecta un ingrediente a su DTO, incluyendo los datos desnormalizados de
     * gasto, conversión de unidades y costo unitario en unidad base.
     *
     * @param ingrediente Entidad de ingrediente, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
    public IngredienteDTO toIngredienteDTO(Ingrediente ingrediente) {
        if (ingrediente == null) return null;
        return new IngredienteDTO(
            ingrediente.getId(),
            ingrediente.getNombre(),
            ingrediente.getDescripcion(),
            ingrediente.getCategoria(),
            // VINCULACIÓN A GASTO
            ingrediente.getGasto() != null ? ingrediente.getGasto().getId() : null,
            ingrediente.getCostoTotalGasto(),
            // CONVERSIÓN DE UNIDADES
            ingrediente.getUnidadGasto() != null ? ingrediente.getUnidadGasto().getId() : null,
            ingrediente.getUnidadGasto() != null ? ingrediente.getUnidadGasto().getNombre() : null,
            ingrediente.getUnidadGasto() != null ? ingrediente.getUnidadGasto().getAbreviatura() : null,
            ingrediente.getFactorConversion(),
            // RESULTADO FINAL
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

    /**
     * Proyecta un ingrediente de receta a su DTO.
     *
     * @param receta Entidad de receta, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
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

    /**
     * Proyecta un movimiento de inventario a su DTO.
     *
     * @param movimiento Entidad de movimiento, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
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

    /**
     * Proyecta una merma a su DTO.
     *
     * @param merma Entidad de merma, puede ser {@code null}.
     * @return DTO equivalente, o {@code null} si la entidad es {@code null}.
     */
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