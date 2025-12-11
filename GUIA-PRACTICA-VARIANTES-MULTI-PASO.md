# Guía Práctica de Implementación: Variantes Multi-Paso

## 📂 Estructura de Archivos por Crear/Modificar

### Backend (Java 21)

```
src/main/java/com/puntodeventa/backend/
├── model/
│   ├── ProductoTamaño.java          [CREAR]
│   ├── ProductoVarianteTamaño.java  [CREAR]
│   ├── ProductoAtributo.java        [CREAR]
│   ├── ProductoAtributoOpcion.java  [CREAR]
│   └── Producto.java                [MODIFICAR]
│
├── dto/
│   ├── ProductoDTO.java             [MODIFICAR]
│   ├── TamañoDTO.java               [CREAR]
│   ├── AtributoDTO.java             [CREAR]
│   ├── CarritoItemDTO.java          [CREAR/MODIFICAR]
│   └── SeleccionVarianteDTO.java    [CREAR]
│
├── repository/
│   ├── ProductoTamañoRepository.java        [CREAR]
│   ├── ProductoAtributoRepository.java      [CREAR]
│   ├── ProductoAtributoOpcionRepository.java [CREAR]
│   └── ProductoRepository.java              [MODIFICAR]
│
├── service/
│   ├── ProductoTamañoService.java          [CREAR]
│   ├── ProductoAtributoService.java        [CREAR]
│   └── ProductoService.java                [MODIFICAR]
│
└── controller/
    ├── ProductoTamañoController.java        [CREAR]
    ├── ProductoAtributoController.java      [CREAR]
    └── ProductoController.java              [MODIFICAR]

resources/db/migration/
└── V20251210__Add_Producto_Variantes_Attributes.sql [CREAR]
```

### Frontend (React Native)

```
frontend/src/
├── screens/
│   ├── MenuScreen.tsx                       [MODIFICAR]
│   └── AdminProductosScreen.tsx             [CREAR/MODIFICAR]
│
├── components/
│   ├── ProductoVariantesModal.tsx           [CREAR]
│   ├── variantes/
│   │   ├── VariantesStep.tsx                [CREAR]
│   │   ├── TamañosStep.tsx                  [CREAR]
│   │   ├── AtributosStep.tsx                [CREAR]
│   │   └── ResumenSeleccionStep.tsx         [CREAR]
│   │
│   ├── admin/
│   │   ├── AdminProductosDetalles.tsx       [CREAR]
│   │   ├── tabs/
│   │   │   ├── TabTamaños.tsx               [CREAR]
│   │   │   ├── TabAtributos.tsx             [CREAR]
│   │   │   ├── ModalTamaño.tsx              [CREAR]
│   │   │   ├── ModalAtributo.tsx            [CREAR]
│   │   │   └── ModalOpcion.tsx              [CREAR]
│   │   └── ...
│   │
│   └── ...
│
├── types/
│   ├── menu.ts                              [MODIFICAR]
│   └── admin.ts                             [CREAR]
│
└── services/
    └── api.ts                               [MODIFICAR]
```

---

## 🔧 PASO A PASO: IMPLEMENTACIÓN

### ✅ PASO 1: Backend - Entidades JPA

#### 1.1 Modificar Producto.java

Agregar relaciones (en el archivo actual):

```java
// En Producto.java - agregar después de las relaciones existentes

/**
 * Tamaños disponibles para esta variante o producto base.
 * Si este es un producto base, aquí van los tamaños generales.
 */
@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
@JoinTable(
    name = "producto_variante_tamaño",
    joinColumns = @JoinColumn(name = "producto_id"),
    inverseJoinColumns = @JoinColumn(name = "tamaño_id")
)
@OrderBy("ordenVariante ASC")
private List<ProductoTamaño> tamaños = new ArrayList<>();

/**
 * Atributos (ingredientes, toppings, etc.) disponibles.
 */
@OneToMany(mappedBy = "producto", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
@OrderBy("orden ASC")
private List<ProductoAtributo> atributos = new ArrayList<>();
```

#### 1.2 Crear ProductoTamaño.java

```java
package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "producto_tamaño")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoTamaño {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre del tamaño es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "precio_extra", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precioExtra = BigDecimal.ZERO;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime actualizadoEn = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }
}
```

#### 1.3 Crear ProductoAtributo.java

