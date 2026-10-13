package com.puntodeventa.backend.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Convertidor JPA que mapea Boolean (Java) a Integer (PostgreSQL).
 *
 * Es necesario porque PostgreSQL no convierte de forma automática entre INTEGER
 * y BOOLEAN: Hibernate usaría BOOLEAN por defecto para los campos Boolean,
 * mientras que las columnas de este esquema son INTEGER (1/0).
 *
 * @since Java 21
 */
@Converter(autoApply = false)
public class BooleanToIntegerConverter implements AttributeConverter<Boolean, Integer> {

    /**
     * Convierte el valor booleano a su representación en base de datos.
     *
     * @param attribute valor booleano de la entidad
     * @return 1 o 0; los valores nulos se guardan como 0
     */
    @Override
    public Integer convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) {
            return 0;
        }
        return attribute ? 1 : 0;
    }

    /**
     * Convierte la columna de la base de datos a su valor booleano.
     *
     * @param dbData valor de la columna
     * @return {@code true} si la columna no es cero; los nulos se interpretan como falso
     */
    @Override
    public Boolean convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return false;
        }
        return dbData != 0;
    }
}
