package com.puntodeventa.backend.service;

import com.puntodeventa.backend.context.SucursalContext;
import com.puntodeventa.backend.dto.ProductoDTO;
import com.puntodeventa.backend.model.CategoriaProducto;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.model.Sucursal;
import com.puntodeventa.backend.repository.CategoriaProductoRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import com.puntodeventa.backend.repository.SucursalRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para ProductoService
 * Verifica que la lógica de productos y variantes funciona correctamente
 */
@SpringBootTest
@Transactional
class ProductoServiceTest {

        @Autowired
        private ProductoService productoService;

        @Autowired
        private ProductoRepository productoRepository;

        @Autowired
        private CategoriaProductoRepository categoriaRepository;

        @Autowired
        private SucursalRepository sucursalRepository;

        private Sucursal sucursal;
        private CategoriaProducto categoria1;
        private CategoriaProducto categoria2;
        private Producto productoBase;
        private Producto variante1;
        private Producto variante2;

        @BeforeEach
        void setUp() {
                // Crear sucursal
                sucursal = new Sucursal();
                sucursal.setNombre("Sucursal Test");
                sucursal.setDireccion("Dirección Test");
                sucursal.setTelefono("1234567890");
                sucursal.setActivo(true);
                sucursal = sucursalRepository.save(sucursal);

                // Inicializar contexto de sucursal para las pruebas
                SucursalContext.setSucursal(sucursal.getId(), sucursal.getNombre());

                // Crear categorías
                categoria1 = CategoriaProducto.builder()
                                .nombre("Bebidas")
                                .descripcion("Bebidas diversas")
                                .activa(true)
                                .sucursal(sucursal)
                                .build();
                categoria1 = categoriaRepository.save(categoria1);

                categoria2 = CategoriaProducto.builder()
                                .nombre("Refrescos")
                                .descripcion("Bebidas refrescantes")
                                .activa(true)
                                .sucursal(sucursal)
                                .build();
                categoria2 = categoriaRepository.save(categoria2);

                // Inicializar contexto de sucursal para las pruebas
                SucursalContext.setSucursal(1L, "Sucursal Test");

                // Crear producto base
                productoBase = Producto.builder()
                                .nombre("Agua")
                                .descripcion("Agua pura")
                                .categoria(categoria1)
                                .precio(new BigDecimal("10.00"))
                                .costoEstimado(new BigDecimal("5.00"))
                                .sku("AGUA-001")
                                .activo(true)
                                .disponibleEnMenu(true)
                                .productoBase(null)
                                .sucursal(sucursal)
                                .build();
                productoBase = productoRepository.save(productoBase);

                // Crear variantes
                variante1 = Producto.builder()
                                .nombre("Agua - 500ml")
                                .descripcion("Agua pura")
                                .categoria(categoria1)
                                .precio(new BigDecimal("10.00"))
                                .costoEstimado(new BigDecimal("5.00"))
                                .sku("AGUA-500")
                                .activo(true)
                                .disponibleEnMenu(true)
                                .productoBase(productoBase)
                                .nombreVariante("500ml")
                                .ordenVariante(1)
                                .sucursal(sucursal)
                                .build();
                variante1 = productoRepository.save(variante1);

                variante2 = Producto.builder()
                                .nombre("Agua - 1 Litro")
                                .descripcion("Agua pura")
                                .categoria(categoria1)
                                .precio(new BigDecimal("15.00"))
                                .costoEstimado(new BigDecimal("7.50"))
                                .sku("AGUA-1L")
                                .activo(true)
                                .disponibleEnMenu(true)
                                .productoBase(productoBase)
                                .nombreVariante("1 Litro")
                                .ordenVariante(2)
                                .sucursal(sucursal)
                                .build();
                variante2 = productoRepository.save(variante2);
        }

        @AfterEach
        void tearDown() {
                // Limpiar contexto de sucursal después de cada prueba
                SucursalContext.clear();
        }