```java
package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "producto_atributo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @NotBlank(message = "El nombre del atributo es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotNull(message = "El tipo de atributo es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoAtributo tipo; // SIMPLE o MULTIPLE
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean requerido = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    @Builder.Default
    private Boolean activo = true;
    
    @OneToMany(mappedBy = "atributo", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<ProductoAtributoOpcion> opciones = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime actualizadoEn = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }
    
    public enum TipoAtributo {
        SIMPLE,    // Solo una opción seleccionable
        MULTIPLE   // Múltiples opciones seleccionables
    }
}
```

#### 1.4 Crear ProductoAtributoOpcion.java

```java
package com.puntodeventa.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "producto_atributo_opcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoAtributoOpcion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "atributo_id", nullable = false)
    private ProductoAtributo atributo;
    
    @NotBlank(message = "El nombre de la opción es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(name = "precio_extra", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precioExtra = BigDecimal.ZERO;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer orden = 0;
    
    @Column(nullable = false, columnDefinition = "INTEGER")
    @Builder.Default
    private Boolean activo = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime actualizadoEn = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.actualizadoEn = LocalDateTime.now();
    }
}
```

#### 1.5 Crear ProductoVarianteTamaño.java (si es necesaria entidad separada)

En realidad, la relación M-M puede manejarse directamente en Producto con `@ManyToMany`, así que este paso es OPCIONAL.

---

### ✅ PASO 2: Backend - DTOs (Records Java 21)

#### 2.1 Actualizar ProductoDTO.java

```java
package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para Producto con soporte para tamaños y atributos.
 * Usa Records de Java 21 para inmutabilidad y eficiencia.
 */
public record ProductoDTO(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precio,
        BigDecimal costoEstimado,
        String sku,
        Boolean activo,
        Boolean disponibleEnMenu,
        List<VarianteDTO> variantes,
        Long productoBaseId,
        String nombreVariante,
        Integer ordenVariante,
        // NUEVOS
        List<TamañoDTO> tamaños,
        List<AtributoDTO> atributos
) {
    public record VarianteDTO(
            Long id,
            String nombre,
            String nombreVariante,
            BigDecimal precio,
            Integer ordenVariante,
            // NUEVOS
            List<TamañoDTO> tamaños,
            List<AtributoDTO> atributos
    ) {}
    
    public record TamañoDTO(
            Long id,
            String nombre,
            String descripcion,
            BigDecimal precioExtra,
            Integer orden
    ) {}
    
    public record AtributoDTO(
            Long id,
            String nombre,
            String tipo,                    // SIMPLE|MULTIPLE
            Boolean requerido,
            Integer orden,
            List<OpcionDTO> opciones
    ) {
        public record OpcionDTO(
                Long id,
                String nombre,
                BigDecimal precioExtra,
                Integer orden
        ) {}
    }
}
```

#### 2.2 Crear CarritoItemDTO.java

```java
package com.puntodeventa.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTO para un item en el carrito.
 * Incluye información de variante, tamaño y atributos seleccionados.
 */
public record CarritoItemDTO(
        Long id,
        ProductoDTO producto,
        Long varianteId,
        Long tamañoId,
        Map<Long, List<Long>> atributosSeleccionados,  // atributoId -> [opcionIds]
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal,
        String detallesSeleccionados  // Para mostrar: "Mediano - Naranja, Zanahoria"
) {}
```

---

### ✅ PASO 3: Backend - Repositories

#### 3.1 Crear ProductoTamañoRepository.java

```java
package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoTamaño;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoTamañoRepository extends JpaRepository<ProductoTamaño, Long> {
    List<ProductoTamaño> findByActivoTrueOrderByOrden();
}
```

#### 3.2 Crear ProductoAtributoRepository.java

```java
package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoAtributo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoAtributoRepository extends JpaRepository<ProductoAtributo, Long> {
    List<ProductoAtributo> findByProductoIdAndActivoTrueOrderByOrden(Long productoId);
    
    List<ProductoAtributo> findByProductoId(Long productoId);
}
```

#### 3.3 Crear ProductoAtributoOpcionRepository.java

```java
package com.puntodeventa.backend.repository;

import com.puntodeventa.backend.model.ProductoAtributoOpcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoAtributoOpcionRepository extends JpaRepository<ProductoAtributoOpcion, Long> {
    List<ProductoAtributoOpcion> findByAtributoIdAndActivoTrueOrderByOrden(Long atributoId);
    
    List<ProductoAtributoOpcion> findByAtributoId(Long atributoId);
}
```

---

### ✅ PASO 4: Backend - Services

#### 4.1 Crear ProductoTamañoService.java

