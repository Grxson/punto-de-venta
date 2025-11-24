package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoRendimientoDTO;
import com.puntodeventa.backend.dto.ResumenVentasDiaDTO;
import com.puntodeventa.backend.dto.aggregate.ResumenVentasAggregate;
import com.puntodeventa.backend.dto.aggregate.ProductoRendimientoAggregate;
import com.puntodeventa.backend.repository.VentaRepository;
import com.puntodeventa.backend.repository.VentaItemRepository;
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

@Service
@Transactional(readOnly = true)
public class EstadisticasService {

    private final VentaRepository ventaRepository;
    private final VentaItemRepository ventaItemRepository;

    public EstadisticasService(VentaRepository ventaRepository, VentaItemRepository ventaItemRepository) {
        this.ventaRepository = ventaRepository;
        this.ventaItemRepository = ventaItemRepository;
    }

    public ResumenVentasDiaDTO resumenDia(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);
        return resumenRango(inicio, fin, fecha);
    }

    public ResumenVentasDiaDTO resumenRango(LocalDateTime desde, LocalDateTime hasta, LocalDate fechaRepresentativa) {
        ResumenVentasAggregate agg = ventaRepository.aggregateResumen(desde, hasta);
        BigDecimal totalVentas = agg.totalVentas();
        BigDecimal totalCostos = agg.totalCostos();
        long itemsVendidos = agg.itemsVendidos();
        int cantidadVentas = agg.cantidadVentas().intValue();
        BigDecimal margenBruto = totalVentas.subtract(totalCostos);
        BigDecimal ticketPromedio = cantidadVentas > 0 ?
                totalVentas.divide(BigDecimal.valueOf(cantidadVentas), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal margenPorcentaje = totalVentas.compareTo(BigDecimal.ZERO) > 0 ?
                margenBruto.divide(totalVentas, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        return new ResumenVentasDiaDTO(
                fechaRepresentativa,
                totalVentas.setScale(2, RoundingMode.HALF_UP),
                totalCostos.setScale(4, RoundingMode.HALF_UP),
                margenBruto.setScale(2, RoundingMode.HALF_UP),
                cantidadVentas,
                itemsVendidos,
                ticketPromedio,
                margenPorcentaje
        );
    }

    public List<ProductoRendimientoDTO> rendimientoProductosDia(LocalDate fecha, int limite) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);
        return rendimientoProductosRango(inicio, fin, limite);
    }

    public List<ProductoRendimientoDTO> rendimientoProductosRango(LocalDateTime desde, LocalDateTime hasta, int limite) {
    List<ProductoRendimientoAggregate> agregados = ventaItemRepository.topProductos(desde, hasta,
        org.springframework.data.domain.PageRequest.of(0, limite));

    return agregados.stream().map(a -> {
        BigDecimal margenUnitario = null;
        BigDecimal margenPct = null;
        if (a.precio() != null && a.costoEstimado() != null && a.precio().compareTo(BigDecimal.ZERO) > 0) {
        margenUnitario = a.precio().subtract(a.costoEstimado()).setScale(4, RoundingMode.HALF_UP);
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
            margenBrutoTotal.setScale(2, RoundingMode.HALF_UP)
        );
    }).toList();
    }
}
