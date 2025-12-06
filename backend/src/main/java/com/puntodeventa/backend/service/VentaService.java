package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de ventas.
 * Incluye lógica de cálculo de totales y descuento de inventario.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VentaService {
    
    private static final Logger log = LoggerFactory.getLogger(VentaService.class);
    
    /** ID por defecto para caja cuando la tabla no existe (modo desarrollo H2) */
    private static final Long DEFAULT_CAJA_ID = 1L;
    
    /** ID por defecto para turno cuando la tabla no existe (modo desarrollo H2) */
    private static final Long DEFAULT_TURNO_ID = 1L;
    
    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final SucursalRepository sucursalRepository;
    private final InventarioMovimientoRepository inventarioMovimientoRepository;
    private final RecetaRepository recetaRepository;
    private final IngredienteRepository ingredienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final WebSocketNotificationService notificationService;

    @PersistenceContext
    private EntityManager entityManager;
    
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
        List<Venta> ventas = ventaRepository.findByFechaBetween(fechaInicio, fechaFin);
        System.out.println("🔍 [VentaService] obtenerPorRangoFechas: encontradas " + ventas.size() + " ventas");
        ventas.forEach(v -> System.out.println("  - Venta ID: " + v.getId() + ", Items: " + (v.getItems() != null ? v.getItems().size() : 0)));
        
        List<VentaDTO> resultado = ventas.stream()
            .map(this::toDTO)
            .toList();
        
        System.out.println("🔍 [VentaService] Retornando " + resultado.size() + " VentaDTO");
        return resultado;
    }
    
    @Transactional // Permite escritura (sobrescribe readOnly=true de la clase)
    public VentaDTO crearVenta(CrearVentaRequest request) {
        LocalDateTime ahora = LocalDateTime.now();
        
        // 1. Crear la venta principal
        Venta venta = Venta.builder()
            .fecha(ahora)
            .canal(request.canal())
            .estado("cerrada")
            .nota(request.nota())
            .impuestos(BigDecimal.ZERO) // TODO: Implementar IVA
            .descuento(BigDecimal.ZERO) // TODO: Implementar descuentos
            .build();

        // Asignar caja por compatibilidad con esquema actual (Railway exige caja_id NOT NULL)
        // Si no viene en la request, usar un valor por defecto (1L) temporalmente.
        Long cajaId = null;
        try { cajaId = request.cajaId(); } catch (Exception ignored) {}
        if (cajaId == null) {
            cajaId = seleccionarCajaActiva(request.sucursalId());
            log.warn("crearVenta(): cajaId no proporcionado; resolviendo caja activa -> {}", cajaId);
        }
        venta.setCajaId(cajaId);

        // Asignar turno (NOT NULL en Railway). Si no viene, usar 1L hasta implementar gestión de turnos.
        Long turnoId = null;
        try { turnoId = request.turnoId(); } catch (Exception ignored) {}
        if (turnoId == null) {
            turnoId = seleccionarTurnoActivo(request.sucursalId(), cajaId);
            log.warn("crearVenta(): turnoId no proporcionado; resolviendo turno activo -> {}", turnoId);
        }
        venta.setTurnoId(turnoId);
        
        // 2. Asignar sucursal si se proporciona
        if (request.sucursalId() != null) {
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + request.sucursalId()));
            venta.setSucursal(sucursal);
        }
        
        // 2.1. Asignar usuario actual si está autenticado
        Usuario usuarioActual = obtenerUsuarioActual();
        if (usuarioActual != null) {
            venta.setUsuario(usuarioActual);
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

            // Construir nombre completo del producto (con variante si aplica)
            String nombreCompleto = itemDTO.productoNombre();
            if (nombreCompleto == null || nombreCompleto.isBlank()) {
                // Si no se proporciona nombre, construir desde el producto
                if (producto.getProductoBase() != null) {
                    // Es una variante, construir nombre completo
                    Producto productoBase = producto.getProductoBase();
                    nombreCompleto = productoBase.getNombre() + " - " + 
                        (producto.getNombreVariante() != null ? producto.getNombreVariante() : producto.getNombre());
                } else {
                    nombreCompleto = producto.getNombre();
                }
            }
            
            VentaItem item = VentaItem.builder()
                .producto(producto)
                .productoNombre(nombreCompleto)
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
        // COMENTADO TEMPORALMENTE: No implementado aún en H2
        // try {
        //     descontarInventario(ventaGuardada);
        // } catch (Exception e) {
        //     org.slf4j.LoggerFactory.getLogger(VentaService.class)
        //         .warn("No se pudo descontar inventario (posiblemente en modo desarrollo H2): {}", e.getMessage());
        // }
        
        VentaDTO ventaDTO = toDTO(ventaGuardada);
        
        // 7. Notificar creación de venta en tiempo real (después del commit)
        // Usar TransactionSynchronizationManager para enviar después del commit
        long inicioNotificacion = System.currentTimeMillis();
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
            new org.springframework.transaction.support.TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    long tiempoCommit = System.currentTimeMillis() - inicioNotificacion;
                    log.info("Venta {} confirmada en BD. Tiempo transacción: {}ms. Enviando notificación WebSocket...", 
                            ventaGuardada.getId(), tiempoCommit);
                    
                    long inicioNotif = System.currentTimeMillis();
                    if (notificationService != null) {
                        notificationService.notificarVentaCreada(ventaGuardada.getId(), ventaDTO);
                        long tiempoNotif = System.currentTimeMillis() - inicioNotif;
                        log.info("Notificación WebSocket enviada para venta {}. Tiempo notificación: {}ms", 
                                ventaGuardada.getId(), tiempoNotif);
                    }
                }
            }
        );
        
        return ventaDTO;
    }

    /**
     * Verifica si una tabla existe en la base de datos usando metadatos JDBC.
     * Este método NO afecta el estado transaccional porque usa solo metadatos.
     */
    private boolean existeTabla(String nombreTabla) {
        try {
            // Usar JDBC metadata para verificar existencia de tabla sin ejecutar query
            var connection = entityManager.unwrap(java.sql.Connection.class);
            var metaData = connection.getMetaData();
            // Buscar la tabla en mayúsculas y minúsculas (H2 usa mayúsculas, PostgreSQL minúsculas)
            try (var rs = metaData.getTables(null, null, nombreTabla.toUpperCase(), new String[]{"TABLE"})) {
                if (rs.next()) return true;
            }
            try (var rs = metaData.getTables(null, null, nombreTabla.toLowerCase(), new String[]{"TABLE"})) {
                if (rs.next()) return true;
            }
        } catch (Exception e) {
            log.debug("Error verificando existencia de tabla '{}': {}", nombreTabla, e.getMessage());
        }
        return false;
    }

    /**
     * Selecciona una caja activa preferentemente por sucursal. Si no hay activa, toma cualquiera.
     * Retorna ID por defecto si la tabla no existe (modo desarrollo H2).
     */
    private Long seleccionarCajaActiva(Long sucursalId) {
        // Verificar si la tabla cajas existe antes de ejecutar queries
        if (!existeTabla("cajas")) {
            log.warn("Tabla 'cajas' no existe. Usando cajaId por defecto = {} (modo desarrollo H2)", DEFAULT_CAJA_ID);
            return DEFAULT_CAJA_ID;
        }

        // Intentar por sucursal y activa
        try {
            var query = new StringBuilder("select id from cajas where activa = true");
            if (sucursalId != null) {
                query.append(" and sucursal_id = :suc");
            }
            query.append(" order by id limit 1");
            var q = entityManager.createNativeQuery(query.toString());
            if (sucursalId != null) q.setParameter("suc", sucursalId);
            var res = q.getResultList();
            if (!res.isEmpty()) {
                return ((Number) res.getFirst()).longValue();
            }
        } catch (Exception e) {
            log.debug("Error buscando caja activa por sucursal: {}", e.getMessage());
        }

        // Cualquiera activa
        try {
            var res = entityManager.createNativeQuery("select id from cajas where activa = true order by id limit 1")
                .getResultList();
            if (!res.isEmpty()) return ((Number) res.getFirst()).longValue();
        } catch (Exception e) {
            log.debug("Error buscando cualquier caja activa: {}", e.getMessage());
        }

        // Cualquiera existente
        try {
            var res = entityManager.createNativeQuery("select id from cajas order by id limit 1").getResultList();
            if (!res.isEmpty()) return ((Number) res.getFirst()).longValue();
        } catch (Exception e) {
            log.debug("Error buscando cualquier caja: {}", e.getMessage());
        }

        // Fallback: retornar ID por defecto
        log.warn("No se encontró ninguna caja. Usando cajaId por defecto = {}", DEFAULT_CAJA_ID);
        return DEFAULT_CAJA_ID;
    }

    /**
     * Selecciona un turno activo preferentemente por caja/sucursal. Si no hay activo, toma el más reciente.
     * Retorna ID por defecto si la tabla no existe (modo desarrollo H2).
     */
    private Long seleccionarTurnoActivo(Long sucursalId, Long cajaId) {
        // Verificar si la tabla turnos existe antes de ejecutar queries
        if (!existeTabla("turnos")) {
            log.warn("Tabla 'turnos' no existe. Usando turnoId por defecto = {} (modo desarrollo H2)", DEFAULT_TURNO_ID);
            return DEFAULT_TURNO_ID;
        }

        // Intentar activo por caja
        try {
            var sb = new StringBuilder("select id from turnos where activo = true");
            if (cajaId != null) sb.append(" and caja_id = :caja");
            if (sucursalId != null) sb.append(" and sucursal_id = :suc");
            sb.append(" order by fecha_apertura desc limit 1");
            var q = entityManager.createNativeQuery(sb.toString());
            if (cajaId != null) q.setParameter("caja", cajaId);
            if (sucursalId != null) q.setParameter("suc", sucursalId);
            var res = q.getResultList();
            if (!res.isEmpty()) return ((Number) res.getFirst()).longValue();
        } catch (Exception e) {
            log.debug("Error buscando turno activo por caja/sucursal: {}", e.getMessage());
        }

        // Activo cualquiera
        try {
            var res = entityManager.createNativeQuery("select id from turnos where activo = true order by fecha_apertura desc limit 1")
                .getResultList();
            if (!res.isEmpty()) return ((Number) res.getFirst()).longValue();
        } catch (Exception e) {
            log.debug("Error buscando cualquier turno activo: {}", e.getMessage());
        }

        // El más reciente
        try {
            var res = entityManager.createNativeQuery("select id from turnos order by fecha_apertura desc nulls last, id desc limit 1").getResultList();
            if (!res.isEmpty()) return ((Number) res.getFirst()).longValue();
        } catch (Exception e) {
            log.debug("Error buscando turno más reciente: {}", e.getMessage());
        }

        // Fallback: retornar ID por defecto
        log.warn("No se encontró ningún turno. Usando turnoId por defecto = {}", DEFAULT_TURNO_ID);
        return DEFAULT_TURNO_ID;
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
    
    /**
     * Cancela una venta y revierte los movimientos de inventario asociados.
     * Solo permite cancelar ventas del día actual o recientes (configurable).
     * 
     * @param ventaId ID de la venta a cancelar
     * @param motivo Motivo de la cancelación (obligatorio)
     * @return VentaDTO de la venta cancelada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException si la venta ya está cancelada o es muy antigua
     */
    @Transactional
    public VentaDTO cancelarVenta(Long ventaId, String motivo) {
        if (motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        }
        
        // Buscar la venta
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));
        
        // Validar que no esté ya cancelada
        if ("cancelada".equals(venta.getEstado())) {
            throw new IllegalArgumentException("La venta ya está cancelada");
        }
        
        // Validar restricción temporal: solo cancelar ventas del día actual o recientes (últimas 24 horas)
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime limiteCancelacion = ahora.minusHours(24);
        if (venta.getFecha().isBefore(limiteCancelacion)) {
            throw new IllegalArgumentException(
                "No se pueden cancelar ventas con más de 24 horas de antigüedad. " +
                "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador."
            );
        }
        
        // Obtener usuario actual para auditoría
        Usuario usuarioCancelacion = obtenerUsuarioActual();
        
        // Revertir movimientos de inventario si existen
        revertirMovimientosInventario(venta);
        
    // Cambiar estado a cancelada
    venta.setEstado("cancelada");
        
        // Guardar motivo en la nota (o actualizar nota existente)
        String notaCancelacion = String.format(
            "[cancelada] Motivo: %s | Usuario: %s | Fecha: %s",
            motivo.trim(),
            usuarioCancelacion != null ? usuarioCancelacion.getNombre() : "Sistema",
            ahora
        );
        
        if (venta.getNota() != null && !venta.getNota().isEmpty()) {
            venta.setNota(venta.getNota() + "\n" + notaCancelacion);
        } else {
            venta.setNota(notaCancelacion);
        }
        
        Venta ventaCancelada = ventaRepository.save(venta);
        return toDTO(ventaCancelada);
    }
    
    /**
     * Revierte los movimientos de inventario generados por una venta.
     * Crea movimientos de tipo "ENTRADA" (devolución) para compensar los "EGRESO" (consumo).
     */
    private void revertirMovimientosInventario(Venta venta) {
        // Buscar todos los movimientos de inventario relacionados con esta venta
        List<InventarioMovimiento> movimientosVenta = inventarioMovimientoRepository
            .findByRefTipoAndRefId("venta", venta.getId());
        
        if (movimientosVenta.isEmpty()) {
            // No hay movimientos de inventario que revertir (producto sin receta)
            return;
        }
        
        LocalDateTime ahora = LocalDateTime.now();
        
        // Crear movimientos de reversión (ENTRADA) para cada movimiento de consumo (EGRESO)
        for (InventarioMovimiento movimientoOriginal : movimientosVenta) {
            // Solo revertir movimientos de tipo EGRESO (consumo)
            if (!"EGRESO".equals(movimientoOriginal.getTipo())) {
                continue; // Saltar otros tipos de movimientos
            }
            
            // Crear movimiento de reversión (ENTRADA)
            InventarioMovimiento movimientoReversion = InventarioMovimiento.builder()
                .ingrediente(movimientoOriginal.getIngrediente())
                .tipo("ENTRADA") // Devolución al inventario
                .cantidad(movimientoOriginal.getCantidad())
                .unidad(movimientoOriginal.getUnidad())
                .costoUnitario(movimientoOriginal.getCostoUnitario())
                .costoTotal(movimientoOriginal.getCostoTotal())
                .fecha(ahora)
                .refTipo("venta_cancelada")
                .refId(venta.getId())
                .nota("Reversión de consumo por cancelación de venta #" + venta.getId())
                .build();
            
            inventarioMovimientoRepository.save(movimientoReversion);
        }
    }
    
    /**
     * Actualiza una venta existente, revirtiendo y recalculando movimientos de inventario.
     * Solo permite editar ventas de las últimas 24 horas y que no estén canceladas.
     * 
     * @param ventaId ID de la venta a actualizar
     * @param request Datos actualizados de la venta
     * @return VentaDTO de la venta actualizada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException si la venta está cancelada o es muy antigua
     */
    @Transactional
    public VentaDTO actualizarVenta(Long ventaId, ActualizarVentaRequest request) {
        // Buscar la venta
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));
        
        // Validar que no esté cancelada
        if ("cancelada".equals(venta.getEstado())) {
            throw new IllegalArgumentException("No se puede editar una venta cancelada");
        }
        
        // Validar restricción temporal: solo editar ventas del día actual o recientes (últimas 24 horas)
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime limiteEdicion = ahora.minusHours(24);
        if (venta.getFecha().isBefore(limiteEdicion)) {
            throw new IllegalArgumentException(
                "No se pueden editar ventas con más de 24 horas de antigüedad. " +
                "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador."
            );
        }
        
        // Obtener usuario actual para auditoría
        Usuario usuarioEdicion = obtenerUsuarioActual();
        
        // 1. Revertir movimientos de inventario anteriores
        revertirMovimientosInventario(venta);
        
        // 2. Actualizar sucursal si se proporciona
        if (request.sucursalId() != null) {
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + request.sucursalId()));
            venta.setSucursal(sucursal);
        }
        
        // 3. Limpiar items y pagos existentes (orphanRemoval los eliminará automáticamente)
        venta.getItems().clear();
        venta.getPagos().clear();
        
        // 4. Procesar nuevos items y calcular subtotal
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (VentaItemDTO itemDTO : request.items()) {
            Producto producto = productoRepository.findById(itemDTO.productoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemDTO.productoId()));

            // Calcular subtotal del item (precio * cantidad)
            BigDecimal precioUnitario = itemDTO.precioUnitario() != null
                ? itemDTO.precioUnitario()
                : producto.getPrecio();

            BigDecimal subtotalItem = precioUnitario.multiply(BigDecimal.valueOf(itemDTO.cantidad()));

            // Calcular costo estimado del item
            BigDecimal costoEstimadoProducto = producto.getCostoEstimado();
            BigDecimal costoItem = null;
            if (costoEstimadoProducto != null) {
                costoItem = costoEstimadoProducto.multiply(BigDecimal.valueOf(itemDTO.cantidad()));
            }

            // Construir nombre completo del producto (con variante si aplica)
            String nombreCompleto = itemDTO.productoNombre();
            if (nombreCompleto == null || nombreCompleto.isBlank()) {
                // Si no se proporciona nombre, construir desde el producto
                if (producto.getProductoBase() != null) {
                    // Es una variante, construir nombre completo
                    Producto productoBase = producto.getProductoBase();
                    nombreCompleto = productoBase.getNombre() + " - " + 
                        (producto.getNombreVariante() != null ? producto.getNombreVariante() : producto.getNombre());
                } else {
                    nombreCompleto = producto.getNombre();
                }
            }
            
            VentaItem item = VentaItem.builder()
                .producto(producto)
                .productoNombre(nombreCompleto)
                .cantidad(itemDTO.cantidad())
                .precioUnitario(precioUnitario)
                .subtotal(subtotalItem)
                .costoEstimado(costoItem)
                .nota(itemDTO.nota())
                .build();

            venta.addItem(item);
            subtotal = subtotal.add(subtotalItem);
        }
        
        venta.setSubtotal(subtotal);
        venta.setTotal(subtotal); // Por ahora sin impuestos ni descuentos
        
        // 5. Procesar nuevos pagos y validar que cubran el total
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
        
        // 6. Actualizar campos adicionales
        String notaEdicion = String.format(
            "[EDITADA] Usuario: %s | Fecha: %s",
            usuarioEdicion != null ? usuarioEdicion.getNombre() : "Sistema",
            ahora
        );
        
        String notaAnterior = venta.getNota() != null && !venta.getNota().isEmpty() 
            ? venta.getNota() 
            : "Sin nota";
        
        if (request.nota() != null && !request.nota().trim().isEmpty()) {
            venta.setNota(request.nota() + "\n" + notaEdicion + " | Nota anterior: " + notaAnterior);
        } else {
            venta.setNota(notaAnterior + "\n" + notaEdicion);
        }
        
        if (request.canal() != null) {
            venta.setCanal(request.canal());
        }

        // Actualizar fecha si se proporciona
        if (request.fecha() != null && !request.fecha().isBlank()) {
            try {
                // Parsear la fecha del formato ISO (yyyy-MM-dd'T'HH:mm:ss)
                LocalDateTime nuevaFecha = LocalDateTime.parse(request.fecha(), java.time.format.DateTimeFormatter.ISO_DATE_TIME);
                venta.setFecha(nuevaFecha);
            } catch (Exception e) {
                log.warn("Error al parsear la fecha: {}", request.fecha(), e);
                // Si hay error, mantener la fecha original
            }
        }
        
        // 7. Guardar la venta actualizada
        Venta ventaActualizada = ventaRepository.save(venta);
        
        // 8. Generar nuevos movimientos de inventario con los items actualizados
        descontarInventario(ventaActualizada);
        
        return toDTO(ventaActualizada);
    }
    
    /**
     * Obtiene el usuario actual autenticado desde el SecurityContext.
     */
    private Usuario obtenerUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                return usuarioRepository.findByUsername(auth.getName()).orElse(null);
            }
        } catch (Exception e) {
            // Si hay error obteniendo el usuario, continuar sin él
        }
        return null;
    }
    
    /**
     * Obtiene el desglose de ventas por método de pago para un rango de fechas.
     * Solo cuenta ventas con estado 'cerrada'.
     * 
     * @param inicio Fecha y hora de inicio del período
     * @param fin Fecha y hora de fin del período
     * @return Lista de DesglosePagoDTO con el total por cada método de pago
     */
    public List<DesglosePagoDTO> obtenerDesglosePorMetodoPago(LocalDateTime inicio, LocalDateTime fin) {
        List<Object[]> resultados = ventaRepository.sumByMetodoPago(inicio, fin);
        
        return resultados.stream()
            .map(row -> new DesglosePagoDTO(
                (String) row[0],           // nombre del método de pago
                (BigDecimal) row[1]        // total
            ))
            .toList();
    }
    
    /**
     * Actualiza la fecha de una venta existente.
     * Solo permite actualizar ventas de las últimas 24 horas y que no estén canceladas.
     * 
     * @param ventaId ID de la venta a actualizar
     * @param nuevaFecha Nueva fecha para la venta (LocalDateTime)
     * @return VentaDTO actualizada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException si la venta está cancelada o es muy antigua
     */
    @Transactional
    public VentaDTO actualizarFechaVenta(Long ventaId, LocalDateTime nuevaFecha) {
        // Buscar la venta
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));
        
        // Validar que no esté cancelada
        if ("cancelada".equals(venta.getEstado())) {
            throw new IllegalArgumentException("No se puede editar una venta cancelada");
        }
        
        // Obtener usuario actual para verificar permisos
        Usuario usuarioActual = obtenerUsuarioActual();
        boolean esAdmin = usuarioActual != null && "ADMIN".equals(usuarioActual.getRol().getNombre());
        
        // Obtener la hora actual para auditoría
        LocalDateTime ahora = LocalDateTime.now();
        
        // Validar restricción temporal: solo editar ventas del día actual o recientes (últimas 24 horas)
        // Los ADMIN NO tienen esta restricción
        if (!esAdmin) {
            LocalDateTime limiteEdicion = ahora.minusHours(24);
            if (venta.getFecha().isBefore(limiteEdicion)) {
                throw new IllegalArgumentException(
                    "No se pueden editar ventas con más de 24 horas de antigüedad. " +
                    "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador."
                );
            }
            
            // Validar que la nueva fecha no sea demasiado antigua
            if (nuevaFecha.isBefore(limiteEdicion)) {
                throw new IllegalArgumentException(
                    "No se puede cambiar la fecha a una anterior a " + limiteEdicion + 
                    " (más de 24 horas atrás)"
                );
            }
        }
        
        // Obtener usuario actual para auditoría (ya obtenido anteriormente, se reutiliza)
        Usuario usuarioEdicion = usuarioActual;
        
        // Actualizar la fecha
        LocalDateTime fechaAnterior = venta.getFecha();
        venta.setFecha(nuevaFecha);
        
        // Agregar nota de auditoría
        String notaEdicion = String.format(
            "[FECHA ACTUALIZADA] Anterior: %s | Nueva: %s | Usuario: %s | Fecha de cambio: %s",
            fechaAnterior,
            nuevaFecha,
            usuarioEdicion != null ? usuarioEdicion.getNombre() : "Sistema",
            ahora
        );
        
        String notaAnterior = venta.getNota() != null && !venta.getNota().isEmpty() 
            ? venta.getNota() 
            : "Sin nota";
        
        venta.setNota(notaAnterior + "\n" + notaEdicion);
        
        // Guardar y retornar
        venta = ventaRepository.save(venta);
        log.info("actualizarFechaVenta(): Venta {} actualizada de {} a {}", ventaId, fechaAnterior, nuevaFecha);
        
        return toDTO(venta);
    }

    /**
     * Elimina definitivamente una venta y todos sus registros asociados.
     * SOLO ADMIN puede ejecutar esta operación.
     * 
     * Esta operación es IRREVERSIBLE y eliminará:
     * - La venta
     * - Todos los items de la venta
     * - Todos los pagos de la venta
     * - Los movimientos de inventario asociados
     * 
     * @param ventaId ID de la venta a eliminar
     * @throws ResourceNotFoundException si la venta no existe
     */
    @Transactional
    public void eliminarVenta(Long ventaId) {
        log.info("eliminarVenta(): eliminando venta con ID {}", ventaId);
        
        // Verificar que la venta existe
        Venta venta = ventaRepository.findById(ventaId)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));
        
        // Eliminar movimientos de inventario asociados (si existen)
        List<InventarioMovimiento> movimientos = inventarioMovimientoRepository
            .findByRefTipoAndRefId("venta", ventaId);
        
        if (!movimientos.isEmpty()) {
            log.info("Eliminando {} movimientos de inventario asociados a la venta {}", 
                    movimientos.size(), ventaId);
            inventarioMovimientoRepository.deleteAll(movimientos);
        }
        
        // Eliminar la venta (cascade eliminará items y pagos automáticamente)
        ventaRepository.delete(venta);
        
        log.info("Venta {} eliminada definitivamente del sistema", ventaId);
    }
}
