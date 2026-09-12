package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Servicio para gestión de ventas.
 * Incluye lógica de cálculo de totales y descuento de inventario.
 */
@Slf4j
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
    private final UsuarioRepository usuarioRepository;
    private final WebSocketNotificationService notificationService;
    private final EstadisticasService estadisticasService;
    private final CajaRepository cajaRepository;
    private final TurnoRepository turnoRepository;

    /**
     * ✅ SEGREGACIÓN: Obtener solo ventas de la sucursal del usuario actual
     * 🔧 OPTIMIZACIÓN: Usa paginación en BD (no en memoria)
     * 📅 FILTRO: Filtra por rango de fechas (por defecto, hoy)
     */
    public List<VentaDTO> obtenerTodas(int page, int size, String desde, String hasta) {
        Long sucursalId = SucursalContext.getSucursalId();

        // Si no se especifican fechas, usar hoy (00:00:00 a 23:59:59)
        LocalDateTime fechaDesde = desde != null
                ? LocalDateTime.parse(desde + "T00:00:00")
                : LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        LocalDateTime fechaHasta = hasta != null
                ? LocalDateTime.parse(hasta + "T23:59:59")
                : LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // Crear pageable con ordenamiento por fecha DESC (más recientes primero)
        Pageable pageable = PageRequest.of(page, size);

        // Usar paginación directa de BD con filtro de fechas (MUCHO más eficiente)
        Page<Venta> pageResult = ventaRepository.findBySucursalIdAndFechaRangePageable(
                sucursalId, fechaDesde, fechaHasta, pageable);

        log.info("📄 Obtener página {} de ventas para sucursal {} (desde {} hasta {}). Total: {} registros",
                page, sucursalId, fechaDesde, fechaHasta, pageResult.getTotalElements());

        return pageResult.getContent().stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Sobrecarga para compatibilidad (sin fechas, carga solo de hoy)
     */
    public List<VentaDTO> obtenerTodas(int page, int size) {
        return obtenerTodas(page, size, null, null);
    }

    public VentaDTO obtenerPorId(Long id) {
        // ✅ SEGREGACIÓN: Validar que la venta pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();

        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));

        // Validar que pertenece a la sucursal del usuario
        if (venta.getSucursal() == null || !venta.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Venta no encontrada en su sucursal");
        }
        return toDTO(venta);
    }

    /**
     * ✅ SEGREGACIÓN: Obtener ventas por estado en la sucursal del usuario actual
     */
    public List<VentaDTO> obtenerPorEstado(String estado) {
        Long sucursalId = SucursalContext.getSucursalId();
        return ventaRepository.findBySucursalIdAndEstado(sucursalId, estado).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<VentaDTO> obtenerPorSucursal(Long sucursalId) {
        return ventaRepository.findBySucursalId(sucursalId).stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * ✅ SEGREGACIÓN: Obtener ventas por rango de fechas en la sucursal del usuario
     * actual
     */
    public List<VentaDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        Long sucursalId = SucursalContext.getSucursalId();
        List<Venta> ventas = ventaRepository.findBySucursalAndFechaBetween(sucursalId, fechaInicio, fechaFin);
        System.out.println("🔍 [VentaService] obtenerPorRangoFechas: encontradas " + ventas.size()
                + " ventas en sucursal " + sucursalId);
        ventas.forEach(v -> System.out.println(
                "  - Venta ID: " + v.getId() + ", Items: " + (v.getItems() != null ? v.getItems().size() : 0)));

        List<VentaDTO> resultado = ventas.stream()
                .map(this::toDTO)
                .toList();

        System.out.println("🔍 [VentaService] Retornando " + resultado.size() + " VentaDTO");
        return resultado;
    }

    @Transactional // Permite escritura (sobrescribe readOnly=true de la clase)
    public VentaDTO crearVenta(CrearVentaRequest request) {
        // ✅ SEGREGACIÓN: Auto-obtener sucursal del usuario actual
        Long sucursalId = SucursalContext.getSucursalId();

        // Usar zona horaria de México (UTC-6) para timestamps correctos
        LocalDateTime ahora = LocalDateTime.now(java.time.ZoneId.of("America/Mexico_City"));

        // 1. Crear la venta principal
        Venta venta = Venta.builder()
                .fecha(ahora)
                .canal(request.canal())
                .estado("cerrada")
                .nota(request.nota())
                .impuestos(BigDecimal.ZERO) // TODO: Implementar IVA
                .descuento(BigDecimal.ZERO) // TODO: Implementar descuentos
                .build();

        // Asignar caja (Railway exige caja_id NOT NULL). Si no viene en la request,
        // resolver caja activa de la sucursal (Auditoría 2026-09-11, A5/T1.4).
        Long cajaId = request.cajaId();
        if (cajaId == null) {
            cajaId = seleccionarCajaActiva(sucursalId);
            log.warn("crearVenta(): cajaId no proporcionado; resolviendo caja activa -> {}", cajaId);
        }
        venta.setCajaId(cajaId);

        // Asignar turno (NOT NULL en Railway). Si no viene, resolver turno activo.
        Long turnoId = request.turnoId();
        if (turnoId == null) {
            turnoId = seleccionarTurnoActivo(sucursalId, cajaId);
            log.warn("crearVenta(): turnoId no proporcionado; resolviendo turno activo -> {}", turnoId);
        }
        venta.setTurnoId(turnoId);

        // 2. Asignar sucursal
        // ✅ SEGREGACIÓN: Usar sucursal del contexto (del JWT) o de la request si es
        // admin
        Long sucursalIdFinal = sucursalId; // Del contexto
        if (request.sucursalId() != null && !request.sucursalId().equals(sucursalId)) {
            // Si viene diferente en la request y es admin, usar la del contexto por
            // seguridad
            log.warn("⚠️ Request especificó sucursalId {} pero contexto tiene {}, usando contexto",
                    request.sucursalId(), sucursalId);
        }

        Sucursal sucursal = sucursalRepository.findById(sucursalIdFinal)
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con ID: " + sucursalIdFinal));
        venta.setSucursal(sucursal);

        // 2.1. Asignar usuario actual si está autenticado
        Usuario usuarioActual = obtenerUsuarioActual();
        if (usuarioActual != null) {
            venta.setUsuario(usuarioActual);
        }

        // 3. Procesar items y calcular subtotal
        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaItemDTO itemDTO : request.items()) {
            Producto producto = productoRepository.findById(itemDTO.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado con ID: " + itemDTO.productoId()));

            // Auditoría 2026-09-11 (C1): validar cantidad positiva
            if (itemDTO.cantidad() == null || itemDTO.cantidad() <= 0) {
                throw new IllegalArgumentException(
                        "La cantidad del producto '" + producto.getNombre() + "' debe ser mayor a 0");
            }

            // Auditoría 2026-09-11 (C1): el precio SIEMPRE se resuelve en servidor.
            // Override del request SOLO para ADMIN/GERENTE (con registro).
            BigDecimal precioUnitario = resolverPrecioUnitarioServidor(itemDTO, producto, usuarioActual);

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
                            (producto.getNombreVariante() != null ? producto.getNombreVariante()
                                    : producto.getNombre());
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

        // Aplicar descuento y calcular total
        // Auditoría 2026-09-11 (C1): descuento validado en servidor; cajero máx 10%
        BigDecimal descuentoAplicado = request.descuento() != null ? request.descuento() : BigDecimal.ZERO;
        validarDescuento(descuentoAplicado, subtotal, usuarioActual);
        venta.setDescuento(descuentoAplicado);

        // Total = Subtotal - Descuento + Impuestos
        BigDecimal totalConDescuento = subtotal.subtract(descuentoAplicado);
        venta.setTotal(totalConDescuento.compareTo(BigDecimal.ZERO) > 0 ? totalConDescuento : BigDecimal.ZERO);

        log.info("💰 Venta: Subtotal=${}, Descuento=${}, Total=${}",
                subtotal, descuentoAplicado, venta.getTotal());

        // 4. Procesar pagos y validar que cubran el total
        BigDecimal totalPagos = BigDecimal.ZERO;

        for (PagoDTO pagoDTO : request.pagos()) {
            MetodoPago metodoPago = metodoPagoRepository.findById(pagoDTO.metodoPagoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Método de pago no encontrado con ID: " + pagoDTO.metodoPagoId()));

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
            throw new IllegalArgumentException(
                    "El total de pagos (" + totalPagos + ") no cubre el total de la venta (" + venta.getTotal() + ")");
        }

        // 5. Guardar la venta
        Venta ventaGuardada = ventaRepository.save(venta);

        // ✅ INVALIDAR CACHES DE REPORTES (después de guardar exitosamente)
        estadisticasService.invalidarCachesReportes();

        // 6. Descontar inventario automáticamente (consumo por recetas)
        // Auditoría 2026-09-11 (C2): reactivado; valida stock y descuenta en la
        // misma transacción (rollback total si falla).
        descontarInventario(ventaGuardada);

        VentaDTO ventaDTO = toDTO(ventaGuardada);

        // 7. Notificar creación de venta en tiempo real (después del commit)
        // Usar TransactionSynchronizationManager para enviar después del commit
        long inicioNotificacion = System.currentTimeMillis();
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        long tiempoCommit = System.currentTimeMillis() - inicioNotificacion;
                        org.slf4j.LoggerFactory.getLogger(VentaService.class)
                                .info("Venta {} confirmada en BD. Tiempo transacción: {}ms. Enviando notificación WebSocket...",
                                        ventaGuardada.getId(), tiempoCommit);

                        long inicioNotif = System.currentTimeMillis();
                        if (notificationService != null) {
                            notificationService.notificarVentaCreada(ventaGuardada.getId(), ventaDTO);
                            long tiempoNotif = System.currentTimeMillis() - inicioNotif;
                            org.slf4j.LoggerFactory.getLogger(VentaService.class)
                                    .info("Notificación WebSocket enviada para venta {}. Tiempo notificación: {}ms",
                                            ventaGuardada.getId(), tiempoNotif);
                        }
                    }
                });

        return ventaDTO;
    }

    /**
     * Selecciona la caja activa de la sucursal. Lanza IllegalStateException si no
     * existe ninguna (Auditoría 2026-09-11, A5/T1.4: sin fallback silencioso).
     */
    private Long seleccionarCajaActiva(Long sucursalId) {
        return cajaRepository.findFirstBySucursalIdAndActivaTrueOrderByIdAsc(sucursalId)
                .map(Caja::getId)
                .orElseThrow(() -> new IllegalStateException(
                        "No existe una caja activa para la sucursal " + sucursalId));
    }

    /**
     * Selecciona el turno activo de la caja (o de la sucursal si la caja no
     * tiene). Lanza IllegalStateException si no existe ninguno (Auditoría
     * 2026-09-11, A5/T1.4: sin fallback silencioso).
     */
    private Long seleccionarTurnoActivo(Long sucursalId, Long cajaId) {
        Optional<Turno> turno = cajaId != null
                ? turnoRepository.findFirstByCajaIdAndActivoTrueOrderByFechaAperturaDesc(cajaId)
                : Optional.empty();
        if (turno.isEmpty()) {
            turno = turnoRepository.findFirstBySucursalIdAndActivoTrueOrderByFechaAperturaDesc(sucursalId);
        }
        return turno.map(Turno::getId)
                .orElseThrow(() -> new IllegalStateException(
                        "No existe un turno activo para la caja " + cajaId + " / sucursal " + sucursalId));
    }

    /**
     * Descuenta el inventario automáticamente basado en las recetas de los
     * productos vendidos.
     * Genera movimientos de inventario de tipo "EGRESO" por consumo y actualiza
     * stockActual del ingrediente.
     * Auditoría 2026-09-11 (C2): validación de stock + descuento dentro de la
     * transacción de la venta.
     * Calibración: la validación solo se activa para ingredientes ya trackeados
     * (existen movimientos ENTRADA/EGRESO).
     * Un ingrediente nunca registrado en inventario se descuenta igual pero sin
     * bloquear la venta (adopción progresiva).
     */
    private void descontarInventario(Venta venta) {
        LocalDateTime ahora = LocalDateTime.now(java.time.ZoneId.of("America/Mexico_City"));

        for (VentaItem item : venta.getItems()) {
            Producto producto = item.getProducto();
            int cantidadVendida = item.getCantidad();

            // Buscar recetas del producto (con ingrediente y unidad cargados)
            List<Receta> recetas = recetaRepository.findByProductoIdWithDetails(producto.getId());

            if (recetas.isEmpty()) {
                log.warn("Producto {} sin receta; no se descuenta inventario", producto.getId());
                continue;
            }

            for (Receta receta : recetas) {
                Ingrediente ingrediente = receta.getIngrediente();

                // Cantidad a consumir = cantidad_receta * cantidad_vendida (con merma
                // teórica)
                BigDecimal cantidadConsumir = receta.getCantidad()
                        .multiply(BigDecimal.valueOf(cantidadVendida));
                if (receta.getMermaTeorica() != null
                        && receta.getMermaTeorica().compareTo(BigDecimal.ZERO) > 0) {
                    cantidadConsumir = cantidadConsumir
                            .multiply(BigDecimal.ONE.add(receta.getMermaTeorica()));
                }

                if (receta.getUnidad() != null && ingrediente.getUnidadBase() != null
                        && !receta.getUnidad().getId().equals(ingrediente.getUnidadBase().getId())) {
                    log.warn("Receta del producto {} usa unidad distinta a la base del ingrediente {} (uso={}, base={}); "
                            + "asumiendo cantidades equivalentes (falta factor numérico de conversión)",
                            producto.getId(), ingrediente.getNombre(),
                            receta.getUnidad().getNombre(), ingrediente.getUnidadBase().getNombre());
                }

                BigDecimal stockActual = ingrediente.getStockActual() != null ? ingrediente.getStockActual()
                        : BigDecimal.ZERO;

                // Validación autocalibrante: solo trackeado (ya tiene historial en
                // inventario_movimientos)
                boolean trackeado = inventarioMovimientoRepository.existsByIngredienteId(ingrediente.getId());
                if (trackeado && stockActual.compareTo(cantidadConsumir) < 0) {
                    throw new IllegalStateException(String.format(
                            "Stock insuficiente de '%s': la venta requiere %s %s y hay %s %s",
                            ingrediente.getNombre(),
                            cantidadConsumir, receta.getUnidad() != null ? receta.getUnidad().getNombre() : "",
                            stockActual, ingrediente.getUnidadBase() != null ? ingrediente.getUnidadBase().getNombre() : ""));
                }

                // Descontar stock actual
                ingrediente.setStockActual(stockActual.subtract(cantidadConsumir));
                ingredienteRepository.save(ingrediente);

                // Costo del consumo
                BigDecimal costoUnitario = ingrediente.getCostoUnitarioBase() != null
                        ? ingrediente.getCostoUnitarioBase()
                        : BigDecimal.ZERO;
                BigDecimal costoTotal = cantidadConsumir.multiply(costoUnitario);

                // Movimiento de inventario (EGRESO por consumo)
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
            }
        }
    }

    /**
     * Resuelve el precio unitario del item en servidor (C1).
     * - Sin precio en request → precio de BD.
     * - Precio de request igual al de BD → precio de BD.
     * - Precio de request distinto + ADMIN/GERENTE → override permitido y
     * registrado.
     * - Precio de request distinto + CAJERO → se ignora, se usa precio de BD.
     */
    // package-private: visible para tests unitarios (T1.7)
    BigDecimal resolverPrecioUnitarioServidor(VentaItemDTO itemDTO, Producto producto, Usuario usuario) {
        BigDecimal precioBD = producto.getPrecio();
        BigDecimal solicitado = itemDTO.precioUnitario();
        if (solicitado == null || solicitado.compareTo(precioBD) == 0) {
            return precioBD;
        }
        String rol = usuario != null && usuario.getRol() != null ? usuario.getRol().getNombre() : "";
        if ("ADMIN".equalsIgnoreCase(rol) || "GERENTE".equalsIgnoreCase(rol)) {
            log.warn("PRECIO_OVERRIDE: producto={} (id={}) precioBD={} solicitado={} usuario={}",
                    producto.getNombre(), producto.getId(), precioBD, solicitado,
                    usuario != null ? usuario.getUsername() : "anonimo");
            return solicitado;
        }
        log.warn("Precio del request ignorado (rol sin permiso): producto={} (id={}) solicitado={} usado={}",
                producto.getNombre(), producto.getId(), solicitado, precioBD);
        return precioBD;
    }

    /**
     * Valida el descuento en servidor (C1).
     * Cajero/rol sin permiso: máximo 10% del subtotal. ADMIN/GERENTE: hasta
     * subtotal.
     */
    // package-private: visible para tests unitarios (T1.7)
    void validarDescuento(BigDecimal descuento, BigDecimal subtotal, Usuario usuario) {
        if (descuento.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El descuento no puede ser negativo");
        }
        if (descuento.compareTo(subtotal) > 0) {
            throw new IllegalArgumentException("El descuento no puede exceder el subtotal");
        }
        String rol = usuario != null && usuario.getRol() != null ? usuario.getRol().getNombre() : "";
        if (!"ADMIN".equalsIgnoreCase(rol) && !"GERENTE".equalsIgnoreCase(rol)) {
            BigDecimal maximo = subtotal.multiply(new BigDecimal("0.10"));
            if (descuento.compareTo(maximo) > 0) {
                throw new IllegalArgumentException(String.format(
                        "Descuento fuera de rango para cajero: máximo 10%% del subtotal ($%s), solicitado $%s",
                        maximo, descuento));
            }
        }
    }

    // Método helper para conversión a DTO
    private VentaDTO toDTO(Venta venta) {
        List<VentaItemDTO> itemsDTO = venta.getItems().stream()
                .map(item -> new VentaItemDTO(
                        item.getId(),
                        item.getProducto().getId(),
                        item.getProductoNombre(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getSubtotal(),
                        item.getCostoEstimado(),
                        item.getNota(),
                        item.getTamano() != null ? item.getTamano().getId() : null,
                        item.getTamanoNombre(),
                        item.getPrecioExtraTamano(),
                        null // atributosSeleccionados: cargar del servicio si es necesario
                ))
                .toList();

        List<PagoDTO> pagosDTO = venta.getPagos().stream()
                .map(pago -> new PagoDTO(
                        pago.getId(),
                        pago.getMetodoPago().getId(),
                        pago.getMetodoPago().getNombre(),
                        pago.getMonto(),
                        pago.getReferencia(),
                        pago.getFecha()))
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
                pagosDTO);
    }

    /**
     * Cancela una venta y revierte los movimientos de inventario asociados.
     * Solo permite cancelar ventas del día actual o recientes (configurable).
     * 
     * @param ventaId ID de la venta a cancelar
     * @param motivo  Motivo de la cancelación (obligatorio)
     * @return VentaDTO de la venta cancelada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException  si la venta ya está cancelada o es muy
     *                                   antigua
     */
    @Transactional // Permite escritura (sobrescribe readOnly=true de la clase)
    public VentaDTO cancelarVenta(Long ventaId, String motivo) {
        // ✅ SEGREGACIÓN: Validar que la venta pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();

        if (motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        }

        // Buscar la venta
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));

        // Validar que pertenece a la sucursal del usuario
        if (venta.getSucursal() == null || !venta.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Venta no encontrada en su sucursal");
        }

        // Validar que no esté ya cancelada
        if ("cancelada".equals(venta.getEstado())) {
            throw new IllegalArgumentException("La venta ya está cancelada");
        }

        // Validar restricción temporal: solo cancelar ventas del día actual o recientes
        // (últimas 24 horas)
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime limiteCancelacion = ahora.minusHours(24);
        if (venta.getFecha().isBefore(limiteCancelacion)) {
            throw new IllegalArgumentException(
                    "No se pueden cancelar ventas con más de 24 horas de antigüedad. " +
                            "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador.");
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
                ahora);

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
     * Crea movimientos de tipo "ENTRADA" (devolución) para compensar los "EGRESO"
     * (consumo).
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

