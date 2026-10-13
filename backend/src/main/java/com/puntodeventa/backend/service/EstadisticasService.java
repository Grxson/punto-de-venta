package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.ProductoRendimientoDTO;
import com.puntodeventa.backend.dto.ResumenVentasDiaDTO;
import com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate;
import com.puntodeventa.backend.dto.aggregate.ProductoRendimientoAggregate;
import com.puntodeventa.backend.repository.VentaRepository;
import com.puntodeventa.backend.repository.VentaItemRepository;
import com.puntodeventa.backend.repository.GastoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Servicio de resúmenes y estadísticas de venta.
 * Distingue dos visiones de costo: la del panel diario, que solo computa gastos
 * operacionales, y la de reportes, que incluye todos los gastos. Todas las
 * consultas se acotan a la sucursal del usuario y los agregados se calculan en
 * la base de datos para evitar cargar ventas en memoria.
 */
@Slf4j
@Service
@Transactional(readOnly = true)
public class EstadisticasService {

        private final VentaRepository ventaRepository;
        private final VentaItemRepository ventaItemRepository;
        private final GastoRepository gastoRepository;

        public EstadisticasService(VentaRepository ventaRepository, VentaItemRepository ventaItemRepository,
                        GastoRepository gastoRepository) {
                this.ventaRepository = ventaRepository;
                this.ventaItemRepository = ventaItemRepository;
                this.gastoRepository = gastoRepository;
        }

        /**
         * ✅ DailyStatsPanel: Resumen del día con SOLO GASTOS OPERACIONALES
         * Excluye gastos administrativos, nómina, etc.
         *
         * @param fecha Día a resumir.
         * @return Resumen de ventas y costos operacionales de ese día.
         */
        public ResumenVentasDiaDTO resumenDiaConGastosOperacionales(LocalDate fecha) {
                LocalDateTime inicio = fecha.atStartOfDay();
                LocalDateTime fin = fecha.atTime(LocalTime.MAX);
                log.info("📊 [EstadisticasService] resumenDiaConGastosOperacionales: fecha={}", fecha);
                return resumenRangoConGastosOperacionales(inicio, fin, fecha);
        }

        /**
         * ✅ DailyStatsPanel: Resumen de rango de fechas con SOLO GASTOS OPERACIONALES
         * Excluye gastos administrativos, nómina, etc.
         * CACHEADO: TTL 5 minutos (CACHE_DYNAMIC_MINUTES)
         *
         * Costo total = costo de los productos vendidos + gastos operacionales.
         * El margen y el ticket promedio se redondean a dos decimales.
         *
         * @param desde                 Fecha y hora inicial del período.
         * @param hasta                 Fecha y hora final del período.
         * @param fechaRepresentativa   Fecha que se devuelve en el resumen.
         * @return Resumen del período con gastos operacionales.
         */
        @Cacheable(value = "resumen-ventas", key = "#sucursalId + '_' + #desde.toLocalDate() + '_' + #hasta.toLocalDate()", unless = "#result == null")
        public ResumenVentasDiaDTO resumenRangoConGastosOperacionales(LocalDateTime desde, LocalDateTime hasta,
                        LocalDate fechaRepresentativa) {
                log.info("📊 [EstadisticasService] resumenRangoConGastosOperacionales: desde={}, hasta={}",
                                desde, hasta);

                // ✅ SEGREGACIÓN: Obtener resumen solo de la sucursal del usuario
                Long sucursalId = SucursalContext.getSucursalId();

                ResumenVentasAggregate agg = ventaRepository.aggregateResumenBySucursal(sucursalId, desde, hasta);
                BigDecimal totalVentas = agg.totalVentas();
                BigDecimal totalCostosProductos = agg.totalCostos();

                log.info("  ↳ Aggregate: cantidadVentas={}, totalVentas={}, totalCostos={}",
                                agg.cantidadVentas(), totalVentas, totalCostosProductos);

                // ✅ SOLO GASTOS OPERACIONALES (para DailyStatsPanel)
                BigDecimal totalGastos = gastoRepository.sumMontoByOperacionalAndSucursalAndFechaBetween(
                                sucursalId, desde, hasta);
                log.info("  ↳ Gastos OPERACIONALES SOLAMENTE: {} | sucursalId={}", totalGastos, sucursalId);

                if (totalGastos == null) {
                        totalGastos = BigDecimal.ZERO;
                        log.warn("  ⚠️ totalGastos era NULL, estableciendo a ZERO");
                }

                // Total de costos = costos de productos + gastos operacionales
                BigDecimal totalCostos = totalCostosProductos.add(totalGastos);

                long itemsVendidos = agg.itemsVendidos();
                int cantidadVentas = agg.cantidadVentas().intValue();
                BigDecimal margenBruto = totalVentas.subtract(totalCostos);
                BigDecimal ticketPromedio = cantidadVentas > 0
                                ? totalVentas.divide(BigDecimal.valueOf(cantidadVentas), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;
                BigDecimal margenPorcentaje = totalVentas.compareTo(BigDecimal.ZERO) > 0
                                ? margenBruto.divide(totalVentas, 4, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100))
                                                .setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                return new ResumenVentasDiaDTO(
                                fechaRepresentativa,
                                totalVentas.setScale(2, RoundingMode.HALF_UP),
                                totalCostos.setScale(4, RoundingMode.HALF_UP),
                                totalGastos.setScale(2, RoundingMode.HALF_UP),
                                margenBruto.setScale(2, RoundingMode.HALF_UP),
                                cantidadVentas,
                                itemsVendidos,
                                ticketPromedio,
                                margenPorcentaje);
        }

