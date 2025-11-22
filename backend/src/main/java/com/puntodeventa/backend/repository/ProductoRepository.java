package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Producto.
 */
@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    List<Producto> findByActivoTrue();
    
    List<Producto> findByDisponibleEnMenuTrue();
    
    List<Producto> findByCategoriaId(Long categoriaId);
    
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}
