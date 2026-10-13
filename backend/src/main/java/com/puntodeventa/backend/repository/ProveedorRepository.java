package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para la entidad Proveedor.
 */
@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    /**
     * Recupera todos los proveedores activos.
     *
     * @return lista de proveedores con activo = true
     */
    @Query("SELECT p FROM Proveedor p WHERE p.activo = true")
    List<Proveedor> findByActivoTrue();
    
    /**
     * Busca proveedores cuyo nombre contiene el texto indicado, sin distinguir mayúsculas.
     *
     * @param nombre fragmento del nombre a buscar
     * @return lista de proveedores coincidentes
     */
    List<Proveedor> findByNombreContainingIgnoreCase(String nombre);
}