        /**
         * ✅ Reportes (Corte por Producto, etc.): Resumen con TODOS LOS GASTOS
         * Incluye gastos operacionales, administrativos, nómina, etc.
         *
         * @param desde               Fecha y hora inicial del período.
         * @param hasta               Fecha y hora final del período.
         * @param fechaRepresentativa Fecha que se devuelve en el resumen.
         * @return Resumen del período con todos los gastos.
         */
        public ResumenVentasDiaDTO resumenRangoConTodosGastos(LocalDateTime desde, LocalDateTime hasta,
                        LocalDate fechaRepresentativa) {
                log.info("📊 [EstadisticasService] resumenRangoConTodosGastos: desde={}, hasta={}",
                                desde, hasta);

                // ✅ SEGREGACIÓN: Obtener resumen solo de la sucursal del usuario
                Long sucursalId = SucursalContext.getSucursalId();

                ResumenVentasAggregate agg = ventaRepository.aggregateResumenBySucursal(sucursalId, desde, hasta);
                BigDecimal totalVentas = agg.totalVentas();
                BigDecimal totalCostosProductos = agg.totalCostos();

                log.info("  ↳ Aggregate: cantidadVentas={}, totalVentas={}, totalCostos={}",
                                agg.cantidadVentas(), totalVentas, totalCostosProductos);

                // ✅ TODOS LOS GASTOS (para reportes)
                BigDecimal totalGastos = gastoRepository.sumMontoByAllTypesAndSucursalAndFechaBetween(
                                sucursalId, desde, hasta);
                log.info("  ↳ Gastos TODOS LOS TIPOS: {} | sucursalId={}", totalGastos, sucursalId);

                if (totalGastos == null) {
                        totalGastos = BigDecimal.ZERO;
                        log.warn("  ⚠️ totalGastos era NULL, estableciendo a ZERO");
                }

                // Total de costos = costos de productos + todos los gastos
                BigDecimal totalCostos = totalCostosProductos.add(totalGastos);

                long itemsVendidos = agg.itemsVendidos();
                int cantidadVentas = agg.cantidadVentas().intValue();
                BigDecimal margenBruto = totalVentas.subtract(totalCostos);
                BigDecimal ticketPromedio = cantidadVentas > 0
                                ? totalVentas.divide(BigDecimal.valueOf(cantidadVentas), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;
                BigDecimal margenPorcentaje = totalVentas.compareTo(BigDecimal.ZERO) > 0
                                ? margenBruto.divide(totalVentas, 4, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100))
                                                .setScale(2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                return new ResumenVentasDiaDTO(
                                fechaRepresentativa,
                                totalVentas.setScale(2, RoundingMode.HALF_UP),
                                totalCostos.setScale(4, RoundingMode.HALF_UP),
                                totalGastos.setScale(2, RoundingMode.HALF_UP),
                                margenBruto.setScale(2, RoundingMode.HALF_UP),
                                cantidadVentas,
                                itemsVendidos,
                                ticketPromedio,
                                margenPorcentaje);
        }

        // ⚠️ DEPRECATED: Mantener para compatibilidad hacia atrás
        /**
         * Resumen del día con gastos operacionales.
         *
         * @param fecha Día a resumir.
         * @return Resumen de ventas y costos operacionales de ese día.
         * @deprecated usar {@link #resumenDiaConGastosOperacionales(LocalDate)}.
         */
        @Deprecated(forRemoval = true, since = "1.0.0")
        public ResumenVentasDiaDTO resumenDia(LocalDate fecha) {
                return resumenDiaConGastosOperacionales(fecha);
        }

        // ⚠️ DEPRECATED: Mantener para compatibilidad hacia atrás
        /**
         * Resumen de un rango con gastos operacionales.
         *
         * @param desde               Fecha y hora inicial del período.
         * @param hasta               Fecha y hora final del período.
         * @param fechaRepresentativa Fecha que se devuelve en el resumen.
         * @return Resumen del período con gastos operacionales.
         * @deprecated usar {@link #resumenRangoConGastosOperacionales(LocalDateTime, LocalDateTime, LocalDate)}.
         */
        @Deprecated(forRemoval = true, since = "1.0.0")
        public ResumenVentasDiaDTO resumenRango(LocalDateTime desde, LocalDateTime hasta,
                        LocalDate fechaRepresentativa) {
                return resumenRangoConGastosOperacionales(desde, hasta, fechaRepresentativa);
        }

        /**
         * Obtiene el rendimiento de los productos más vendidos de un día.
         *
         * @param fecha  Día a analizar.
         * @param limite Número máximo de productos a devolver.
         * @return Lista de DTO con el rendimiento de los productos top.
         */
        public List<ProductoRendimientoDTO> rendimientoProductosDia(LocalDate fecha, int limite) {
                LocalDateTime inicio = fecha.atStartOfDay();
                LocalDateTime fin = fecha.atTime(LocalTime.MAX);
                return rendimientoProductosRango(inicio, fin, limite);
        }

        /**
         * Obtiene el rendimiento de los productos más vendidos en un rango.
         *
         * @param desde  Fecha y hora inicial del período.
         * @param hasta  Fecha y hora final del período.
         * @param limite Número máximo de productos a devolver.
         * @return Lista de DTO con el rendimiento de los productos top.
         */
        public List<ProductoRendimientoDTO> rendimientoProductosRango(LocalDateTime desde, LocalDateTime hasta,
                        int limite) {
                // CACHEADO: TTL 10 minutos (CACHE_SEMI_STATIC_MINUTES)
                Long sucursalId = SucursalContext.getSucursalId();
                return rendimientoProductosRangoInternal(desde, hasta, limite, sucursalId);
        }

        /**
         * Calcula el rendimiento por producto y lo cachea por sucursal y período.
         * El margen unitario y su porcentaje solo se calculan si el producto tiene
         * precio y costo estimado conocidos y un precio mayor que cero.
         *
         * @param desde      Fecha y hora inicial del período.
         * @param hasta      Fecha y hora final del período.
         * @param limite     Número máximo de productos a devolver.
         * @param sucursalId Identificador de la sucursal, usado como parte de la clave de caché.
         * @return Lista de DTO con el rendimiento de los productos top.
         */
        @Cacheable(value = "productos-top", key = "#sucursalId + '_' + #desde.toLocalDate() + '_' + #hasta.toLocalDate() + '_' + #limite", unless = "#result == null || #result.isEmpty()")
        public List<ProductoRendimientoDTO> rendimientoProductosRangoInternal(LocalDateTime desde, LocalDateTime hasta,
                        int limite, Long sucursalId) {

                List<ProductoRendimientoAggregate> agregados = ventaItemRepository.topProductos(desde, hasta,
                                sucursalId,
                                org.springframework.data.domain.PageRequest.of(0, limite));

                return agregados.stream().map(a -> {
                        BigDecimal margenUnitario = null;
                        BigDecimal margenPct = null;
                        if (a.precio() != null && a.costoEstimado() != null
                                        && a.precio().compareTo(BigDecimal.ZERO) > 0) {
                                margenUnitario = a.precio().subtract(a.costoEstimado()).setScale(4,
                                                RoundingMode.HALF_UP);
                                margenPct = margenUnitario.divide(a.precio(), 4, RoundingMode.HALF_UP)
                                                .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
                        }
                        BigDecimal margenBrutoTotal = a.ingresoTotal().subtract(a.costoTotal());
                        return new ProductoRendimientoDTO(
                                        a.productoId(),
                                        a.nombreProducto(),
                                        a.precio(),
                                        a.costoEstimado(),
                                        margenUnitario,
                                        margenPct,
                                        a.unidadesVendidas(),
                                        a.ingresoTotal().setScale(2, RoundingMode.HALF_UP),
                                        a.costoTotal().setScale(4, RoundingMode.HALF_UP),
                                        margenBrutoTotal.setScale(2, RoundingMode.HALF_UP));
                }).toList();
        }

        /**
         * ✅ INVALIDAR CACHES DE REPORTES
         * Se llama automáticamente cuando se crea una venta o gasto
         * para asegurar que los datos cacheados se actualizan.
         */
        @CacheEvict(value = { "resumen-ventas", "productos-top" }, allEntries = true)
        public void invalidarCachesReportes() {
                log.info("🔄 Invalidando caches de reportes (resumen-ventas y productos-top)");
        }
}