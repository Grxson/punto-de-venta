package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.VentaDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.model.Venta;
import com.puntodeventa.backend.repository.VentaRepository;
import com.puntodeventa.backend.repository.InventarioMovimientoRepository;
import com.puntodeventa.backend.service.WebSocketNotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests de segregación de datos por sucursal para VentaService.
 * 
 * Verifica que:
 * 1. Un usuario NO puede ver ventas de otra sucursal
 * 2. Un usuario NO puede cancelar ventas de otra sucursal
 * 3. Un usuario SÍ puede ver/cancelar sus propias ventas
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("🔐 Segregación de Ventas por Sucursal")
class VentaServiceSegregationTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private InventarioMovimientoRepository inventarioMovimientoRepository;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    @InjectMocks
    private VentaService ventaService;

    private Sucursal sucursal1;
    private Sucursal sucursal2;
    private Venta ventaSucursal1;
    private Venta ventaSucursal2;

    @BeforeEach
    void setUp() {
        // Limpiar contexto antes de cada test
        SucursalContext.clear();

        // Crear sucursales de prueba
        sucursal1 = new Sucursal();
        sucursal1.setId(1L);
        sucursal1.setNombre("Sucursal 1 - Centro");

        sucursal2 = new Sucursal();
        sucursal2.setId(2L);
        sucursal2.setNombre("Sucursal 2 - Norte");

        // Crear venta en sucursal 1
        ventaSucursal1 = new Venta();
        ventaSucursal1.setId(100L);
        ventaSucursal1.setFecha(LocalDateTime.now());
        ventaSucursal1.setEstado("cerrada");
        ventaSucursal1.setTotal(BigDecimal.valueOf(500));
        ventaSucursal1.setSucursal(sucursal1);

        // Crear venta en sucursal 2
        ventaSucursal2 = new Venta();
        ventaSucursal2.setId(200L);
        ventaSucursal2.setFecha(LocalDateTime.now());
        ventaSucursal2.setEstado("cerrada");
        ventaSucursal2.setTotal(BigDecimal.valueOf(750));
        ventaSucursal2.setSucursal(sucursal2);
    }

    // ============================================================
    // TESTS: obtenerPorId() - Validación de Segregación
    // ============================================================

    @Test
    @DisplayName("✅ Usuario de Sucursal 1 puede ver su propia venta")
    void testObtenerPorId_UserSucursal1_AccessOwnVenta() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(ventaRepository.findById(100L)).thenReturn(Optional.of(ventaSucursal1));

        // Act
        VentaDTO resultado = ventaService.obtenerPorId(100L);

        // Assert
        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
        assertEquals(1L, resultado.sucursalId());
        verify(ventaRepository).findById(100L);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 2 NO puede ver venta de Sucursal 1")
    void testObtenerPorId_UserSucursal2_CantAccessSucursal1Venta() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(ventaRepository.findById(100L)).thenReturn(Optional.of(ventaSucursal1));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.obtenerPorId(100L),
                "Debería lanzar ResourceNotFoundException cuando intenta acceder a venta de otra sucursal");

        assertEquals("Venta no encontrada en su sucursal", exception.getMessage());
        verify(ventaRepository).findById(100L);
    }

    @Test
    @DisplayName("✅ Usuario de Sucursal 2 puede ver su propia venta")
    void testObtenerPorId_UserSucursal2_AccessOwnVenta() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(ventaRepository.findById(200L)).thenReturn(Optional.of(ventaSucursal2));

        // Act
        VentaDTO resultado = ventaService.obtenerPorId(200L);

        // Assert
        assertNotNull(resultado);
        assertEquals(200L, resultado.id());
        assertEquals(2L, resultado.sucursalId());
        verify(ventaRepository).findById(200L);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 1 NO puede ver venta de Sucursal 2")
    void testObtenerPorId_UserSucursal1_CantAccessSucursal2Venta() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(ventaRepository.findById(200L)).thenReturn(Optional.of(ventaSucursal2));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.obtenerPorId(200L),
                "Debería lanzar ResourceNotFoundException cuando intenta acceder a venta de otra sucursal");

        assertEquals("Venta no encontrada en su sucursal", exception.getMessage());
    }

    @Test
    @DisplayName("❌ Venta sin sucursal asignada no puede ser accedida")
    void testObtenerPorId_VentaWithoutSucursal_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");

        Venta ventaSinSucursal = new Venta();
        ventaSinSucursal.setId(999L);
        ventaSinSucursal.setSucursal(null); // Sin sucursal asignada

        when(ventaRepository.findById(999L)).thenReturn(Optional.of(ventaSinSucursal));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.obtenerPorId(999L),
                "Debería lanzar excepción cuando venta no tiene sucursal asignada");

        assertEquals("Venta no encontrada en su sucursal", exception.getMessage());
    }

    // ============================================================
    // TESTS: cancelarVenta() - Validación de Segregación
    // ============================================================

    @Test
    @DisplayName("✅ Usuario de Sucursal 1 puede cancelar su propia venta")
    void testCancelarVenta_UserSucursal1_CancelOwnVenta() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(ventaRepository.findById(100L)).thenReturn(Optional.of(ventaSucursal1));
        when(ventaRepository.save(any(Venta.class))).thenReturn(ventaSucursal1);
        when(inventarioMovimientoRepository.findByRefTipoAndRefId(any(), any())).thenReturn(java.util.List.of());

        // Act
        VentaDTO resultado = ventaService.cancelarVenta(100L, "Error en el registro");

        // Assert
        assertNotNull(resultado);
        assertEquals("cancelada", ventaSucursal1.getEstado());
        verify(ventaRepository).findById(100L);
        verify(ventaRepository).save(ventaSucursal1);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 2 NO puede cancelar venta de Sucursal 1")
    void testCancelarVenta_UserSucursal2_CantCancelSucursal1Venta() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(ventaRepository.findById(100L)).thenReturn(Optional.of(ventaSucursal1));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.cancelarVenta(100L, "Error en el registro"),
                "Debería lanzar excepción cuando intenta cancelar venta de otra sucursal");

        assertEquals("Venta no encontrada en su sucursal", exception.getMessage());

        // Verificar que la venta NO fue cancelada
        assertNotEquals("cancelada", ventaSucursal1.getEstado());
        verify(ventaRepository).findById(100L);
        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("✅ Usuario de Sucursal 2 puede cancelar su propia venta")
    void testCancelarVenta_UserSucursal2_CancelOwnVenta() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(ventaRepository.findById(200L)).thenReturn(Optional.of(ventaSucursal2));
        when(ventaRepository.save(any(Venta.class))).thenReturn(ventaSucursal2);
        when(inventarioMovimientoRepository.findByRefTipoAndRefId(any(), any())).thenReturn(java.util.List.of());

        // Act
        VentaDTO resultado = ventaService.cancelarVenta(200L, "Error en el registro");

        // Assert
        assertNotNull(resultado);
        assertEquals("cancelada", ventaSucursal2.getEstado());
        verify(ventaRepository).findById(200L);
        verify(ventaRepository).save(ventaSucursal2);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 1 NO puede cancelar venta de Sucursal 2")
    void testCancelarVenta_UserSucursal1_CantCancelSucursal2Venta() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(ventaRepository.findById(200L)).thenReturn(Optional.of(ventaSucursal2));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.cancelarVenta(200L, "Error en el registro"),
                "Debería lanzar excepción cuando intenta cancelar venta de otra sucursal");

        assertEquals("Venta no encontrada en su sucursal", exception.getMessage());

        // Verificar que la venta NO fue cancelada
        assertNotEquals("cancelada", ventaSucursal2.getEstado());
        verify(ventaRepository, never()).save(any());
    }

    @Test
    @DisplayName("❌ Cancelar venta sin motivo lanza excepción")
    void testCancelarVenta_SinMotivo_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> ventaService.cancelarVenta(100L, null),
                "Debería lanzar excepción cuando motivo es null");

        assertEquals("El motivo de cancelación es obligatorio", exception.getMessage());
        verify(ventaRepository, never()).findById(any());
    }

    @Test
    @DisplayName("❌ Cancelar venta ya cancelada lanza excepción")
    void testCancelarVenta_YaCancelada_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        ventaSucursal1.setEstado("cancelada"); // Ya está cancelada
        when(ventaRepository.findById(100L)).thenReturn(Optional.of(ventaSucursal1));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> ventaService.cancelarVenta(100L, "Error duplicado"),
                "Debería lanzar excepción cuando venta ya está cancelada");

        assertEquals("La venta ya está cancelada", exception.getMessage());
        verify(ventaRepository, never()).save(any());
    }

    // ============================================================
    // TESTS: Casos extremos y seguridad
    // ============================================================

    @Test
    @DisplayName("❌ Venta inexistente lanza ResourceNotFoundException")
    void testObtenerPorId_VentaNoExiste_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(ventaRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> ventaService.obtenerPorId(999L),
                "Debería lanzar excepción cuando venta no existe");

        assertEquals("Venta no encontrada con ID: 999", exception.getMessage());
    }

    @AfterEach
    void tearDown() {
        // Limpiar contexto después de cada test
        SucursalContext.clear();
    }
}