```java
package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoDTO.TamañoDTO;
import com.puntodeventa.backend.model.ProductoTamaño;
import com.puntodeventa.backend.repository.ProductoTamañoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoTamañoService {
    
    private final ProductoTamañoRepository repository;
    
    public TamañoDTO crearTamaño(String nombre, String descripcion, BigDecimal precioExtra, Integer orden) {
        ProductoTamaño tamaño = ProductoTamaño.builder()
            .nombre(nombre)
            .descripcion(descripcion)
            .precioExtra(precioExtra)
            .orden(orden)
            .activo(true)
            .build();
        
        ProductoTamaño guardado = repository.save(tamaño);
        log.info("Tamaño creado: {} (ID: {})", nombre, guardado.getId());
        
        return convertirADTO(guardado);
    }
    
    public TamañoDTO actualizarTamaño(Long id, String nombre, String descripcion, BigDecimal precioExtra, Integer orden) {
        ProductoTamaño tamaño = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tamaño no encontrado"));
        
        tamaño.setNombre(nombre);
        tamaño.setDescripcion(descripcion);
        tamaño.setPrecioExtra(precioExtra);
        tamaño.setOrden(orden);
        
        ProductoTamaño actualizado = repository.save(tamaño);
        log.info("Tamaño actualizado: {} (ID: {})", nombre, id);
        
        return convertirADTO(actualizado);
    }
    
    public void eliminarTamaño(Long id) {
        repository.deleteById(id);
        log.info("Tamaño eliminado (ID: {})", id);
    }
    
    @Transactional(readOnly = true)
    public List<TamañoDTO> obtenerTodosActivos() {
        return repository.findByActivoTrueOrderByOrden()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    private TamañoDTO convertirADTO(ProductoTamaño tamaño) {
        return new ProductoDTO.TamañoDTO(
            tamaño.getId(),
            tamaño.getNombre(),
            tamaño.getDescripcion(),
            tamaño.getPrecioExtra(),
            tamaño.getOrden()
        );
    }
}
```

#### 4.2 Crear ProductoAtributoService.java

