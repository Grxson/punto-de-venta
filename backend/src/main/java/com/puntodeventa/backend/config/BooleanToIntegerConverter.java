package com.puntodeventa.backend.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**         
 * Convertidor JPA para mapear Boolean (Java) a Integer (PostgreSQL).
 * 
 * Este converter es necesario porque PostgreSQL no soporta conversión automática
 * entre INTEGER y BOOLEAN. Hibernate intentaría usar BOOLEAN por defecto para
 * campos Boolean, pero nuestras columnas son INTEGER (1/0).
 * 
 * @author Grxson
 * @version 1.0.0
 * @since Java 21
 */
@Converter(autoApply = true)
public class BooleanToIntegerConverter implements AttributeConverter<Boolean, Integer> {

    @Override
    public Integer convertToDatabaseColumn(Boolean attribute) {
        if (attribute == null) {
            return 0;
        }
        return attribute ? 1 : 0;
    }

    @Override
    public Boolean convertToEntityAttribute(Integer dbData) {
        if (dbData == null) {
            return false;
        }
        return dbData != 0;
    }
}
