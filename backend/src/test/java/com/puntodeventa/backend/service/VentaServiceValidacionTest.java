package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.VentaItemDTO;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.Rol;
import com.puntodeventa.backend.model.Usuario;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Auditoría 2026-09-11 (T1.7): reglas críticas de ventas.
 * - C1: precio del request ignorado para CAJERO, override solo ADMIN/GERENTE.
 * - C2: descuento máximo 10% para CAJERO, hasta subtotal para ADMIN/GERENTE.
 */
@DisplayName("🧮 Reglas de precio y descuento (C1/C2)")
class VentaServiceValidacionTest {

    // Los métodos probados (validarDescuento, resolverPrecioUnitarioServidor)
    // no tocan repos => instancia con dependencias null.
    private final VentaService service = new VentaService(null, null, null, null, null, null, null, null, null, null, null, null);

    private Usuario usuarioConRol(String rolNombre) {
        Rol rol = new Rol();
        rol.setNombre(rolNombre);
        Usuario usuario = new Usuario();
        usuario.setUsername("test");
        usuario.setRol(rol);
        return usuario;
    }

    private Producto productoPrecio(BigDecimal precio) {
        Producto producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Producto Test");
        producto.setPrecio(precio);
        return producto;
    }

    private VentaItemDTO itemPrecio(BigDecimal precio) {
        return new VentaItemDTO(null, 1L, "Producto Test", 1, precio, null, null, null, null, null, null, null);
    }

    // ============================================================
    // C1: resolverPrecioUnitarioServidor
    // ============================================================

    @Test
    @DisplayName("✅ CAJERO con precio distinto al de BD: se usa precio de BD")
    void testResolverPrecio_Cajero_IgnoraPrecioRequest() {
        Producto producto = productoPrecio(new BigDecimal("50.00"));
        VentaItemDTO item = itemPrecio(new BigDecimal("10.00"));

        BigDecimal result = service.resolverPrecioUnitarioServidor(item, producto, usuarioConRol("CAJERO"));

        assertEquals(new BigDecimal("50.00"), result, "El cajero no puede cambiar el precio");
    }

    @Test
    @DisplayName("✅ ADMIN con precio distinto al de BD: se permite override")
    void testResolverPrecio_Admin_PermiteOverride() {
        Producto producto = productoPrecio(new BigDecimal("50.00"));
        VentaItemDTO item = itemPrecio(new BigDecimal("10.00"));

        BigDecimal result = service.resolverPrecioUnitarioServidor(item, producto, usuarioConRol("ADMIN"));

        assertEquals(new BigDecimal("10.00"), result, "El admin puede override el precio");
    }

    @Test
    @DisplayName("✅ Precio null en request: se usa precio de BD")
    void testResolverPrecio_SinPrecioRequest_UsaPrecioBD() {
        Producto producto = productoPrecio(new BigDecimal("50.00"));
        VentaItemDTO item = itemPrecio(null);

        BigDecimal result = service.resolverPrecioUnitarioServidor(item, producto, usuarioConRol("CAJERO"));

        assertEquals(new BigDecimal("50.00"), result);
    }

    @Test
    @DisplayName("✅ Precio de request igual al de BD: no hay override")
    void testResolverPrecio_PrecioIgual_UsaPrecioBD() {
        Producto producto = productoPrecio(new BigDecimal("50.00"));
        VentaItemDTO item = itemPrecio(new BigDecimal("50.00"));

        BigDecimal result = service.resolverPrecioUnitarioServidor(item, producto, usuarioConRol("CAJERO"));

        assertEquals(new BigDecimal("50.00"), result);
    }

    // ============================================================
    // C2: validarDescuento
    // ============================================================

    @Test
    @DisplayName("✅ CAJERO: descuento exacto al 10% es permitido")
    void testDescuento_Cajero_10PorcientoPermitido() {
        service.validarDescuento(new BigDecimal("10.00"), new BigDecimal("100.00"), usuarioConRol("CAJERO"));
    }

    @Test
    @DisplayName("❌ CAJERO: descuento mayor al 10% lanza excepción")
    void testDescuento_Cajero_MasDe10PorcientoLanza() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.validarDescuento(new BigDecimal("10.01"), new BigDecimal("100.00"),
                        usuarioConRol("CAJERO")));
        assertEquals("Descuento fuera de rango para cajero: máximo 10% del subtotal ($10.0000), solicitado $10.01",
                ex.getMessage());
    }

    @Test
    @DisplayName("✅ GERENTE: descuento hasta el subtotal completo es permitido")
    void testDescuento_Gerente_DescuentoTotalPermitido() {
        service.validarDescuento(new BigDecimal("100.00"), new BigDecimal("100.00"), usuarioConRol("GERENTE"));
    }

    @Test
    @DisplayName("❌ Descuento negativo lanza excepción")
    void testDescuento_Negativo_Lanza() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validarDescuento(new BigDecimal("-1.00"), new BigDecimal("100.00"),
                        usuarioConRol("ADMIN")));
    }

    @Test
    @DisplayName("❌ Descuento mayor al subtotal lanza excepción")
    void testDescuento_MayorQueSubtotal_Lanza() {
        assertThrows(IllegalArgumentException.class,
                () -> service.validarDescuento(new BigDecimal("101.00"), new BigDecimal("100.00"),
                        usuarioConRol("ADMIN")));
    }
}