```java
package com.puntodeventa.backend.service;

import com.puntodeventa.backend.dto.ProductoDTO.AtributoDTO;
import com.puntodeventa.backend.dto.ProductoDTO.AtributoDTO.OpcionDTO;
import com.puntodeventa.backend.model.ProductoAtributo;
import com.puntodeventa.backend.model.ProductoAtributoOpcion;
import com.puntodeventa.backend.model.Producto;
import com.puntodeventa.backend.repository.ProductoAtributoRepository;
import com.puntodeventa.backend.repository.ProductoAtributoOpcionRepository;
import com.puntodeventa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProductoAtributoService {
    
    private final ProductoAtributoRepository atributoRepository;
    private final ProductoAtributoOpcionRepository opcionRepository;
    private final ProductoRepository productoRepository;
    
    /**
     * Crear un nuevo atributo para un producto
     */
    public AtributoDTO crearAtributo(
        Long productoId,
        String nombre,
        String tipo,
        Boolean requerido,
        Integer orden
    ) {
        Producto producto = productoRepository.findById(productoId)
            .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        
        ProductoAtributo atributo = ProductoAtributo.builder()
            .producto(producto)
            .nombre(nombre)
            .tipo(ProductoAtributo.TipoAtributo.valueOf(tipo))
            .requerido(requerido)
            .orden(orden)
            .activo(true)
            .build();
        
        ProductoAtributo guardado = atributoRepository.save(atributo);
        log.info("Atributo creado: {} para producto ID: {}", nombre, productoId);
        
        return convertirADTO(guardado);
    }
    
    /**
     * Agregar una opción a un atributo
     */
    public OpcionDTO crearOpcion(
        Long atributoId,
        String nombre,
        BigDecimal precioExtra,
        Integer orden
    ) {
        ProductoAtributo atributo = atributoRepository.findById(atributoId)
            .orElseThrow(() -> new IllegalArgumentException("Atributo no encontrado"));
        
        ProductoAtributoOpcion opcion = ProductoAtributoOpcion.builder()
            .atributo(atributo)
            .nombre(nombre)
            .precioExtra(precioExtra)
            .orden(orden)
            .activo(true)
            .build();
        
        ProductoAtributoOpcion guardada = opcionRepository.save(opcion);
        log.info("Opción creada: {} en atributo ID: {}", nombre, atributoId);
        
        return convertirOpcionADTO(guardada);
    }
    
    /**
     * Obtener todos los atributos de un producto
     */
    @Transactional(readOnly = true)
    public List<AtributoDTO> obtenerAtributosProducto(Long productoId) {
        return atributoRepository.findByProductoIdAndActivoTrueOrderByOrden(productoId)
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Actualizar un atributo
     */
    public AtributoDTO actualizarAtributo(
        Long atributoId,
        String nombre,
        String tipo,
        Boolean requerido,
        Integer orden
    ) {
        ProductoAtributo atributo = atributoRepository.findById(atributoId)
            .orElseThrow(() -> new IllegalArgumentException("Atributo no encontrado"));
        
        atributo.setNombre(nombre);
        atributo.setTipo(ProductoAtributo.TipoAtributo.valueOf(tipo));
        atributo.setRequerido(requerido);
        atributo.setOrden(orden);
        
        ProductoAtributo actualizado = atributoRepository.save(atributo);
        log.info("Atributo actualizado: ID {}", atributoId);
        
        return convertirADTO(actualizado);
    }
    
    /**
     * Eliminar un atributo
     */
    public void eliminarAtributo(Long atributoId) {
        atributoRepository.deleteById(atributoId);
        log.info("Atributo eliminado: ID {}", atributoId);
    }
    
    /**
     * Actualizar una opción
     */
    public OpcionDTO actualizarOpcion(
        Long opcionId,
        String nombre,
        BigDecimal precioExtra,
        Integer orden
    ) {
        ProductoAtributoOpcion opcion = opcionRepository.findById(opcionId)
            .orElseThrow(() -> new IllegalArgumentException("Opción no encontrada"));
        
        opcion.setNombre(nombre);
        opcion.setPrecioExtra(precioExtra);
        opcion.setOrden(orden);
        
        ProductoAtributoOpcion actualizada = opcionRepository.save(opcion);
        log.info("Opción actualizada: ID {}", opcionId);
        
        return convertirOpcionADTO(actualizada);
    }
    
    /**
     * Eliminar una opción
     */
    public void eliminarOpcion(Long opcionId) {
        opcionRepository.deleteById(opcionId);
        log.info("Opción eliminada: ID {}", opcionId);
    }
    
    // ========== Conversión a DTOs ==========
    
    private AtributoDTO convertirADTO(ProductoAtributo atributo) {
        List<OpcionDTO> opciones = atributo.getOpciones()
            .stream()
            .map(this::convertirOpcionADTO)
            .collect(Collectors.toList());
        
        return new AtributoDTO(
            atributo.getId(),
            atributo.getNombre(),
            atributo.getTipo().name(),
            atributo.getRequerido(),
            atributo.getOrden(),
            opciones
        );
    }
    
    private OpcionDTO convertirOpcionADTO(ProductoAtributoOpcion opcion) {
        return new OpcionDTO(
            opcion.getId(),
            opcion.getNombre(),
            opcion.getPrecioExtra(),
            opcion.getOrden()
        );
    }
}
```

---

### ✅ PASO 5: Backend - Controllers

#### 5.1 Crear ProductoTamañoController.java

```java
package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoDTO.TamañoDTO;
import com.puntodeventa.backend.service.ProductoTamañoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/productos/tamaños")
@RequiredArgsConstructor
public class ProductoTamañoController {
    
    private final ProductoTamañoService service;
    
    @GetMapping
    public ResponseEntity<List<TamañoDTO>> obtenerTodos() {
        return ResponseEntity.ok(service.obtenerTodosActivos());
    }
    
    @PostMapping
    public ResponseEntity<TamañoDTO> crear(
        @RequestParam String nombre,
        @RequestParam(required = false) String descripcion,
        @RequestParam(required = false) BigDecimal precioExtra,
        @RequestParam(required = false) Integer orden
    ) {
        precioExtra = precioExtra != null ? precioExtra : BigDecimal.ZERO;
        orden = orden != null ? orden : 0;
        
        TamañoDTO created = service.crearTamaño(nombre, descripcion, precioExtra, orden);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TamañoDTO> actualizar(
        @PathVariable Long id,
        @RequestParam String nombre,
        @RequestParam(required = false) String descripcion,
        @RequestParam(required = false) BigDecimal precioExtra,
        @RequestParam(required = false) Integer orden
    ) {
        precioExtra = precioExtra != null ? precioExtra : BigDecimal.ZERO;
        orden = orden != null ? orden : 0;
        
        TamañoDTO updated = service.actualizarTamaño(id, nombre, descripcion, precioExtra, orden);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminarTamaño(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### 5.2 Crear ProductoAtributoController.java

```java
package com.puntodeventa.backend.controller;