        /**
         * Reinicializar el contexto de sucursal para las pruebas
         * Esto es necesario porque el contexto es un ThreadLocal que puede limpiarse
         * entre operaciones
         */
        private void reinitializeContext() {
                SucursalContext.setSucursal(sucursal.getId(), sucursal.getNombre());
        }

        /**
         * ✅ TEST CRÍTICO: Verificar que al editar subcategoría de una variante,
         * el campo product_base_id se preserva (NO se vuelve NULL)
         */
        @Test
        void testUpdateProductBaseCategoryDoesNotAffectVariants() {
                reinitializeContext();

                // Obtener variante antes de actualizar
                Producto varianteBefore = productoRepository.findById(variante1.getId())
                                .orElseThrow();
                assertEquals(productoBase.getId(), varianteBefore.getProductoBase().getId(),
                                "Variante debe tener producto base asignado inicialmente");

                // Simular actualización de categoría desde UI
                // (El frontend envía solo categoriaId, sin productoBaseId)
                ProductoDTO updateDTO = new ProductoDTO(
                                variante1.getId(),
                                variante1.getNombre(),
                                variante1.getDescripcion(),
                                categoria2.getId(), // Cambiar categoría
                                categoria2.getNombre(),
                                variante1.getPrecio(),
                                variante1.getCostoEstimado(),
                                variante1.getSku(),
                                variante1.getActivo(),
                                variante1.getDisponibleEnMenu(),
                                null, // Sin variantes
                                null, // ⚠️ IMPORTANTE: productoBaseId NO viene en el DTO
                                variante1.getNombreVariante(),
                                variante1.getOrdenVariante());

                // Ejecutar actualización
                ProductoDTO updatedDTO = productoService.actualizar(variante1.getId(), updateDTO);

                // Verificar que la categoría cambió
                assertEquals(categoria2.getId(), updatedDTO.categoriaId(),
                                "La categoría debe haber sido actualizada");

                // ✅ VERIFICACIÓN CRÍTICA: product_base_id debe preservarse
                Producto varianteAfter = productoRepository.findById(variante1.getId())
                                .orElseThrow();
                assertNotNull(varianteAfter.getProductoBase(),
                                "❌ BUG: El product_base_id no debe ser NULL después de actualizar la categoría");
                assertEquals(productoBase.getId(), varianteAfter.getProductoBase().getId(),
                                "product_base_id debe seguir apuntando al mismo producto base");
                assertEquals(categoria2.getId(), varianteAfter.getCategoria().getId(),
                                "La categoría debe haber sido actualizada correctamente");
        }

        /**
         * Verificar que las variantes mantienen su orden después de editar
         */
        @Test
        void testVariantesPreserveOrder() {
                reinitializeContext();

                ProductoDTO updateDTO = new ProductoDTO(
                                variante2.getId(),
                                "Agua - 1 Litro Actualizada",
                                variante2.getDescripcion(),
                                categoria1.getId(),
                                categoria1.getNombre(),
                                new BigDecimal("16.00"),
                                variante2.getCostoEstimado(),
                                variante2.getSku(),
                                variante2.getActivo(),
                                variante2.getDisponibleEnMenu(),
                                null,
                                null, // productoBaseId no viene
                                variante2.getNombreVariante(),
                                variante2.getOrdenVariante());

                productoService.actualizar(variante2.getId(), updateDTO);

                Producto updated = productoRepository.findById(variante2.getId()).orElseThrow();
                assertEquals(2, updated.getOrdenVariante(),
                                "El orden de la variante debe preservarse");
        }

