package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.GastoDTO;
import com.puntodeventa.backend.exception.ResourceNotFoundException;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.model.Gasto;
import com.puntodeventa.backend.model.CategoriaGasto;
import com.puntodeventa.backend.repository.GastoRepository;
import com.puntodeventa.backend.repository.CategoriaGastoRepository;
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
 * Tests de segregación de datos por sucursal para GastoService.
 * 
 * Verifica que:
 * 1. Un usuario NO puede ver gastos de otra sucursal
 * 2. Un usuario NO puede modificar/eliminar gastos de otra sucursal
 * 3. Un usuario SÍ puede ver/modificar sus propios gastos
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("🔐 Segregación de Gastos por Sucursal")
class GastoServiceSegregationTest {

    @Mock
    private GastoRepository gastoRepository;

    @Mock
    private CategoriaGastoRepository categoriaGastoRepository;

    @InjectMocks
    private GastoService gastoService;

    private Sucursal sucursal1;
    private Sucursal sucursal2;
    private CategoriaGasto categoria;
    private Gasto gastoSucursal1;
    private Gasto gastoSucursal2;

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

        // Crear categoría de gasto
        categoria = new CategoriaGasto();
        categoria.setId(1L);
        categoria.setNombre("Servicios");

        // Crear gasto en sucursal 1
        gastoSucursal1 = new Gasto();
        gastoSucursal1.setId(100L);
        gastoSucursal1.setMonto(BigDecimal.valueOf(3000));
        gastoSucursal1.setFecha(LocalDateTime.now());
        gastoSucursal1.setCategoriaGasto(categoria);
        gastoSucursal1.setSucursal(sucursal1);