// Crear movimiento de reversión (ENTRADA) para cada movimiento de consumo
            // (EGRESO)
            for (InventarioMovimiento movimientoOriginal : movimientosVenta) {
                // Solo revertir movimientos de tipo EGRESO (consumo)
                if (!"EGRESO".equals(movimientoOriginal.getTipo())) {
                    continue; // Saltar otros tipos de movimientos
                }

                // Auditoría 2026-09-11 (C2): restituir stockActual al revertir consumo
                Ingrediente ingrediente = movimientoOriginal.getIngrediente();
                BigDecimal stockActual = ingrediente.getStockActual() != null ? ingrediente.getStockActual()
                        : BigDecimal.ZERO;
                ingrediente.setStockActual(stockActual.add(movimientoOriginal.getCantidad()));
                ingredienteRepository.save(ingrediente);

                // Crear movimiento de reversión (ENTRADA)
                InventarioMovimiento movimientoReversion = InventarioMovimiento.builder()
                        .ingrediente(ingrediente)
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
     * Actualiza una venta existente, revirtiendo y recalculando movimientos de
     * inventario.
     * Solo permite editar ventas de las últimas 24 horas y que no estén canceladas.
     * 
     * @param ventaId ID de la venta a actualizar
     * @param request Datos actualizados de la venta
     * @return VentaDTO de la venta actualizada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException  si la venta está cancelada o es muy antigua
     */
    @Transactional
    public VentaDTO actualizarVenta(Long ventaId, ActualizarVentaRequest request) {
        // ✅ SEGREGACIÓN: Validar que la venta pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();

        // Buscar la venta
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));

        // Validar que la venta pertenece a la sucursal del usuario
        if (venta.getSucursal() == null || !venta.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Venta no encontrada en su sucursal");
        }

        // Validar que no esté cancelada
        if ("cancelada".equals(venta.getEstado())) {
            throw new IllegalArgumentException("No se puede editar una venta cancelada");
        }

        // Obtener usuario actual y hora actual para auditoría
        Usuario usuarioActual = obtenerUsuarioActual();
        LocalDateTime ahora = LocalDateTime.now();

        // Validar restricción temporal: solo editar ventas del día actual o recientes
        // (últimas 24 horas) - EXCEPTO para ADMIN que puede editar cualquier venta
        boolean esAdmin = usuarioActual.getRol() != null &&
                usuarioActual.getRol().getNombre().equalsIgnoreCase("ADMIN");

        if (!esAdmin) {
            LocalDateTime limiteEdicion = ahora.minusHours(24);
            if (venta.getFecha().isBefore(limiteEdicion)) {
                throw new IllegalArgumentException(
                        "No se pueden editar ventas con más de 24 horas de antigüedad. " +
                                "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador.");
            }
        }

        // Obtener usuario actual para auditoría
        Usuario usuarioEdicion = usuarioActual;

        // 1. Revertir movimientos de inventario anteriores
        revertirMovimientosInventario(venta);

        // 2. Actualizar sucursal si se proporciona (pero validar que sea la misma
        // sucursal del usuario)
        if (request.sucursalId() != null) {
            if (!request.sucursalId().equals(sucursalId)) {
                throw new IllegalArgumentException("No puede cambiar una venta a otra sucursal");
            }
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Sucursal no encontrada con ID: " + request.sucursalId()));
            venta.setSucursal(sucursal);
        }

        // 3. Limpiar items y pagos existentes (orphanRemoval los eliminará
        // automáticamente)
        venta.getItems().clear();
        venta.getPagos().clear();

        // 4. Procesar nuevos items y calcular subtotal
        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaItemDTO itemDTO : request.items()) {
            Producto producto = productoRepository.findById(itemDTO.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado con ID: " + itemDTO.productoId()));

            // Auditoría 2026-09-11 (C1): misma regla de precio servidor en edición
            if (itemDTO.cantidad() == null || itemDTO.cantidad() <= 0) {
                throw new IllegalArgumentException(
                        "La cantidad del producto '" + producto.getNombre() + "' debe ser mayor a 0");
            }

            BigDecimal precioUnitario = resolverPrecioUnitarioServidor(itemDTO, producto, usuarioActual);

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
                            (producto.getNombreVariante() != null ? producto.getNombreVariante()
                                    : producto.getNombre());
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

        // Aplicar descuento y calcular total
        // Auditoría 2026-09-11 (C1): descuento validado en servidor; cajero máx 10%
        BigDecimal descuentoAplicado = request.descuento() != null ? request.descuento() : BigDecimal.ZERO;
        validarDescuento(descuentoAplicado, subtotal, usuarioActual);
        venta.setDescuento(descuentoAplicado);

        // Total = Subtotal - Descuento + Impuestos
        BigDecimal totalConDescuento = subtotal.subtract(descuentoAplicado);
        venta.setTotal(totalConDescuento.compareTo(BigDecimal.ZERO) > 0 ? totalConDescuento : BigDecimal.ZERO);

        log.info("💰 Venta actualizada: Subtotal=${}, Descuento=${}, Total=${}",
                subtotal, descuentoAplicado, venta.getTotal());

        // 5. Procesar nuevos pagos y validar que cubran el total
        BigDecimal totalPagos = BigDecimal.ZERO;

        for (PagoDTO pagoDTO : request.pagos()) {
            MetodoPago metodoPago = metodoPagoRepository.findById(pagoDTO.metodoPagoId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Método de pago no encontrado con ID: " + pagoDTO.metodoPagoId()));

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
            throw new IllegalArgumentException(
                    "El total de pagos (" + totalPagos + ") no cubre el total de la venta (" + venta.getTotal() + ")");
        }

        // 6. Actualizar campos adicionales
        String notaEdicion = String.format(
                "[EDITADA] Usuario: %s | Fecha: %s",
                usuarioEdicion != null ? usuarioEdicion.getNombre() : "Sistema",
                ahora);

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
                LocalDateTime nuevaFecha = LocalDateTime.parse(request.fecha(),
                        java.time.format.DateTimeFormatter.ISO_DATE_TIME);
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
     * ✅ SEGREGACIÓN: Solo retorna datos de la sucursal del usuario actual
     * Solo cuenta ventas con estado 'cerrada'.
     * 
     * @param inicio Fecha y hora de inicio del período
     * @param fin    Fecha y hora de fin del período
     * @return Lista de DesglosePagoDTO con el total por cada método de pago de la
     *         sucursal
     */
    public List<DesglosePagoDTO> obtenerDesglosePorMetodoPago(LocalDateTime inicio, LocalDateTime fin) {
        Long sucursalId = SucursalContext.getSucursalId();

        // ✅ LOG: Debugging de fechas recibidas
        log.debug("[VentaService] obtenerDesglosePorMetodoPago - Sucursal: {}, Inicio: {}, Fin: {}",
                sucursalId, inicio, fin);

        List<Object[]> resultados = ventaRepository.sumByMetodoPago(sucursalId, inicio, fin);

        log.debug("[VentaService] Desglose por método de pago - Resultados encontrados: {}", resultados.size());
        if (resultados.isEmpty()) {
            log.warn("[VentaService] ⚠️ NO SE ENCONTRARON VENTAS en el rango [{}, {}] para sucursal {}",
                    inicio, fin, sucursalId);
        }

        return resultados.stream()
                .map(row -> new DesglosePagoDTO(
                        (String) row[0], // nombre del método de pago
                        (BigDecimal) row[1] // total
                ))
                .toList();
    }

    /**
     * Actualiza la fecha de una venta existente.
     * Solo permite actualizar ventas de las últimas 24 horas y que no estén
     * canceladas.
     * 
     * @param ventaId    ID de la venta a actualizar
     * @param nuevaFecha Nueva fecha para la venta (LocalDateTime)
     * @return VentaDTO actualizada
     * @throws ResourceNotFoundException si la venta no existe
     * @throws IllegalArgumentException  si la venta está cancelada o es muy antigua
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

        // Validar restricción temporal: solo editar ventas del día actual o recientes
        // (últimas 24 horas)
        // Los ADMIN NO tienen esta restricción
        if (!esAdmin) {
            LocalDateTime limiteEdicion = ahora.minusHours(24);
            if (venta.getFecha().isBefore(limiteEdicion)) {
                throw new IllegalArgumentException(
                        "No se pueden editar ventas con más de 24 horas de antigüedad. " +
                                "Fecha de la venta: " + venta.getFecha() + ". Contacte al administrador.");
            }

            // Validar que la nueva fecha no sea demasiado antigua
            if (nuevaFecha.isBefore(limiteEdicion)) {
                throw new IllegalArgumentException(
                        "No se puede cambiar la fecha a una anterior a " + limiteEdicion +
                                " (más de 24 horas atrás)");
            }
        }

        // Obtener usuario actual para auditoría (ya obtenido anteriormente, se
        // reutiliza)
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
                ahora);

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

        // ✅ SEGREGACIÓN: Validar que la venta pertenece a la sucursal del usuario
        Long sucursalId = SucursalContext.getSucursalId();

        // Verificar que la venta existe
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));

        // Validar que la venta pertenece a la sucursal del usuario
        if (venta.getSucursal() == null || !venta.getSucursal().getId().equals(sucursalId)) {
            throw new ResourceNotFoundException("Venta no encontrada en su sucursal");
        }

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
