package com.puntodeventa.backend.util;

import com.puntodeventa.backend.dto.ProductoPopularidadDTO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Algoritmo de Popularidad para Ordenamiento Dinámico del Menú.
 * 
 * Calcula un score de popularidad basado en:
 * - Frecuencia de venta (cantidad de veces vendido)
 * - Cantidad total vendida
 * - Ingresos generados
 * - Fecha de última venta (recencia)
 * - Tendencia (pendiente de ventas en el tiempo)
 */
public class PopularityAlgorithm {

    /**
     * Calcula el score de popularidad para un producto.
     * El score es un valor normalizado entre 0 y 100.
     * 
     * @param productoId ID del producto
     * @param frecuenciaVenta Número de veces que se vendió
     * @param cantidadTotal Cantidad total vendida
     * @param ingresoTotal Ingreso total generado
     * @param ultimaVenta Fecha de última venta
     * @param tendencia Tendencia en pendiente (ventas recientemente vs antiguas)
     * @return Score de popularidad (0-100)
     */
    public static BigDecimal calcularScore(
            Long productoId,
            long frecuenciaVenta,
            long cantidadTotal,
            BigDecimal ingresoTotal,
            LocalDateTime ultimaVenta,
            double tendencia) {

        // 1. Factor de Frecuencia (cuántas veces se vendió)
        // Logarítmica para evitar que productos con muchas ventas dominen
        double factorFrecuencia = Math.log1p(frecuenciaVenta) * 20;

        // 2. Factor de Cantidad (cuánto se vendió)
        double factorCantidad = Math.log1p(cantidadTotal) * 15;

        // 3. Factor de Ingreso (dinero generado)
        double ingresoDouble = ingresoTotal != null ? ingresoTotal.doubleValue() : 0;
        double factorIngreso = Math.log1p(ingresoDouble) * 10;

        // 4. Factor de Recencia (qué tan reciente fue la última venta)
        double factorRecencia = calcularFactorRecencia(ultimaVenta) * 25;

        // 5. Factor de Tendencia (si está en alza o baja)
        double factorTendencia = Math.tanh(tendencia) * 30; // Normaliza entre -30 y 30

        // Sumar todos los factores
        double scoreRaw = factorFrecuencia + factorCantidad + factorIngreso + factorRecencia + factorTendencia;

        // Normalizar a escala 0-100 usando función sigmoide
        double scoreNormalizado = (100 / (1 + Math.exp(-scoreRaw / 50)));

        return BigDecimal.valueOf(scoreNormalizado).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcula un factor de recencia (0-1).
     * Productos vendidos recientemente tienen factor más alto.
     * 
     * @param ultimaVenta Fecha de última venta
     * @return Factor de recencia (0-1)
     */
    private static double calcularFactorRecencia(LocalDateTime ultimaVenta) {
        if (ultimaVenta == null) {
            return 0;
        }

        LocalDateTime ahora = LocalDateTime.now();
        long minutosDesdeUltimaVenta = java.time.temporal.ChronoUnit.MINUTES.between(ultimaVenta, ahora);

        // Usando función exponencial decreciente
        // Factor se reduce a la mitad cada 480 minutos (8 horas)
        double factor = Math.exp(-minutosDesdeUltimaVenta / 480.0);

        return Math.min(factor, 1.0); // Cap a 1.0
    }

    /**
     * Calcula la tendencia (pendiente) basada en ventas recientes vs antiguas.
     * Positiva: tendencia al alza
     * Negativa: tendencia a la baja
     * 
     * @param ventasRecientes Cantidad vendida en las últimas 7 días
     * @param ventasAntiguas Cantidad vendida en los 7 días antes de eso
     * @return Tendencia como pendiente (-1 a 1)
     */
    public static double calcularTendencia(long ventasRecientes, long ventasAntiguas) {
        if (ventasAntiguas == 0) {
            return ventasRecientes > 0 ? 0.5 : 0;
        }

        double tasa = (double) (ventasRecientes - ventasAntiguas) / ventasAntiguas;
        // Normalizar a rango (-1, 1) usando función tanh inversa
        return Math.tanh(tasa);
    }

    /**
     * Ordena productos por popularidad (mayor a menor).
     * 
     * @param productos Lista de DTOs con información de productos
     * @return Lista ordenada por score de popularidad descendente
     */
    public static List<ProductoPopularidadDTO> ordenarPorPopularidad(
            List<ProductoPopularidadDTO> productos) {

        return productos.stream()
                .sorted(Comparator
                        .comparing(ProductoPopularidadDTO::scorePopularidad, Comparator.reverseOrder())
                        .thenComparing(ProductoPopularidadDTO::frecuenciaVenta, Comparator.reverseOrder())
                        .thenComparing(ProductoPopularidadDTO::cantidadVendida, Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    /**
     * Distribuye productos en una grilla (grid) de izquierda a derecha, arriba hacia abajo.
     * Sigue el patrón: → → → ↓ → → →
     * 
     * @param productos Lista ordenada de productos por popularidad
     * @param columnasGrid Número de columnas en la grilla
     * @return Mapa con posiciones: {producto_id -> {row, col}}
     */
    public static Map<Long, GridPosition> distribuirEnGrid(
            List<ProductoPopularidadDTO> productos,
            int columnasGrid) {

        Map<Long, GridPosition> posiciones = new LinkedHashMap<>();

        for (int i = 0; i < productos.size(); i++) {
            int fila = i / columnasGrid;
            int columna = i % columnasGrid;
            ProductoPopularidadDTO producto = productos.get(i);
            posiciones.put(producto.id(), new GridPosition(fila, columna));
        }

        return posiciones;
    }

    /**
     * Agrupa productos por categoría y distribuye cada grupo en su propia grilla.
     * Útil para menús categorizados.
     * 
     * @param productos Lista ordenada de productos
     * @param columnasGrid Columnas por categoría
     * @return Mapa: {categoria -> {producto_id -> posición}}
     */
    public static Map<String, Map<Long, GridPosition>> distribuirPorCategoria(
            List<ProductoPopularidadDTO> productos,
            int columnasGrid) {

        Map<String, List<ProductoPopularidadDTO>> porCategoria = productos.stream()
                .collect(Collectors.groupingBy(ProductoPopularidadDTO::categoriaNombre));

        return porCategoria.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> distribuirEnGrid(entry.getValue(), columnasGrid),
                        (a, b) -> a,
                        LinkedHashMap::new));
    }

    /**
     * Reposiciona un producto en el menú dinámicamente después de una venta.
     * Incrementa ligeramente su score y lo mantiene en posición alta.
     * 
     * @param productoActual DTO actual del producto
     * @return DTO con score actualizado
     */
    public static ProductoPopularidadDTO actualizarDespuesDeVenta(
            ProductoPopularidadDTO productoActual) {

        // Incrementar frecuencia
        long nuevaFrecuencia = productoActual.frecuenciaVenta() + 1;

        // Actualizar timestamp de última venta
        LocalDateTime ahoraMismo = LocalDateTime.now();

        // Recalcular score con los nuevos valores
        BigDecimal nuevoScore = calcularScore(
                productoActual.id(),
                nuevaFrecuencia,
                productoActual.cantidadVendida() + 1, // +1 por la venta actual
                productoActual.ingresoTotal(),
                ahoraMismo,
                0 // Tendencia se recalcula desde BD
        );

        return new ProductoPopularidadDTO(
                productoActual.id(),
                productoActual.nombre(),
                productoActual.categoriaNombre(),
                productoActual.precio(),
                productoActual.descripcion(),
                nuevaFrecuencia,
                productoActual.cantidadVendida() + 1,
                productoActual.ingresoTotal(),
                ahoraMismo,
                nuevoScore
        );
    }

    /**
     * Registro de posición en grilla.
     */
    public record GridPosition(int fila, int columna) {

        @Override
        public String toString() {
            return "Fila " + fila + ", Columna " + columna;
        }
    }
}
