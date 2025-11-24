package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de ventas.
 * Incluye lógica de cálculo de totales y descuento de inventario.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VentaService {
    
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final SucursalRepository sucursalRepository;
    private final InventarioMovimientoRepository inventarioMovimientoRepository;
    private final RecetaRepository recetaRepository;
    private final IngredienteRepository ingredienteRepository;
    
    public List<VentaDTO> obtenerTodas() {
        return ventaRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
    
    public VentaDTO obtenerPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
        return toDTO(venta);
    }
    
    public List<VentaDTO> obtenerPorEstado(String estado) {
        return ventaRepository.findByEstado(estado).stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<VentaDTO> obtenerPorSucursal(Long sucursalId) {
        return ventaRepository.findBySucursalId(sucursalId).stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<VentaDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return ventaRepository.findByFechaBetween(fechaInicio, fechaFin).stream()
            .map(this::toDTO)
            .toList();
    }
    
    @Transactional
    public VentaDTO crearVenta(CrearVentaRequest request) {
        LocalDateTime ahora = LocalDateTime.now();
        
        // 1. Crear la venta principal
        Venta venta = Venta.builder()
            .fecha(ahora)
            .canal(request.canal())
            .estado("PAGADA")
            .nota(request.nota())
            .impuestos(BigDecimal.ZERO) // TODO: Implementar IVA
            .descuento(BigDecimal.ZERO) // TODO: Implementar descuentos
            .build();
        
        // 2. Asignar sucursal si se proporciona
        if (request.sucursalId() != null) {
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + request.sucursalId()));
            venta.setSucursal(sucursal);
        }
        
        // 3. Procesar items y calcular subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (VentaItemDTO itemDTO : request.items()) {
            Producto producto = productoRepository.findById(itemDTO.productoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemDTO.productoId()));

            // TODO: Validar stock suficiente (pendiente)

            // Calcular subtotal del item (precio * cantidad)
            BigDecimal precioUnitario = itemDTO.precioUnitario() != null
                ? itemDTO.precioUnitario()
                : producto.getPrecio();

            BigDecimal subtotalItem = precioUnitario.multiply(BigDecimal.valueOf(itemDTO.cantidad()));

            // Calcular costo estimado del item (costoEstimadoProducto * cantidad) si existe
            BigDecimal costoEstimadoProducto = producto.getCostoEstimado();
            BigDecimal costoItem = null;
            if (costoEstimadoProducto != null) {
                costoItem = costoEstimadoProducto.multiply(BigDecimal.valueOf(itemDTO.cantidad()));
            }

            VentaItem item = VentaItem.builder()
                .producto(producto)
                .cantidad(itemDTO.cantidad())
                .precioUnitario(precioUnitario)
                .subtotal(subtotalItem)
                .costoEstimado(costoItem) // Puede quedar null si no hay receta/costo
                .nota(itemDTO.nota())
                .build();

            venta.addItem(item);
            subtotal = subtotal.add(subtotalItem);
        }
        
        venta.setSubtotal(subtotal);
        venta.setTotal(subtotal); // Por ahora sin impuestos ni descuentos
        
        // 4. Procesar pagos y validar que cubran el total
        BigDecimal totalPagos = BigDecimal.ZERO;
        
        for (PagoDTO pagoDTO : request.pagos()) {
            MetodoPago metodoPago = metodoPagoRepository.findById(pagoDTO.metodoPagoId())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + pagoDTO.metodoPagoId()));
            
            Pago pago = Pago.builder()
                .metodoPago(metodoPago)
                .monto(pagoDTO.monto())
                .referencia(pagoDTO.referencia())
                .fecha(ahora)
                .build();
            
            venta.addPago(pago);
            totalPagos = totalPagos.add(pagoDTO.monto());
        }
        
        // Validar que los pagos cubran el total
        if (totalPagos.compareTo(venta.getTotal()) < 0) {
            throw new IllegalArgumentException("El total de pagos (" + totalPagos + ") no cubre el total de la venta (" + venta.getTotal() + ")");
        }
        
        // 5. Guardar la venta
        Venta ventaGuardada = ventaRepository.save(venta);
        
        // 6. Descontar inventario automáticamente (consumo por recetas)
        descontarInventario(ventaGuardada);
        
        return toDTO(ventaGuardada);
    }
    
    /**
     * Descuenta el inventario automáticamente basado en las recetas de los productos vendidos.
     * Genera movimientos de inventario de tipo "EGRESO" por consumo.
     */
    private void descontarInventario(Venta venta) {
        LocalDateTime ahora = LocalDateTime.now();
        
        for (VentaItem item : venta.getItems()) {
            Producto producto = item.getProducto();
            Integer cantidadVendida = item.getCantidad();
            
            // Buscar recetas del producto
            List<Receta> recetas = recetaRepository.findByProductoId(producto.getId());
            
            for (Receta receta : recetas) {
                Ingrediente ingrediente = receta.getIngrediente();
                
                // Calcular cantidad a descontar (cantidad_receta * cantidad_vendida)
                BigDecimal cantidadConsumir = receta.getCantidad()
                    .multiply(BigDecimal.valueOf(cantidadVendida));
                
                // Calcular costo del consumo
                BigDecimal costoUnitario = ingrediente.getCostoUnitarioBase();
                BigDecimal costoTotal = cantidadConsumir.multiply(costoUnitario);
                
                // Crear movimiento de inventario (EGRESO por consumo)
                InventarioMovimiento movimiento = InventarioMovimiento.builder()
                    .ingrediente(ingrediente)
                    .tipo("EGRESO")
                    .cantidad(cantidadConsumir)
                    .unidad(receta.getUnidad())
                    .costoUnitario(costoUnitario)
                    .costoTotal(costoTotal)
                    .fecha(ahora)
                    .refTipo("venta")
                    .refId(venta.getId())
                    .nota("Consumo automático por venta #" + venta.getId())
                    .build();
                
                inventarioMovimientoRepository.save(movimiento);
                
                // TODO: Actualizar stock actual del ingrediente (pendiente - requiere agregar campo stockActual a Ingrediente)
                // BigDecimal nuevoStock = ingrediente.getStockActual().subtract(cantidadConsumir);
                // ingrediente.setStockActual(nuevoStock);
                // ingredienteRepository.save(ingrediente);
            }
        }
    }
    
    // Método helper para conversión a DTO
    private VentaDTO toDTO(Venta venta) {
        List<VentaItemDTO> itemsDTO = venta.getItems().stream()
            .map(item -> new VentaItemDTO(
                item.getId(),
                item.getProducto().getId(),
                item.getProducto().getNombre(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal(),
                item.getCostoEstimado(),
                item.getNota()
            ))
            .toList();
        
        List<PagoDTO> pagosDTO = venta.getPagos().stream()
            .map(pago -> new PagoDTO(
                pago.getId(),
                pago.getMetodoPago().getId(),
                pago.getMetodoPago().getNombre(),
                pago.getMonto(),
                pago.getReferencia(),
                pago.getFecha()
            ))
            .toList();
        
        return new VentaDTO(
            venta.getId(),
            venta.getSucursal() != null ? venta.getSucursal().getId() : null,
            venta.getSucursal() != null ? venta.getSucursal().getNombre() : null,
            venta.getFecha(),
            venta.getSubtotal(),
            venta.getTotal(),
            venta.getImpuestos(),
            venta.getDescuento(),
            venta.getCanal(),
            venta.getEstado(),
            venta.getNota(),
            venta.getUsuario() != null ? venta.getUsuario().getId() : null,
            venta.getUsuario() != null ? venta.getUsuario().getNombre() : null,
            itemsDTO,
            pagosDTO
        );
    }
}