import com.puntodeventa.backend.dto.ProductoDTO.AtributoDTO;
import com.puntodeventa.backend.dto.ProductoDTO.AtributoDTO.OpcionDTO;
import com.puntodeventa.backend.service.ProductoAtributoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/productos/{productoId}/atributos")
@RequiredArgsConstructor
public class ProductoAtributoController {
    
    private final ProductoAtributoService service;
    
    @GetMapping
    public ResponseEntity<List<AtributoDTO>> obtenerAtributos(@PathVariable Long productoId) {
        return ResponseEntity.ok(service.obtenerAtributosProducto(productoId));
    }
    
    @PostMapping
    public ResponseEntity<AtributoDTO> crearAtributo(
        @PathVariable Long productoId,
        @RequestParam String nombre,
        @RequestParam String tipo,           // SIMPLE|MULTIPLE
        @RequestParam(required = false) Boolean requerido,
        @RequestParam(required = false) Integer orden
    ) {
        requerido = requerido != null ? requerido : false;
        orden = orden != null ? orden : 0;
        
        AtributoDTO created = service.crearAtributo(productoId, nombre, tipo, requerido, orden);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{atributoId}")
    public ResponseEntity<AtributoDTO> actualizarAtributo(
        @PathVariable Long productoId,
        @PathVariable Long atributoId,
        @RequestParam String nombre,
        @RequestParam String tipo,
        @RequestParam(required = false) Boolean requerido,
        @RequestParam(required = false) Integer orden
    ) {
        requerido = requerido != null ? requerido : false;
        orden = orden != null ? orden : 0;
        
        AtributoDTO updated = service.actualizarAtributo(atributoId, nombre, tipo, requerido, orden);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{atributoId}")
    public ResponseEntity<Void> eliminarAtributo(
        @PathVariable Long productoId,
        @PathVariable Long atributoId
    ) {
        service.eliminarAtributo(atributoId);
        return ResponseEntity.noContent().build();
    }
    
    // ========== Opciones ==========
    
    @PostMapping("/{atributoId}/opciones")
    public ResponseEntity<OpcionDTO> crearOpcion(
        @PathVariable Long productoId,
        @PathVariable Long atributoId,
        @RequestParam String nombre,
        @RequestParam(required = false) BigDecimal precioExtra,
        @RequestParam(required = false) Integer orden
    ) {
        precioExtra = precioExtra != null ? precioExtra : BigDecimal.ZERO;
        orden = orden != null ? orden : 0;
        
        OpcionDTO created = service.crearOpcion(atributoId, nombre, precioExtra, orden);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{atributoId}/opciones/{opcionId}")
    public ResponseEntity<OpcionDTO> actualizarOpcion(
        @PathVariable Long productoId,
        @PathVariable Long atributoId,
        @PathVariable Long opcionId,
        @RequestParam String nombre,
        @RequestParam(required = false) BigDecimal precioExtra,
        @RequestParam(required = false) Integer orden
    ) {
        precioExtra = precioExtra != null ? precioExtra : BigDecimal.ZERO;
        orden = orden != null ? orden : 0;
        
        OpcionDTO updated = service.actualizarOpcion(opcionId, nombre, precioExtra, orden);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{atributoId}/opciones/{opcionId}")
    public ResponseEntity<Void> eliminarOpcion(
        @PathVariable Long productoId,
        @PathVariable Long atributoId,
        @PathVariable Long opcionId
    ) {
        service.eliminarOpcion(opcionId);
        return ResponseEntity.noContent().build();
    }
}
```

---

## 📋 Resumen de Implementación

**Backend - Total de Archivos:**
- ✅ 4 nuevas entidades JPA
- ✅ 2-3 nuevos DTOs
- ✅ 3 nuevos Repositories
- ✅ 2 nuevos Services
- ✅ 2 nuevos Controllers
- ✅ 1 Migration SQL

**Frontend - Total de Archivos:**
- ✅ 1 Modal principal
- ✅ 4 pasos/componentes
- ✅ 1 AdminProductosDetalles
- ✅ 3 tabs + modales
- ✅ Actualización de tipos

---

## 🚀 Próximas Secciones

Continuaré con:
1. **Migration SQL completa**
2. **Frontend - ProductoVariantesModal**
3. **Frontend - AdminProductosDetalles**
4. **Testing y ejemplos de uso**

¿Deseas que continúe con la implementación del frontend?