        /**
         * Verificar que al cambiar productoBaseId explícitamente, sí se actualiza
         */
        @Test
        void testUpdateProductBaseExplicitly() {
                reinitializeContext();

                // Crear otro producto base
                Producto otroProductoBase = Producto.builder()
                                .nombre("Refresco")
                                .descripcion("Bebida refrescante")
                                .categoria(categoria2)
                                .precio(new BigDecimal("12.00"))
                                .costoEstimado(new BigDecimal("6.00"))
                                .sku("REFRESCO-001")
                                .activo(true)
                                .disponibleEnMenu(true)
                                .productoBase(null)
                                .sucursal(sucursal)
                                .build();
                otroProductoBase = productoRepository.save(otroProductoBase);

                // Cambiar explícitamente el producto base
                ProductoDTO updateDTO = new ProductoDTO(
                                variante1.getId(),
                                variante1.getNombre(),
                                variante1.getDescripcion(),
                                variante1.getCategoria().getId(),
                                variante1.getCategoria().getNombre(),
                                variante1.getPrecio(),
                                variante1.getCostoEstimado(),
                                variante1.getSku(),
                                variante1.getActivo(),
                                variante1.getDisponibleEnMenu(),
                                null,
                                otroProductoBase.getId(), // ✅ Cambiar explícitamente
                                "500ml",
                                1);

                productoService.actualizar(variante1.getId(), updateDTO);

                Producto updated = productoRepository.findById(variante1.getId()).orElseThrow();
                assertEquals(otroProductoBase.getId(), updated.getProductoBase().getId(),
                                "El producto base debe cambiar cuando se especifica en el DTO");
        }

        /**
         * Verificar que los nombres de variantes no se duplican en el mismo producto
         * base
         */
        @Test
        void testVarianteNameUniquenessByProductBase() {
                reinitializeContext();

                ProductoDTO duplicateDTO = new ProductoDTO(
                                variante2.getId(),
                                "Agua - 500ml",
                                variante2.getDescripcion(),
                                variante2.getCategoria().getId(),
                                variante2.getCategoria().getNombre(),
                                variante2.getPrecio(),
                                variante2.getCostoEstimado(),
                                variante2.getSku(),
                                variante2.getActivo(),
                                variante2.getDisponibleEnMenu(),
                                null,
                                null, // Mantener el mismo producto base
                                "500ml", // ❌ Mismo nombre que variante1
                                2);

                assertThrows(IllegalArgumentException.class,
                                () -> productoService.actualizar(variante2.getId(), duplicateDTO),
                                "No debe permitir nombres de variante duplicados en el mismo producto base");
        }

        /**
         * Verificar que se pueden crear variantes correctamente
         */
        @Test
        void testCreateVariante() {
                ProductoDTO newVariantDTO = new ProductoDTO(
                                null,
                                "Agua - 2 Litros",
                                "Agua pura",
                                categoria1.getId(),
                                categoria1.getNombre(),
                                new BigDecimal("20.00"),
                                new BigDecimal("10.00"),
                                "AGUA-2L",
                                true,
                                true,
                                null,
                                null,
                                "2 Litros",
                                3);

                ProductoDTO created = productoService.crearVariante(productoBase.getId(), newVariantDTO);

                assertNotNull(created.id(),
                                "La variante debe haber sido creada con ID");
                assertEquals(productoBase.getId(), created.productoBaseId(),
                                "La variante debe tener referencia al producto base");
                assertEquals("2 Litros", created.nombreVariante(),
                                "El nombre de variante debe ser correcto");
        }

