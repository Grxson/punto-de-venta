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

        /**
         * Recupera todos los gastos de una sucursal.
         *
         * @param sucursalId ID de la sucursal
         * @return lista de gastos de la sucursal
         */
        List<Gasto> findBySucursalId(Long sucursalId);

        /**
         * Recupera los gastos clasificados en una categoría.
         *
         * @param categoriaGastoId ID de la categoría de gasto
         * @return lista de gastos de la categoría
         */
        List<Gasto> findByCategoriaGastoId(Long categoriaGastoId);

        /**
         * Recupera los gastos registrados dentro de un rango de fechas.
         *
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return lista de gastos del rango
         */
        List<Gasto> findByFechaBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);

        /**
         * Recupera los gastos de una sucursal dentro de un rango de fechas.
         *
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return lista de gastos de la sucursal en el rango
         */
        @Query("SELECT g FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        List<Gasto> findBySucursalAndFechaBetween(@Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        /**
         * Suma los importes de los gastos de una sucursal en un rango de fechas.
         *
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return suma de importes, o 0 si no hay resultados
         */
        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        java.math.BigDecimal sumMontoByFechaBetween(@Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // Métodos para filtrar por tipo de gasto

        /**
         * Recupera los gastos de un tipo concreto (Operacional, Administrativo, etc.).
         *
         * @param tipoGasto tipo de gasto a filtrar
         * @return lista de gastos del tipo indicado
         */
        List<Gasto> findByTipoGasto(String tipoGasto);

        /**
         * Recupera los gastos de un tipo dentro de un rango de fechas.
         *
         * @param tipoGasto   tipo de gasto a filtrar
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return lista de gastos del tipo en el rango
         */
        List<Gasto> findByTipoGastoAndFechaBetween(String tipoGasto, LocalDateTime fechaInicio, LocalDateTime fechaFin);

        /**
         * Recupera los gastos de un tipo en una sucursal dentro de un rango de fechas.
         *
         * @param tipoGasto   tipo de gasto a filtrar
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return lista de gastos del tipo en la sucursal y rango
         */
        @Query("SELECT g FROM Gasto g WHERE g.tipoGasto = :tipoGasto AND g.sucursal.id = :sucursalId AND g.fecha BETWEEN :fechaInicio AND :fechaFin")
        List<Gasto> findByTipoGastoAndSucursalAndFechaBetween(@Param("tipoGasto") String tipoGasto,
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        /**
         * Suma los importes de los gastos de un tipo en una sucursal dentro de un rango de fechas.
         *
         * @param tipoGasto   tipo de gasto a filtrar
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio fecha de inicio del rango (inclusive)
         * @param fechaFin    fecha de fin del rango (inclusive)
         * @return suma de importes, o 0 si no hay resultados
         */
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
        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.sucursal.id = :sucursalId AND g.fecha >= :fechaInicio AND g.fecha <= :fechaFin")
        java.math.BigDecimal sumMontoByAllTypesAndSucursalAndFechaBetween(
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        /**
         * Obtener SUMA SOLO DE GASTOS OPERACIONALES por sucursal y rango de fechas.
         * ✅ Usado en DailyStatsPanel: Solo muestra gastos OPERACIONALES, no
         * administrativos
         * 
         * @param sucursalId  ID de la sucursal
         * @param fechaInicio Fecha de inicio
         * @param fechaFin    Fecha de fin
         * @return Suma total de gastos operacionales o 0 si no hay resultados
         */
        @Query("SELECT COALESCE(SUM(g.monto), 0) FROM Gasto g WHERE g.tipoGasto = 'Operacional' AND g.sucursal.id = :sucursalId AND g.fecha >= :fechaInicio AND g.fecha <= :fechaFin")
        java.math.BigDecimal sumMontoByOperacionalAndSucursalAndFechaBetween(
                        @Param("sucursalId") Long sucursalId,
                        @Param("fechaInicio") LocalDateTime fechaInicio,
                        @Param("fechaFin") LocalDateTime fechaFin);

        // ==================== MÉTODOS PARA BÚSQUEDA DE GASTOS POR CATEGORÍA

        /**
         * Busca gastos de una categoría cuyo texto coincida en la referencia o en la nota.
         * Existe para filtrar dentro de una categoría sin traer todo el catálogo.
         *
         * @param categoriaId   ID de la categoría de gasto
         * @param searchPattern patrón de búsqueda (se aplica en minúsculas)
         * @return lista de gastos coincidentes ordenada por fecha descendente
         */
        @Query("SELECT g FROM Gasto g WHERE g.categoriaGasto.id = :categoriaId AND (LOWER(g.referencia) LIKE LOWER(:searchPattern) OR LOWER(g.nota) LIKE LOWER(:searchPattern)) ORDER BY g.fecha DESC")
        List<Gasto> findByCategoriaGastoAndBusqueda(@Param("categoriaId") Long categoriaId,
                        @Param("searchPattern") String searchPattern);
}
