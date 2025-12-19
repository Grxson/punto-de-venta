package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Compra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para Compra - Queries optimizadas y segregadas por sucursal.
 */
@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    /**
     * Obtener compras de una sucursal con paginación.
     * ✅ Segregación: Solo datos de la sucursal especificada
     */
    @Query("""
                SELECT c FROM Compra c
                WHERE c.sucursal.id = :sucursalId
                ORDER BY c.fecha DESC
            """)
    Page<Compra> findBySucursalId(
            @Param("sucursalId") Long sucursalId,
            Pageable pageable);

    /**
     * Obtener compras por rango de fechas y estado.
     * ✅ Optimizado con índices en BD
     */
    @Query("""
                SELECT c FROM Compra c
                WHERE c.sucursal.id = :sucursalId
                AND c.fecha BETWEEN :inicio AND :fin
                AND c.estado = :estado
                ORDER BY c.fecha DESC
            """)
    List<Compra> findByFechasYEstado(
            @Param("sucursalId") Long sucursalId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("estado") String estado);

    /**
     * Obtener compras por proveedor en una sucursal.
     */
    @Query("""
                SELECT c FROM Compra c
                WHERE c.sucursal.id = :sucursalId
                AND c.proveedor.id = :proveedorId
                ORDER BY c.fecha DESC
            """)
    Page<Compra> findByProveedorId(
            @Param("sucursalId") Long sucursalId,
            @Param("proveedorId") Long proveedorId,
            Pageable pageable);

    /**
     * Obtener compra con items (eager loading).
     */
    @Query("""
                SELECT DISTINCT c FROM Compra c
                LEFT JOIN FETCH c.items
                WHERE c.id = :id AND c.sucursal.id = :sucursalId
            """)
    Optional<Compra> findByIdWithItems(
            @Param("id") Long id,
            @Param("sucursalId") Long sucursalId);

    /**
     * Contar compras pendientes en una sucursal (para dashboard).
     */
    @Query("SELECT COUNT(c) FROM Compra c WHERE c.sucursal.id = :sucursalId AND c.estado = 'pendiente'")
    Long countPendientes(@Param("sucursalId") Long sucursalId);

    /**
     * Obtener últimas compras de usuario (preferencias).
     */
    @Query("""
                SELECT c FROM Compra c
                WHERE c.sucursal.id = :sucursalId
                AND c.usuario.id = :usuarioId
                ORDER BY c.fecha DESC
            """)
    List<Compra> findUltimasDelUsuario(
            @Param("sucursalId") Long sucursalId,
            @Param("usuarioId") Long usuarioId,
            Pageable pageable);
}