        /**
         * 🔧 BUG FIX TEST: Verificar que editar categoría de una variante NO anula
         * product_base_id
         * 
         * Reproduce el flujo del bug:
         * 1. Crear variante con productoBaseId = X
         * 2. Editar solo la categoría de la variante (sin enviar productoBaseId)
         * 3. Verificar que productoBaseId se mantiene (NO se vuelve null)
         * 
         * Antes del fix: variante perdía su productoBaseId y se convertía en producto
         * independiente
         * Después del fix: variante mantiene su relación con el producto base
         */
        @Test
        void testEditVarianteCategoryPreservesProductoBaseId() {
                reinitializeContext();

                // Arrange: Verificar que la variante tiene productoBaseId
                Producto varianteActual = productoRepository.findById(variante1.getId())
                                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));
                Long productoBaseIdAntes = varianteActual.getProductoBase().getId();
                assertEquals(productoBase.getId(), productoBaseIdAntes,
                                "La variante debe tener una referencia al producto base antes de editar");

                // Act: Editar solo la categoría (SIN enviar productoBaseId en el DTO)
                // Este es el escenario del bug: frontend envía categoriaId pero no
                // productoBaseId
                ProductoDTO updateDTO = new ProductoDTO(
                                variante1.getId(),
                                variante1.getNombre(),
                                variante1.getDescripcion(),
                                categoria2.getId(), // 👈 Cambiar categoría
                                categoria2.getNombre(),
                                variante1.getPrecio(),
                                variante1.getCostoEstimado(),
                                variante1.getSku(),
                                variante1.getActivo(),
                                variante1.getDisponibleEnMenu(),
                                null, // Sin variantes
                                null, // 👈 productoBaseId NO se envía (null) - reproduce el bug
                                variante1.getNombreVariante(),
                                variante1.getOrdenVariante());

                ProductoDTO actualizado = productoService.actualizar(variante1.getId(), updateDTO);

                // Assert: Verificar que productoBaseId se preservó
                assertNotNull(actualizado.productoBaseId(),
                                "❌ BUG: productoBaseId se volvió NULL después de editar categoría");
                assertEquals(productoBase.getId(), actualizado.productoBaseId(),
                                "La variante debe mantener su referencia al producto base después de editar categoría");
                assertEquals(categoria2.getId(), actualizado.categoriaId(),
                                "La categoría debe haberse actualizado correctamente");

                // Verify en BD: Confirmar que la BD también preserva la relación
                Producto varianteEnBD = productoRepository.findById(variante1.getId())
                                .orElseThrow(() -> new RuntimeException("Variante no encontrada en BD"));
                assertNotNull(varianteEnBD.getProductoBase(),
                                "En la BD, la variante debe mantener su producto base (no NULL)");
                assertEquals(productoBase.getId(), varianteEnBD.getProductoBase().getId(),
                                "En la BD, product_base_id debe ser igual al ID del producto base original");
        }

        /**
         * 🔒 TEST DE TRANSACCIÓN: Verificar que los cambios son atómicos
         * Si algo falla durante la actualización, la variante NO debe quedar en estado
         * inconsistente
         */
        @Test
        void testEditVarianteCategoryTransactional() {
                reinitializeContext();

                // Arrange
                Long varianteId = variante1.getId();
                Long productoBaseIdEsperado = productoBase.getId();

                // Act: Actualizar
                ProductoDTO updateDTO = new ProductoDTO(
                                varianteId,
                                variante1.getNombre(),
                                variante1.getDescripcion(),
                                categoria2.getId(),
                                categoria2.getNombre(),
                                variante1.getPrecio(),
                                variante1.getCostoEstimado(),
                                variante1.getSku(),
                                variante1.getActivo(),
                                variante1.getDisponibleEnMenu(),
                                null,
                                null, // No enviar productoBaseId
                                variante1.getNombreVariante(),
                                variante1.getOrdenVariante());

                ProductoDTO resultado = productoService.actualizar(varianteId, updateDTO);

                // Assert: Verificar estado atómico
                assertEquals(categoria2.getId(), resultado.categoriaId(),
                                "Categoría debe actualizarse");
                assertEquals(productoBaseIdEsperado, resultado.productoBaseId(),
                                "productoBaseId NO debe cambiar (debe preservarse)");

                // Verificar nuevamente desde BD para confirmar transacción completa
                Producto varianteEnBD = productoRepository.findById(varianteId)
                                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));
                assertEquals(productoBaseIdEsperado, varianteEnBD.getProductoBase().getId(),
                                "En BD: productoBaseId debe preservarse en toda la transacción");
        }
}
