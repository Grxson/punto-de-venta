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
 * Repositorio para Compra - consultas optimizadas y segregadas por sucursal.
 */
@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    /**
     * Obtiene compras de una sucursal con paginación.
     * ✅ Segregación: Solo datos de la sucursal especificada
     *
     * @param sucursalId ID de la sucursal
     * @param pageable   paginación y orden solicitados
     * @return página de compras de la sucursal ordenadas por fecha descendente
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
     * Obtiene compras por rango de fechas y estado.
     * ✅ Optimizado con índices en BD
     *
     * @param sucursalId ID de la sucursal
     * @param inicio     fecha de inicio del rango (inclusive)
     * @param fin        fecha de fin del rango (inclusive)
     * @param estado     estado de la compra a filtrar
     * @return lista de compras coincidentes ordenadas por fecha descendente
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
     * Obtiene compras de un proveedor dentro de una sucursal, con paginación.
     *
     * @param sucursalId  ID de la sucursal
     * @param proveedorId ID del proveedor
     * @param pageable    paginación y orden solicitados
     * @return página de compras del proveedor ordenadas por fecha descendente
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
     * Obtiene una compra con sus renglones precargados.
     * Usa LEFT JOIN FETCH para evitar el problema N+1 al recorrer los renglones.
     *
     * @param id         ID de la compra
     * @param sucursalId ID de la sucursal propietaria
     * @return la compra con sus renglones, o vacío si no existe en la sucursal
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
     * Cuenta las compras pendientes de recepción de una sucursal (para el dashboard).
     *
     * @param sucursalId ID de la sucursal
     * @return número de compras en estado 'pendiente'
     */
    @Query("SELECT COUNT(c) FROM Compra c WHERE c.sucursal.id = :sucursalId AND c.estado = 'pendiente'")
    Long countPendientes(@Param("sucursalId") Long sucursalId);

    /**
     * Obtiene las últimas compras capturadas por un usuario, para reutilizar sus preferencias de registro.
     *
     * @param sucursalId ID de la sucursal
     * @param usuarioId  ID del usuario
     * @param pageable   paginación que limita el número de resultados
     * @return lista de compras del usuario ordenadas por fecha descendente
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
