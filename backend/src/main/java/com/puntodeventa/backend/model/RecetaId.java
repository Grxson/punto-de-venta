package com.puntodeventa.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Clase que representa la clave compuesta para la entidad Receta.
 * Esta clase se usa con @IdClass en la entidad Receta.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecetaId implements Serializable {
    private Long productoId;
    private Long ingredienteId;
}
