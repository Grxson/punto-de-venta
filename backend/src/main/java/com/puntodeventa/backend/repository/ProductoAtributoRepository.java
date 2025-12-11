package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoAtributo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad ProductoAtributo
 */
@Repository
public interface ProductoAtributoRepository extends JpaRepository<ProductoAtributo, Long> {
    
    /**
     * Encuentra todos los atributos activos de un producto
     * ✅ ARREGLO: Usar IS TRUE para PostgreSQL compatibility
     */
    @Query("SELECT pa FROM ProductoAtributo pa WHERE pa.producto.id = :productoId AND pa.activo IS TRUE ORDER BY pa.orden ASC")
    List<ProductoAtributo> findByProductoIdActivos(@Param("productoId") Long productoId);
    
    /**
     * Encuentra todos los atributos de un producto (incluyendo inactivos)
     */
    @Query("SELECT pa FROM ProductoAtributo pa WHERE pa.producto.id = :productoId ORDER BY pa.orden ASC")
    List<ProductoAtributo> findByProductoId(@Param("productoId") Long productoId);
    
    /**
     * Busca atributos por nombre
     * ✅ ARREGLO: Usar IS TRUE para PostgreSQL compatibility
     */
    @Query("SELECT pa FROM ProductoAtributo pa WHERE pa.producto.id = :productoId AND LOWER(pa.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) AND pa.activo IS TRUE")
    List<ProductoAtributo> buscarPorNombre(@Param("productoId") Long productoId, @Param("nombre") String nombre);
}
