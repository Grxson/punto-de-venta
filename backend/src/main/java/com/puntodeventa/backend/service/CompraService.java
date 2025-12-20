package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.*;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.mapper.InventarioMapper;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Servicio para gestión de compras.
 * ✅ Segregación por sucursal
 * ✅ Lógica automática: actualizar stock, crear gasto, crear movimientos
 * ✅ Optimizado para entrada masiva
 * ✅ Guardando preferencias de usuario
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompraService {

        private final CompraRepository compraRepository;
        private final CompraItemRepository compraItemRepository;
        private final SucursalRepository sucursalRepository;
        private final ProveedorRepository proveedorRepository;
        private final IngredienteRepository ingredienteRepository;
        private final UnidadRepository unidadRepository;
        private final UsuarioRepository usuarioRepository;
        private final GastoRepository gastoRepository;
        private final InventarioMovimientoRepository inventarioMovimientoRepository;
        private final CategoriaGastoRepository categoriaGastoRepository;
        private final InventarioMapper mapper;

        /**
         * Obtener compras de la sucursal actual (paginado).
         * ✅ SEGREGACIÓN: Solo datos de sucursal del usuario
         */
        public Page<CompraListadoDTO> obtenerCompras(Pageable pageable) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("📦 Obteniendo compras para sucursal: {}", sucursalId);

                return compraRepository.findBySucursalId(sucursalId, pageable)
                                .map(this::toListadoDTO);
        }

        /**
         * Obtener compra por ID (con seguridad).
         */
        public CompraDTO obtenerCompra(Long id) {
                Long sucursalId = SucursalContext.getSucursalId();

                Compra compra = compraRepository.findByIdWithItems(id, sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Compra no encontrada con ID: " + id));

                return toDTO(compra);
        }

        /**
         * Obtener compras por rango de fechas y estado.
         */
        public List<CompraDTO> obtenerPorFechasYEstado(
                        LocalDateTime inicio,
                        LocalDateTime fin,
                        String estado) {
                Long sucursalId = SucursalContext.getSucursalId();

                return compraRepository.findByFechasYEstado(sucursalId, inicio, fin, estado)
                                .stream()
                                .map(this::toDTO)
                                .toList();
        }

        /**
         * Obtener compras de un proveedor específico.
         */
        public Page<CompraListadoDTO> obtenerPorProveedor(Long proveedorId, Pageable pageable) {
                Long sucursalId = SucursalContext.getSucursalId();

                return compraRepository.findByProveedorId(sucursalId, proveedorId, pageable)
                                .map(this::toListadoDTO);
        }

        /**
         * Crear compra con items.
         * ✅ Lógica completa: Validar → Crear → Actualizar stock → Crear gasto → Crear
         * movimientos
         */
        @Transactional
        public CompraDTO crearCompra(CrearCompraRequest request) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("📦 Creando compra en sucursal: {}", sucursalId);

                // 1. Validar sucursal
                Sucursal sucursal = sucursalRepository.findById(sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada"));

                // 2. Validar proveedor
                Proveedor proveedor = proveedorRepository.findById(request.proveedorId())
                                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado"));

                // 3. Obtener usuario actual (para guardar preferencia)
                Usuario usuario = obtenerUsuarioActual();

                // 4. Procesar items primero para calcular montoTotal
                List<CompraItem> items = new ArrayList<>();
                BigDecimal montoTotal = BigDecimal.ZERO;

                LocalDateTime ahora = LocalDateTime.now(ZoneId.of("America/Mexico_City"));

                // Crear compra principal CON MONTO TEMPORAL (será actualizado después)
                Compra compra = Compra.builder()
                                .sucursal(sucursal)
                                .proveedor(proveedor)
                                .fecha(request.fecha() != null ? request.fecha() : ahora)
                                .estado("pendiente")
                                .montoTotal(BigDecimal.ZERO) // Inicializar con 0, se actualizará después
                                .notas(request.notas())
                                .numeroFactura(request.numeroFactura())
                                .usuario(usuario) // Guardando preferencia de usuario
                                .createdAt(ahora)
                                .build();

                compra = compraRepository.save(compra);
                log.info("✅ Compra creada con ID: {}", compra.getId());

                // 5. Procesar items (entrada masiva optimizada)
                for (CompraItemRequest itemReq : request.items()) {
                        // Validar ingrediente
                        Ingrediente ingrediente = ingredienteRepository.findById(itemReq.ingredienteId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Ingrediente no encontrado: " + itemReq.ingredienteId()));

                        // Validar unidad
                        Unidad unidad = unidadRepository.findById(itemReq.unidadId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Unidad no encontrada: " + itemReq.unidadId()));

                        // Crear item
                        CompraItem item = CompraItem.builder()
                                        .compra(compra)
                                        .ingrediente(ingrediente)
                                        .cantidad(itemReq.cantidad())
                                        .unidad(unidad)
                                        .precioTotal(itemReq.precioTotal())
                                        .cantidadRecibida(BigDecimal.ZERO)
                                        .build();

                        item = compraItemRepository.save(item);
                        items.add(item);

                        montoTotal = montoTotal.add(item.getSubtotal());

                        log.debug("  ✅ Item agregado: {} x {} @ ${} (total)",
                                        ingrediente.getNombre(),
                                        itemReq.cantidad(),
                                        itemReq.precioTotal());
                }

                // 6. Actualizar monto total
                compra.setMontoTotal(montoTotal);
                compra.setItems(items);
                compra = compraRepository.save(compra);

                log.info("📦 Compra completada. Total: ${}, Items: {}", montoTotal, items.size());

                return toDTO(compra);
        }

        /**
         * Marcar compra como recibida.
         * ✅ Lógica: Actualizar stock → Crear gasto → Crear movimientos
         */
        @Transactional
        public CompraDTO recibirCompra(Long id, RecibirCompraRequest request) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("📦 Recibiendo compra ID: {} en sucursal: {}", id, sucursalId);

                Compra compra = compraRepository.findByIdWithItems(id, sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));

                // 1. Mapear cantidades recibidas
                Map<Long, BigDecimal> cantidadesRecibidas = request.items().stream()
                                .collect(Collectors.toMap(
                                                RecibirItemRequest::itemId,
                                                RecibirItemRequest::cantidadRecibida));

                LocalDateTime ahora = LocalDateTime.now(ZoneId.of("America/Mexico_City"));

                // 2. Actualizar stock de ingredientes
                for (CompraItem item : compra.getItems()) {
                        BigDecimal cantidadRecibida = cantidadesRecibidas.getOrDefault(item.getId(),
                                        item.getCantidad());
                        item.setCantidadRecibida(cantidadRecibida);

                        Ingrediente ingrediente = item.getIngrediente();

                        // 2b. Actualizar costo unitario
                        ingrediente.setCostoUnitarioBase(item.getPrecioUnitario());

                        ingredienteRepository.save(ingrediente);
                        compraItemRepository.save(item);

                        log.debug("✅ Ingrediente actualizado: {} - Costo unitario: ${}",
                                        ingrediente.getNombre(),
                                        item.getPrecioUnitario());

                        // 3. Crear movimiento de inventario (ENTRADA)
                        InventarioMovimiento movimiento = InventarioMovimiento.builder()
                                        .ingrediente(ingrediente)
                                        .tipo("ENTRADA")
                                        .cantidad(cantidadRecibida)
                                        .unidad(item.getUnidad())
                                        .costoUnitario(item.getPrecioUnitario())
                                        .costoTotal(cantidadRecibida.multiply(item.getPrecioUnitario()))
                                        .fecha(ahora)
                                        .refTipo("COMPRA")
                                        .refId(compra.getId())
                                        .nota("Compra #" + compra.getId())
                                        .build();

                        inventarioMovimientoRepository.save(movimiento);
                        log.debug("✅ Movimiento creado: ENTRADA - {} {} por Compra #{}",
                                        cantidadRecibida, item.getUnidad().getNombre(), compra.getId());
                }

                // 4. Crear GASTO automáticamente (tipo: Compra Materia Prima)
                // Buscar categoría "Insumos" para la sucursal actual
                List<CategoriaGasto> categorias = categoriaGastoRepository.findBySucursalIdAndActivoTrue(sucursalId);
                CategoriaGasto categoriaCompra = categorias.stream()
                                .filter(c -> c.getNombre().equalsIgnoreCase("Insumos"))
                                .findFirst()
                                .orElseGet(() -> categorias.stream()
                                                .findFirst()
                                                .orElseThrow(() -> new ResourceNotFoundException(
                                                                "No hay categorías de gasto disponibles para esta sucursal")));

                Gasto gasto = Gasto.builder()
                                .categoriaGasto(categoriaCompra)
                                .tipoGasto("Compra")
                                .monto(compra.getMontoTotal())
                                .fecha(ahora)
                                .referencia("Compra #" + compra.getId())
                                .sucursal(compra.getSucursal())
                                .nota("Compra de materia prima a " + compra.getProveedor().getNombre())
                                .proveedor(compra.getProveedor())
                                .build();

                gastoRepository.save(gasto);
                log.info("💰 Gasto creado automáticamente: ${}  (Compra #{}) - Categoría: {}",
                                compra.getMontoTotal(), compra.getId(), categoriaCompra.getNombre());

                // 5. Actualizar estado a recibida
                compra.setEstado("recibida");
                compra.setUpdatedAt(ahora);
                compra = compraRepository.save(compra);

                log.info("✅ Compra #{} marcada como RECIBIDA", id);

                return toDTO(compra);
        }

        /**
         * Actualizar compra pendiente.
         */
        @Transactional
        public CompraDTO actualizarCompra(Long id, ActualizarCompraRequest request) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("📦 Actualizando compra ID: {}", id);

                Compra compra = compraRepository.findByIdWithItems(id, sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));

                // Solo se pueden actualizar compras pendientes
                if (!"pendiente".equals(compra.getEstado())) {
                        throw new IllegalStateException("Solo se pueden editar compras en estado PENDIENTE");
                }

                // Eliminar items anteriores
                compraItemRepository.deleteByCompraId(id);

                // Recrear items
                List<CompraItem> items = new ArrayList<>();
                BigDecimal montoTotal = BigDecimal.ZERO;

                for (CompraItemRequest itemReq : request.items()) {
                        Ingrediente ingrediente = ingredienteRepository.findById(itemReq.ingredienteId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Ingrediente no encontrado"));

                        Unidad unidad = unidadRepository.findById(itemReq.unidadId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Unidad no encontrada"));

                        CompraItem item = CompraItem.builder()
                                        .compra(compra)
                                        .ingrediente(ingrediente)
                                        .cantidad(itemReq.cantidad())
                                        .unidad(unidad)
                                        .precioTotal(itemReq.precioTotal())
                                        .cantidadRecibida(BigDecimal.ZERO)
                                        .build();

                        item = compraItemRepository.save(item);
                        items.add(item);
                        montoTotal = montoTotal.add(item.getSubtotal());
                }

                // Actualizar compra
                compra.setFecha(request.fecha() != null ? request.fecha() : compra.getFecha());
                compra.setNotas(request.notas());
                compra.setNumeroFactura(request.numeroFactura());
                compra.setMontoTotal(montoTotal);
                compra.setItems(items);
                compra.setUpdatedAt(LocalDateTime.now(ZoneId.of("America/Mexico_City")));

                compra = compraRepository.save(compra);
                log.info("✅ Compra actualizada");

                return toDTO(compra);
        }

        /**
         * Cancelar compra.
         */
        @Transactional
        public void cancelarCompra(Long id) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("📦 Cancelando compra ID: {}", id);

                Compra compra = compraRepository.findByIdWithItems(id, sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));

                if (!"pendiente".equals(compra.getEstado())) {
                        throw new IllegalStateException("Solo se pueden cancelar compras en estado PENDIENTE");
                }

                compra.setEstado("cancelada");
                compra.setUpdatedAt(LocalDateTime.now(ZoneId.of("America/Mexico_City")));
                compraRepository.save(compra);

                log.info("✅ Compra cancelada");
        }

        /**
         * Eliminar compra definitivamente (DELETE sin soft-delete).
         * ✅ Solo se pueden eliminar compras en estado PENDIENTE
         * ✅ Eliminación física (sin recuperación)
         */
        @Transactional
        public void eliminarCompra(Long id) {
                Long sucursalId = SucursalContext.getSucursalId();
                log.info("🗑️ Eliminando compra ID: {} (ELIMINACIÓN DEFINITIVA)", id);

                Compra compra = compraRepository.findByIdWithItems(id, sucursalId)
                                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada"));

                if (!"pendiente".equals(compra.getEstado())) {
                        throw new IllegalStateException("Solo se pueden eliminar compras en estado PENDIENTE");
                }

                // Eliminar items primero (por integridad referencial)
                compraItemRepository.deleteByCompraId(id);

                // Eliminar compra
                compraRepository.deleteById(id);

                log.info("✅ Compra eliminada definitivamente");
        }

        /**
         * Obtener preferencias de usuario (últimas compras para agilizar entrada).
         */
        public List<CompraDTO> obtenerUltimosProveedores(int limite) {
                Long sucursalId = SucursalContext.getSucursalId();
                Usuario usuario = obtenerUsuarioActual();

                if (usuario == null) {
                        return List.of();
                }

                return compraRepository.findUltimasDelUsuario(
                                sucursalId,
                                usuario.getId(),
                                org.springframework.data.domain.PageRequest.of(0, limite)).stream()
                                .map(this::toDTO)
                                .toList();
        }

        /**
         * Mappers (privados para conversión eficiente)
         */
        private CompraDTO toDTO(Compra compra) {
                return new CompraDTO(
                                compra.getId(),
                                compra.getSucursal().getId(),
                                compra.getSucursal().getNombre(),
                                compra.getProveedor().getId(),
                                compra.getProveedor().getNombre(),
                                compra.getFecha(),
                                compra.getMontoTotal(),
                                compra.getEstado(),
                                compra.getNotas(),
                                compra.getUsuario() != null ? compra.getUsuario().getId() : null,
                                compra.getUsuario() != null ? compra.getUsuario().getUsername() : null,
                                compra.getNumeroFactura(),
                                compra.getCreatedAt(),
                                compra.getUpdatedAt(),
                                compra.getItems() != null ? compra.getItems().stream()
                                                .map(this::itemToDTO)
                                                .toList() : List.of());
        }

        private CompraListadoDTO toListadoDTO(Compra compra) {
                return new CompraListadoDTO(
                                compra.getId(),
                                compra.getSucursal().getId(),
                                compra.getSucursal().getNombre(),
                                compra.getProveedor().getId(),
                                compra.getProveedor().getNombre(),
                                compra.getFecha(),
                                compra.getMontoTotal(),
                                compra.getEstado(),
                                compra.getNumeroFactura(),
                                compra.getItems() != null ? compra.getItems().size() : 0,
                                compra.getUsuario() != null ? compra.getUsuario().getUsername() : "Sistema");
        }

        private CompraItemDTO itemToDTO(CompraItem item) {
                return new CompraItemDTO(
                                item.getId(),
                                item.getIngrediente().getId(),
                                item.getIngrediente().getNombre(),
                                item.getCantidad(),
                                item.getUnidad().getId(),
                                item.getUnidad().getNombre(),
                                item.getPrecioTotal(),
                                item.getPrecioUnitario(),
                                item.getSubtotal(),
                                item.getCantidadRecibida());
        }

        /**
         * Obtener usuario actual (para guardar preferencias).
         */
        private Usuario obtenerUsuarioActual() {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                        String username = auth.getName();
                        return usuarioRepository.findByUsername(username).orElse(null);
                }
                return null;
        }
}