        // Crear gasto en sucursal 2
        gastoSucursal2 = new Gasto();
        gastoSucursal2.setId(200L);
        gastoSucursal2.setMonto(BigDecimal.valueOf(500));
        gastoSucursal2.setFecha(LocalDateTime.now());
        gastoSucursal2.setCategoriaGasto(categoria);
        gastoSucursal2.setSucursal(sucursal2);
    }

    // ============================================================
    // TESTS: obtenerPorId() - Validación de Segregación
    // ============================================================

    @Test
    @DisplayName("✅ Usuario de Sucursal 1 puede ver su propio gasto")
    void testObtenerPorId_UserSucursal1_AccessOwnGasto() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(100L)).thenReturn(Optional.of(gastoSucursal1));

        // Act
        GastoDTO resultado = gastoService.obtenerPorId(100L);

        // Assert
        assertNotNull(resultado);
        assertEquals(100L, resultado.id());
        assertEquals(1L, resultado.sucursalId());
        verify(gastoRepository).findById(100L);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 2 NO puede ver gasto de Sucursal 1")
    void testObtenerPorId_UserSucursal2_CantAccessSucursal1Gasto() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(gastoRepository.findById(100L)).thenReturn(Optional.of(gastoSucursal1));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.obtenerPorId(100L),
                "Debería lanzar ResourceNotFoundException cuando intenta acceder a gasto de otra sucursal");

        assertEquals("Gasto no encontrado en su sucursal", exception.getMessage());
        verify(gastoRepository).findById(100L);
    }

    @Test
    @DisplayName("✅ Usuario de Sucursal 2 puede ver su propio gasto")
    void testObtenerPorId_UserSucursal2_AccessOwnGasto() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(gastoRepository.findById(200L)).thenReturn(Optional.of(gastoSucursal2));

        // Act
        GastoDTO resultado = gastoService.obtenerPorId(200L);

        // Assert
        assertNotNull(resultado);
        assertEquals(200L, resultado.id());
        assertEquals(2L, resultado.sucursalId());
        verify(gastoRepository).findById(200L);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 1 NO puede ver gasto de Sucursal 2")
    void testObtenerPorId_UserSucursal1_CantAccessSucursal2Gasto() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(200L)).thenReturn(Optional.of(gastoSucursal2));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.obtenerPorId(200L),
                "Debería lanzar ResourceNotFoundException cuando intenta acceder a gasto de otra sucursal");

        assertEquals("Gasto no encontrado en su sucursal", exception.getMessage());
    }

    @Test
    @DisplayName("❌ Gasto sin sucursal asignada no puede ser accedido")
    void testObtenerPorId_GastoWithoutSucursal_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");

        Gasto gastoSinSucursal = new Gasto();
        gastoSinSucursal.setId(999L);
        gastoSinSucursal.setSucursal(null); // Sin sucursal asignada

        when(gastoRepository.findById(999L)).thenReturn(Optional.of(gastoSinSucursal));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.obtenerPorId(999L),
                "Debería lanzar excepción cuando gasto no tiene sucursal asignada");

        assertEquals("Gasto no encontrado en su sucursal", exception.getMessage());
    }

    // ============================================================
    // TESTS: eliminar() - Validación de Segregación
    // ============================================================

    @Test
    @DisplayName("✅ Usuario de Sucursal 1 puede eliminar su propio gasto")
    void testEliminar_UserSucursal1_DeleteOwnGasto() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(100L)).thenReturn(Optional.of(gastoSucursal1));

        // Act
        gastoService.eliminar(100L);

        // Assert
        verify(gastoRepository).findById(100L);
        verify(gastoRepository).delete(gastoSucursal1);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 2 NO puede eliminar gasto de Sucursal 1")
    void testEliminar_UserSucursal2_CantDeleteSucursal1Gasto() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(gastoRepository.findById(100L)).thenReturn(Optional.of(gastoSucursal1));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.eliminar(100L),
                "Debería lanzar excepción cuando intenta eliminar gasto de otra sucursal");

        assertEquals("Gasto no encontrado en su sucursal", exception.getMessage());
        verify(gastoRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("✅ Usuario de Sucursal 2 puede eliminar su propio gasto")
    void testEliminar_UserSucursal2_DeleteOwnGasto() {
        // Arrange
        SucursalContext.setSucursal(2L, "Sucursal 2");
        when(gastoRepository.findById(200L)).thenReturn(Optional.of(gastoSucursal2));

        // Act
        gastoService.eliminar(200L);

        // Assert
        verify(gastoRepository).findById(200L);
        verify(gastoRepository).delete(gastoSucursal2);
    }

    @Test
    @DisplayName("❌ Usuario de Sucursal 1 NO puede eliminar gasto de Sucursal 2")
    void testEliminar_UserSucursal1_CantDeleteSucursal2Gasto() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(200L)).thenReturn(Optional.of(gastoSucursal2));

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.eliminar(200L),
                "Debería lanzar excepción cuando intenta eliminar gasto de otra sucursal");

        assertEquals("Gasto no encontrado en su sucursal", exception.getMessage());
        verify(gastoRepository, never()).deleteById(any());
    }

    // ============================================================
    // TESTS: Casos extremos y seguridad
    // ============================================================

    @Test
    @DisplayName("❌ Gasto inexistente lanza ResourceNotFoundException")
    void testObtenerPorId_GastoNoExiste_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.obtenerPorId(999L),
                "Debería lanzar excepción cuando gasto no existe");

        assertEquals("Gasto no encontrado con id: 999", exception.getMessage());
    }

    @Test
    @DisplayName("❌ Eliminar gasto inexistente lanza excepción")
    void testEliminar_GastoNoExiste_ThrowsException() {
        // Arrange
        SucursalContext.setSucursal(1L, "Sucursal 1");
        when(gastoRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> gastoService.eliminar(999L),
                "Debería lanzar excepción cuando gasto no existe");

        assertEquals("Gasto no encontrado con id: 999", exception.getMessage());
    }

    @AfterEach
    void tearDown() {
        // Limpiar contexto después de cada test
        SucursalContext.clear();
    }
}
