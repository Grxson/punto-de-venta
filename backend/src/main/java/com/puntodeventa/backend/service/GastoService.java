package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.CrearGastoRequest;
import com.puntodeventa.backend.dto.GastoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.*;
import com.puntodeventa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Servicio para gestión de gastos operativos.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GastoService {
    
    private final GastoRepository gastoRepository;
    private final CategoriaGastoRepository categoriaGastoRepository;
    private final ProveedorRepository proveedorRepository;
    private final SucursalRepository sucursalRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final WebSocketNotificationService notificationService;
    
    public List<GastoDTO> obtenerTodos() {
        return gastoRepository.findAll().stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<GastoDTO> obtenerPorSucursal(Long sucursalId) {
        return gastoRepository.findBySucursalId(sucursalId).stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<GastoDTO> obtenerPorCategoria(Long categoriaGastoId) {
        return gastoRepository.findByCategoriaGastoId(categoriaGastoId).stream()
            .map(this::toDTO)
            .toList();
    }
    
    public List<GastoDTO> obtenerPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin) {
        return gastoRepository.findByFechaBetween(fechaInicio, fechaFin).stream()
            .map(this::toDTO)
            .toList();
    }
    
    public GastoDTO obtenerPorId(Long id) {
        Gasto gasto = gastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
        return toDTO(gasto);
    }
    
    @Transactional
    public GastoDTO crear(CrearGastoRequest request) {
        // Obtener categoría
        CategoriaGasto categoria = categoriaGastoRepository.findById(request.categoriaGastoId())
            .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + request.categoriaGastoId()));
        
        // Crear gasto
        Gasto gasto = Gasto.builder()
            .categoriaGasto(categoria)
            .monto(request.monto())
            .fecha(request.fecha() != null ? request.fecha() : LocalDateTime.now())
            .referencia(request.referencia())
            .nota(request.nota())
            .tipoGasto(request.tipoGasto() != null ? request.tipoGasto() : "Operacional")
            .comprobanteUrl(request.comprobanteUrl())
            .createdAt(LocalDateTime.now())
            .build();
        
        // Asignar proveedor si existe
        if (request.proveedorId() != null) {
            Proveedor proveedor = proveedorRepository.findById(request.proveedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + request.proveedorId()));
            gasto.setProveedor(proveedor);
        }
        
        // Asignar sucursal si existe
        if (request.sucursalId() != null) {
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con id: " + request.sucursalId()));
            gasto.setSucursal(sucursal);
        }
        
        // Asignar método de pago si existe
        if (request.metodoPagoId() != null) {
            MetodoPago metodoPago = metodoPagoRepository.findById(request.metodoPagoId())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con id: " + request.metodoPagoId()));
            gasto.setMetodoPago(metodoPago);
        }
        
        // Asignar usuario actual si está autenticado
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            Usuario usuario = usuarioRepository.findByUsername(auth.getName())
                .orElse(null);
            gasto.setUsuario(usuario);
        }
        
        Gasto guardado = gastoRepository.save(gasto);
        GastoDTO gastoDTO = toDTO(guardado);
        
        // Notificar creación de gasto en tiempo real (después del commit)
        // Usar TransactionSynchronizationManager para enviar después del commit
        long inicioNotificacion = System.currentTimeMillis();
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
            new org.springframework.transaction.support.TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    long tiempoCommit = System.currentTimeMillis() - inicioNotificacion;
                    org.slf4j.LoggerFactory.getLogger(GastoService.class)
                        .info("Gasto {} confirmado en BD. Tiempo transacción: {}ms. Enviando notificación WebSocket...", 
                            guardado.getId(), tiempoCommit);
                    
                    long inicioNotif = System.currentTimeMillis();
                    if (notificationService != null) {
                        notificationService.notificarEstadisticasActualizadas();
                        long tiempoNotif = System.currentTimeMillis() - inicioNotif;
                        org.slf4j.LoggerFactory.getLogger(GastoService.class)
                            .info("Notificación WebSocket enviada para gasto {}. Tiempo notificación: {}ms", 
                                guardado.getId(), tiempoNotif);
                    }
                }
            }
        );
        
        return gastoDTO;
    }
    
    @Transactional
    public void eliminar(Long id) {
        Gasto gasto = gastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
        gastoRepository.delete(gasto);
    }
    
    @Transactional
    public GastoDTO actualizar(Long id, CrearGastoRequest request) {
        Gasto gasto = gastoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado con id: " + id));
        
        // Actualizar categoría
        if (request.categoriaGastoId() != null) {
            CategoriaGasto categoria = categoriaGastoRepository.findById(request.categoriaGastoId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría de gasto no encontrada con id: " + request.categoriaGastoId()));
            gasto.setCategoriaGasto(categoria);
        }
        
        // Actualizar monto
        if (request.monto() != null) {
            gasto.setMonto(request.monto());
        }
        
        // Actualizar fecha
        if (request.fecha() != null) {
            gasto.setFecha(request.fecha());
        }
        
        // Actualizar nota
        if (request.nota() != null) {
            gasto.setNota(request.nota());
        }
        
        // Actualizar referencia
        if (request.referencia() != null) {
            gasto.setReferencia(request.referencia());
        }
        
        // Actualizar tipo de gasto
        if (request.tipoGasto() != null) {
            gasto.setTipoGasto(request.tipoGasto());
        }
        
        // Actualizar comprobante URL
        if (request.comprobanteUrl() != null) {
            gasto.setComprobanteUrl(request.comprobanteUrl());
        }
        
        // Actualizar proveedor
        if (request.proveedorId() != null) {
            Proveedor proveedor = proveedorRepository.findById(request.proveedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + request.proveedorId()));
            gasto.setProveedor(proveedor);
        } else {
            gasto.setProveedor(null);
        }
        
        // Actualizar sucursal
        if (request.sucursalId() != null) {
            Sucursal sucursal = sucursalRepository.findById(request.sucursalId())
                .orElseThrow(() -> new ResourceNotFoundException("Sucursal no encontrada con id: " + request.sucursalId()));
            gasto.setSucursal(sucursal);
        }
        
        // Actualizar método de pago
        if (request.metodoPagoId() != null) {
            MetodoPago metodoPago = metodoPagoRepository.findById(request.metodoPagoId())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con id: " + request.metodoPagoId()));
            gasto.setMetodoPago(metodoPago);
        }
        
        // Actualizar timestamp de edición
        gasto.setUpdatedAt(LocalDateTime.now());
        
        Gasto actualizado = gastoRepository.save(gasto);
        return toDTO(actualizado);
    }
    
    private GastoDTO toDTO(Gasto gasto) {
        return new GastoDTO(
            gasto.getId(),
            gasto.getCategoriaGasto() != null ? gasto.getCategoriaGasto().getId() : null,
            gasto.getCategoriaGasto() != null ? gasto.getCategoriaGasto().getNombre() : null,
            gasto.getProveedor() != null ? gasto.getProveedor().getId() : null,
            gasto.getProveedor() != null ? gasto.getProveedor().getNombre() : null,
            gasto.getSucursal() != null ? gasto.getSucursal().getId() : null,
            gasto.getSucursal() != null ? gasto.getSucursal().getNombre() : null,
            gasto.getMonto(),
            gasto.getFecha(),
            gasto.getMetodoPago() != null ? gasto.getMetodoPago().getId() : null,
            gasto.getMetodoPago() != null ? gasto.getMetodoPago().getNombre() : null,
            gasto.getReferencia(),
            gasto.getNota(),
            gasto.getComprobanteUrl(),
            gasto.getTipoGasto(),
            gasto.getUsuario() != null ? gasto.getUsuario().getId() : null,
            gasto.getUsuario() != null ? gasto.getUsuario().getNombre() : null,
            gasto.getCreatedAt()
        );
    }
}

