package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repositorio para la entidad Gasto.
 */
@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {

        List<Gasto> findBySucursalId(Long sucursalId);

        List<Gasto> findByCategoriaGastoId(Long categoriaGastoId);

        List<Gasto> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

        @Query("SELECT g FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        List<Gasto> findBySucursalAndFechaBetween(@Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        java.math.BigDecimal sumMontoByFechaBetween(@Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // Métodos para filtrar por tipo de gasto

        List<Gasto> findByTipoGasto(String tipoGasto);

        List<Gasto> findByTipoGastoAndFechaBetween(String tipoGasto, LocalDateTime fechaInicio, LocalDateTime fechaFin);

        @Query("SELECT g FROM Gasto g WHERE g.tipoGasto = :tipoGasto AND g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        List<Gasto> findByTipoGastoAndSucursalAndFechaBetween(@Param("tipoGasto") String tipoGasto,
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.tipoGasto = :tipoGasto AND g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        java.math.BigDecimal sumMontoByTipoGastoAndFechaBetween(@Param("tipoGasto") String tipoGasto,
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // ==================== MÉTODOS PARA SEGREGACIÓN POR SUCURSAL
        // ====================

        /**
         * Obtener suma de gastos por tipo, sucursal y rango de fechas.
         * 
         * @param tipoGasto   Tipo de gasto (Operacional, Administrativo, etc.)
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio Fecha de inicio
         * @param fechaFin    Fecha de fin
         * @return Suma total de gastos o 0 si no hay resultados
         */
        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.tipoGasto = :tipoGasto AND g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        java.math.BigDecimal sumMontoByTipoGastoAndSucursalAndFechaBetween(@Param("tipoGasto") String tipoGasto,
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        /**
         * Obtener SUMA DE TODOS LOS GASTOS (sin importar tipo) por sucursal y rango de
         * fechas.
         * Se utiliza en reportes para calcular el total de gastos operativos.
         * ✅ CRÍTICO: Suma OPERACIONALES + ADMINISTRATIVOS + todos los demás tipos
         * 
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio Fecha de inicio
         * @param fechaFin    Fecha de fin
         * @return Suma total de TODOS los gastos o 0 si no hay resultados
         */
        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.sucursal.id = :sucursalId AND CAST(g.fecha AS DATE) >= CAST(:fechaInicio AS DATE) AND CAST(g.fecha AS DATE) <= CAST(:fechaFin AS DATE)")
        java.math.BigDecimal sumMontoByAllTypesAndSucursalAndFechaBetween(
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // ==================== MÉTODOS PARA BÚSQUEDA DE GASTOS POR CATEGORÍA

        @Query("SELECT g FROM Gasto g WHERE g.categoriaGasto.id = :categoriaId AND (LOWER(g.referencia) LIKE LOWER(:searchPattern) OR LOWER(g.nota) LIKE LOWER(:searchPattern)) ORDER BY g.fecha DESC")
        List<Gasto> findByCategoriaGastoAndBusqueda(@Param("categoriaId") Long categoriaId,
                        @Param("searchPattern") String searchPattern);
}
