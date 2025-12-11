package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO para ProductoAtributo
 * Representa un atributo de un producto (Ingrediente, Salsa, Complemento, etc.)
 */
public class ProductoAtributoDTO {
    private Long id;
    private Long productoId;
    private String nombre;
    private String tipo;  // SIMPLE o MULTIPLE
    private Boolean requerido;
    private Integer orden;
    private Boolean activo;
    private List<ProductoAtributoOpcionDTO> opciones;

    @JsonCreator
    public ProductoAtributoDTO(
        @JsonProperty("id") Long id,
        @JsonProperty("productoId") Long productoId,
        @JsonProperty("nombre") String nombre,
        @JsonProperty("tipo") String tipo,
        @JsonProperty("requerido") Boolean requerido,
        @JsonProperty("orden") Integer orden,
        @JsonProperty("activo") Boolean activo,
        @JsonProperty("opciones") List<ProductoAtributoOpcionDTO> opciones
    ) {
        // Validación: nombre no puede ser nulo o vacío
        if (nombre == null || nombre.isBlank()) {
            throw new IllegalArgumentException("El nombre del atributo es obligatorio");
        }
        
        // Normalizar tipo - si está vacío o nulo, usar SIMPLE
        if (tipo == null || tipo.isBlank()) {
            tipo = "SIMPLE";
        }
        
        // Validación: tipo debe ser SIMPLE o MULTIPLE
        if (!tipo.equals("SIMPLE") && !tipo.equals("MULTIPLE")) {
            throw new IllegalArgumentException("El tipo debe ser SIMPLE o MULTIPLE");
        }
        
        this.id = id;
        this.productoId = productoId;
        this.nombre = nombre;
        this.tipo = tipo;
        this.requerido = requerido != null ? requerido : false;
        this.orden = orden;
        this.activo = activo != null ? activo : true;
        this.opciones = opciones;
    }

    // Getters
    public Long id() { return id; }
    public Long productoId() { return productoId; }
    public String nombre() { return nombre; }
    public String tipo() { return tipo; }
    public Boolean requerido() { return requerido; }
    public Integer orden() { return orden; }
    public Boolean activo() { return activo; }
    public List<ProductoAtributoOpcionDTO> opciones() { return opciones; }
}
